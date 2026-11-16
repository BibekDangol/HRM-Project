const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const ts = require('typescript');
const { PostgrestClient } = require('@supabase/postgrest-js');

// Run app modules in Node with native/network boundaries replaced.
function load(file, mocks) {
  const filename = path.join(__dirname, '..', file);
  const { outputText } = ts.transpileModule(readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
    fileName: filename,
  });
  const module = { exports: {} };
  vm.runInNewContext(outputText, {
    module, exports: module.exports, console,
    require: (id) => Object.hasOwn(mocks, id) ? mocks[id] : require(id),
  }, { filename });
  return module.exports;
}

const dashboardDates = load('src/utils/userDashboard.ts', {});

test('auth layout renders no raw text alongside its navigator', () => {
  const Layout = load('src/app/(auth)/_layout.tsx', {
    'expo-router': { Stack: 'Navigator' },
  }).default;
  function inspect(node) {
    if (Array.isArray(node)) return node.forEach(inspect);
    if (node == null || typeof node === 'boolean') return;
    assert.notEqual(typeof node, 'string', 'Raw text in auth layout');
    assert.notEqual(typeof node, 'number', 'Raw number in auth layout');
    inspect(node.props?.children);
  }
  inspect(Layout());
});

test('API requests use the current token and stop on session errors', async () => {
  let session = { access_token: 'original' };
  let error = null;
  const { apiClient } = load('src/api/apiClient.ts', {
    '@/src/supabase/supabaseClient': {
      supabase: { auth: { getSession: async () => ({ data: { session }, error }) } },
    },
  });
  let requests = 0;
  apiClient.defaults.adapter = async (config) => {
    requests++;
    return { data: config.headers.get('Authorization'), status: 200, headers: {}, config };
  };
  assert.equal((await apiClient.get('/test')).data, 'Bearer original');
  session = { access_token: 'refreshed' };
  assert.equal((await apiClient.get('/test')).data, 'Bearer refreshed');
  session = null;
  assert.equal((await apiClient.get('/test')).data, undefined);
  error = new Error('Refresh failed');
  await assert.rejects(apiClient.get('/test'), /Refresh failed/);
  assert.equal(requests, 3);
});

test('leave queries retain IDs so editing excludes only the current leave', async () => {
  const leaves = [
    { id: 'editing', start_date: '2026-11-10', end_date: '2026-11-10', days_count: 1 },
    { id: 'other', start_date: '2026-11-12', end_date: '2026-11-12', days_count: 2 },
  ];
  const db = new PostgrestClient('https://example.test', {
    fetch: async (input) => {
      const params = new URL(input).searchParams;
      assert.equal(params.get('user_id'), 'eq.user-1');
      const columns = params.get('select').split(',');
      return Response.json(leaves.map(row => Object.fromEntries(
        columns.filter(key => key in row).map(key => [key, row[key]]),
      )));
    },
  });
  const { fetchUserLeavesByYear } = load('src/services/leave.service.ts', {
    '../supabase/supabaseClient': { supabase: db },
    '../api/apiClient': { apiClient: {} },
  });
  const rows = await fetchUserLeavesByYear('user-1', '2026-01-01', '2026-12-31');
  const others = rows.filter(row => String(row.id) !== 'editing');
  assert.equal(others.length, 1);
  assert.equal(others[0].id, 'other');
  assert.equal(others.reduce((sum, row) => sum + row.days_count, 0), 2);
  assert.equal(others.some(row => '2026-11-10' >= row.start_date && '2026-11-10' <= row.end_date), false);
});

test('attendance restores and checks out the active session, not an absent record', async () => {
  const active = {
    id: 7, user_id: 'user-1', status: 'incomplete',
    date: '2026-11-04', check_in_time: '2026-11-04T04:00:00Z', check_out_time: null,
  };
  const absent = { ...active, id: 8, date: '2026-11-05', status: 'absent', check_in_time: null };
  let hasActive = true;
  let updates = 0;
  const db = new PostgrestClient('https://example.test', {
    fetch: async (input, init) => {
      const params = new URL(input).searchParams;
      if (init.method === 'PATCH') {
        assert.equal(params.get('id'), 'eq.7');
        assert.equal(params.get('status'), 'eq.incomplete');
        assert.equal(params.get('check_out_time'), 'is.null');
        updates++;
        hasActive = false;
        return Response.json({ ...active, ...JSON.parse(init.body) });
      }
      if (params.get('check_out_time') === 'is.null') {
        assert.equal(params.get('status'), 'eq.incomplete');
        assert.equal(params.get('check_in_time'), 'not.is.null');
        return Response.json(hasActive ? active : null);
      }
      assert.equal(params.get('order'), 'date.desc,check_in_time.desc.nullslast');
      return Response.json(absent);
    },
  });
  db.auth = { getUser: async () => ({ data: { user: { id: 'user-1' } }, error: null }) };
  const service = load('src/services/users/attendance.service.ts', {
    '@/src/supabase/supabaseClient': { supabase: db },
    '../../utils/locationHelper': { getUserLocationOrThrow: async () => ({ lat: 1, lng: 2 }) },
    '../../utils/getDate': {},
    '@/src/utils/attendanceHelper': { parseDate: value => value ? new Date(value) : null },
  });
  const restored = await service.fetchLatestAttendanceService();
  assert.equal(restored.row.id, 7);
  assert.equal(restored.checkedInAt.toISOString(), active.check_in_time.replace('Z', '.000Z'));
  assert.equal((await service.checkOutService()).id, 7);
  assert.equal(updates, 1);
  assert.equal((await service.fetchLatestAttendanceService()).row.id, 8);
  await assert.rejects(service.checkOutService(), /No active check-in/);
  assert.equal(updates, 1);
});

test('session restoration retains status and rejects missing profiles', async () => {
  const session = { user: { id: 'user-1' }, access_token: 'token' };
  let profile = { role: 'user', status: 'pending' };
  const db = new PostgrestClient('https://example.test', {
    fetch: async () => Response.json(profile),
  });
  db.auth = { getSession: async () => ({ data: { session }, error: null }) };
  const { getSessionWithProfile } = load('src/services/auth.services.ts', {
    '../supabase/supabaseClient': { supabase: db },
  });
  const restored = await getSessionWithProfile();
  assert.equal(restored.status, 'pending');
  profile = null;
  await assert.rejects(getSessionWithProfile(), /Failed to fetch session profile/);

  let saved = restored;
  const { useAuthStore } = load('src/store/useAuthStore.ts', {
    '../services/auth.services': {
      getSessionWithProfile: async () => saved,
      signOut: async () => {},
    },
    '../services/password.services': {},
  });
  assert.equal(useAuthStore.getState().loading, true);
  await useAuthStore.getState().restoreSession();
  assert.equal(useAuthStore.getState().status, 'pending');
  assert.equal(useAuthStore.getState().loading, false);
  await useAuthStore.getState().signOut();
  assert.equal(useAuthStore.getState().status, null);
  useAuthStore.setState(restored);
  saved = null;
  await useAuthStore.getState().restoreSession();
  assert.equal(useAuthStore.getState().user, null);
  assert.equal(useAuthStore.getState().status, null);
});

test('startup and direct user routes gate pending accounts before mounting tabs', () => {
  let state;
  const mocks = {
    '@/src/store/useAuthStore': { useAuthStore: () => state },
    'expo-router': { Redirect: () => null },
    '../components/LoadingIndicator': { __esModule: true, default: 'Loading' },
    '@/src/components/LoadingIndicator': { __esModule: true, default: 'Loading' },
    '@/src/screens/users/layout/userTab': { __esModule: true, default: 'UserTabs' },
  };
  const index = load('src/app/index.tsx', mocks).default;
  const userLayout = load('src/app/(users)/_layout.tsx', mocks).default;
  state = { loading: true, user: null, role: null, status: null };
  assert.equal(index().type, 'Loading');
  assert.equal(userLayout().type, 'Loading');
  state = { loading: false, user: { id: 'user-1' }, role: 'user', status: 'pending' };
  assert.equal(index().props.href, '/(auth)/changePassword');
  assert.equal(userLayout().props.href, '/(auth)/changePassword');
  state.status = 'active';
  assert.equal(index().props.href, '/(users)/dashboard');
  assert.equal(userLayout().type, 'UserTabs');
  state.role = 'admin';
  assert.equal(index().props.href, '/(admin)/dashboard');
  assert.equal(userLayout().props.href, '/(admin)/dashboard');
  state.user = null;
  assert.equal(index().props.href, '/(auth)/login');
  assert.equal(userLayout().props.href, '/(auth)/login');
});

test('calendar month filters include the last day and handle leap years and rollover', () => {
  for (const [year, month, start, end] of [
    [2026, 10, '2026-11-01', '2026-12-01'],
    [2024, 1, '2024-02-01', '2024-03-01'],
    [2026, 11, '2026-12-01', '2027-01-01'],
  ]) {
    const dates = dashboardDates.getNepalMonthDateRangeYYYYMMDD(year, month);
    assert.equal(dates.startDate, start);
    assert.equal(dates.endDateExclusive, end);
  }
  const utc = dashboardDates.getNepalMonthRangeUTCISO(2026, 10);
  assert.equal(utc.startISO, '2026-10-31T18:15:00.000Z');
  assert.equal(utc.endISO, '2026-11-30T18:15:00.000Z');
});

test('monthly summaries include the final day without depending on device timezone', async () => {
  const db = new PostgrestClient('https://example.test', {
    fetch: async (input) => {
      const params = new URL(input).searchParams;
      assert.deepEqual(params.getAll('stat_date'), ['gte.2026-11-01', 'lt.2026-12-01']);
      return Response.json([{
        total_employees: 3, present_count: 1, absent_count: 1,
        on_leave_count: 1, incomplete_count: 0, leave_days_total: '0.5',
      }]);
    },
  });
  const service = load('src/services/users/dailyAttendanceStats.service.ts', {
    '@/src/supabase/supabaseClient': { supabase: db },
    '@/src/utils/userDashboard': dashboardDates,
  });
  const summary = await service.getOrganizationDailyAttendanceSummaryService(1, 2026, 11);
  assert.equal(summary.total_present, 1);
  assert.equal(summary.total_leave_days, 0.5);
  assert.equal(summary.days_with_data, 1);
});

test('attendance fallback uses its response and leaves count only overlapping days', async () => {
  const leaves = [
    { start_date: '2026-10-30', end_date: '2026-11-02', days_count: 4 },
    { start_date: '2026-11-30', end_date: '2026-12-02', days_count: 3 },
    { start_date: '2026-11-12', end_date: '2026-11-12', days_count: 0.5 },
    { start_date: '2026-11-15', end_date: null, days_count: null },
    { start_date: '2026-10-01', end_date: null, days_count: 1 },
  ];
  let fallback = true;
  const db = new PostgrestClient('https://example.test', {
    fetch: async (input) => {
      const url = new URL(input);
      if (url.pathname === '/leaves') return Response.json(leaves);
      if (url.searchParams.has('date')) {
        if (fallback) return Response.json({ message: 'date unavailable', code: '42703' }, { status: 400 });
        return Response.json([{ status: 'incomplete' }]);
      }
      assert.deepEqual(url.searchParams.getAll('created_at'), [
        'gte.2026-10-31T18:15:00.000Z', 'lt.2026-11-30T18:15:00.000Z',
      ]);
      return Response.json([{ status: 'present' }, { status: 'absent' }]);
    },
  });
  let stats;
  let stateIndex = 0;
  const { useAttendanceStats } = load('src/hooks/users/useAttendanceStats.ts', {
    '@/src/supabase/supabaseClient': { supabase: db },
    '@/src/utils/userDashboard': dashboardDates,
    '@/src/utils/leaveUtils': load('src/utils/leaveUtils.ts', {}),
    react: {
      useState: initial => {
        const index = stateIndex++;
        return [initial, value => { if (index === 0) stats = value; }];
      },
      useCallback: callback => callback,
      useEffect: () => {},
    },
  });
  const hook = useAttendanceStats('user-1', 2026, 10);
  await hook.fetchStats();
  assert.equal(stats.present, 1);
  assert.equal(stats.absent, 1);
  assert.equal(stats.leaveTaken, 4.5);
  fallback = false;
  await hook.fetchStats();
  assert.equal(stats.incomplete, 1);
  assert.equal(stats.present, 0);
  assert.equal(stats.leaveTaken, 4.5);
});

test('local reminders replace legacy duplicates and use daily triggers on Android', async () => {
  const scheduled = new Map([
    ['legacy', { identifier: 'legacy', content: {
      title: 'Check-in Time ⏰',
      body: 'Your check-in window has started. Please check in from the HRM app.',
    } }],
    ['unrelated', { identifier: 'unrelated', content: { title: 'Meeting' } }],
  ]);
  const events = [];
  const notifications = {
    setNotificationHandler: () => {},
    AndroidImportance: { MAX: 5 },
    SchedulableTriggerInputTypes: { DAILY: 'daily' },
    setNotificationChannelAsync: async () => events.push('channel'),
    getPermissionsAsync: async () => ({ status: 'undetermined' }),
    requestPermissionsAsync: async () => {
      events.push('permission');
      return { status: 'granted' };
    },
    getAllScheduledNotificationsAsync: async () => [...scheduled.values()],
    cancelScheduledNotificationAsync: async id => scheduled.delete(id),
    scheduleNotificationAsync: async reminder => scheduled.set(reminder.identifier, reminder),
  };
  const platform = { OS: 'android' };
  const service = load('src/services/users/attendanceNotification.service.ts', {
    'expo-notifications': notifications,
    'react-native': { Platform: platform },
    '@/src/utils/attendanceHelper': {
      CHECKIN_NOTIFICATION_ID: 'attendance-checkin',
      CHECKOUT_NOTIFICATION_ID: 'attendance-checkout',
      parseHourMinute: time => {
        const [hour, minute] = time.split(':').map(Number);
        return { hour, minute };
      },
    },
  });
  assert.equal(await service.registerForPushNotificationsAsync(), true);
  assert.deepEqual(events, ['channel', 'permission']);
  const rules = { checkin_start: '09:15:00', checkout_start: '17:30:00', checkout_end: null };
  await service.scheduleAttendanceNotifications(rules);
  await service.scheduleAttendanceNotifications(rules);
  assert.equal(scheduled.size, 3);
  assert(scheduled.has('unrelated'));
  assert(!scheduled.has('legacy'));
  const checkout = scheduled.get('attendance-checkout');
  assert.equal(checkout.trigger.type, 'daily');
  assert.equal(checkout.trigger.hour, 17);
  assert.equal(checkout.trigger.minute, 30);
  platform.OS = 'web';
  assert.equal(await service.registerForPushNotificationsAsync(), false);
});

test('attendance rules stay available when notification registration fails', async () => {
  const rules = { checkin_end: '09:30:00', checkout_start: '17:00:00' };
  let effect;
  let storedRules;
  let scheduleCalls = 0;
  const { useAttendanceNotifications } = load('src/hooks/users/useAttendanceNotifications.ts', {
    react: {
      useState: () => [null, value => { storedRules = value; }],
      useEffect: callback => { effect = callback; },
    },
    '../../services/users/attendance.service': { getAttendanceRulesService: async () => rules },
    '../../services/users/attendanceNotification.service': {
      registerForPushNotificationsAsync: async () => { throw new Error('Permission API unavailable'); },
      scheduleAttendanceNotifications: async () => { scheduleCalls++; },
    },
  });
  useAttendanceNotifications();
  const cleanup = effect();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(storedRules, rules);
  assert.equal(scheduleCalls, 0);
  cleanup();
});

test('calendar follows parent month changes and opens the picker at that month', () => {
  const states = [];
  let cursor = 0;
  const { SharedCalendar } = load('src/components/SharedCalendar.tsx', {
    react: {
      useState: initial => {
        const index = cursor++;
        if (!(index in states)) states[index] = initial;
        return [states[index], value => { states[index] = value; }];
      },
      useMemo: calculate => calculate(),
      useEffect: () => {},
    },
    'react-native': { Pressable: 'Pressable', Text: 'Text', View: 'View' },
    'react-native-calendars': { Calendar: 'Calendar' },
    '@/src/components/Calendar/DayCell': { DayCell: 'DayCell' },
    '@/theme/twStyles': { TW: {} },
    './Home/MonthPickerModal': { MonthPickerModal: 'MonthPicker' },
  });
  function nodes(element) {
    if (!element || typeof element !== 'object') return [];
    if (Array.isArray(element)) return element.flatMap(nodes);
    return [element, ...nodes(element.props?.children)];
  }
  let props = { year: 2026, month: 11, onMonthChange: update => { props = { ...props, ...update }; } };
  const render = () => { cursor = 0; return nodes(SharedCalendar(props)); };
  let tree = render();
  assert.equal(tree.find(node => node.type === 'Calendar').props.current, '2026-11-01');
  tree.find(node => node.type === 'Calendar').props.onMonthChange({ year: 2026, month: 12 });
  tree = render();
  assert.equal(tree.find(node => node.type === 'Calendar').props.current, '2026-12-01');
  props = { ...props, year: 2027, month: 3 };
  tree = render();
  assert.equal(tree.find(node => node.type === 'Calendar').props.current, '2027-03-01');
  const openPicker = tree.find(node => node.type === 'Pressable' &&
    nodes(node).some(child => child.type === 'Text' && child.props.children === 'March 2027'));
  assert(openPicker);
  openPicker.props.onPress();
  const picker = render().find(node => node.type === 'MonthPicker');
  assert.equal(picker.props.visible, true);
  assert.equal(picker.props.selectedYear, 2027);
  assert.equal(picker.props.selectedMonth, 2);
});

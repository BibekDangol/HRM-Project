// Run with node scripts/check-recent-activity.cjs; no account or network required.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const React = require('react');
const requests = [];
const states = [];
let attendance = null;
let stateIndex;
let pendingEffect;
let previousDeps;
let cleanup;

const mocks = {
  react: {
    ...React,
    useState(initial) {
      const index = stateIndex++;
      if (!(index in states)) states[index] = initial;
      return [states[index], value => { states[index] = value; }];
    },
    useEffect(effect, deps) {
      if (!previousDeps || deps.some((value, index) => !Object.is(value, previousDeps[index]))) {
        pendingEffect = effect;
        previousDeps = deps;
      }
    },
  },
  '@/theme/colors': { colors: {} },
  '@/theme/twStyles': { TW: {} },
  '@/theme/tw': { __esModule: true, default: () => ({}) },
  '@/src/context/AttendanceContext': { useAttendanceContext: () => ({ attendance }) },
  '@/src/store/useAuthStore': { useAuthStore: select => select({ user: { id: 'user-1' } }) },
  '@/src/utils/userDashboard': { normalize: value => value.toLowerCase() },
  'react-native': { View: 'View', Text: 'Text', Pressable: 'Pressable' },
  '@/src/supabase/supabaseClient': {
    supabase: {
      from() {
        let resolve;
        const promise = new Promise(done => { resolve = done; });
        const request = { resolve };
        requests.push(request);
        const query = { then: promise.then.bind(promise) };
        for (const method of ['select', 'eq', 'order', 'gte', 'lte']) query[method] = () => query;
        query.limit = count => { request.limit = count; return query; };
        return query;
      },
    },
  },
};
const moduleUnderTest = { exports: {} };
const code = ts.transpileModule(fs.readFileSync('src/components/RecentActivity.tsx', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
}).outputText;
new Function('require', 'module', 'exports', code)(name => {
  if (name in mocks) return mocks[name];
  if (name === 'react/jsx-runtime') return require(name);
  throw new Error(`Unexpected import: ${name}`);
}, moduleUnderTest, moduleUnderTest.exports);

function render(home = true) {
  stateIndex = 0;
  moduleUnderTest.exports.ActivityLogSection(home ? { onViewAll: () => {} } : { hideTitle: true });
  if (pendingEffect) {
    cleanup?.();
    cleanup = pendingEffect();
    pendingEffect = undefined;
  }
}
const flush = () => new Promise(resolve => setImmediate(resolve));
const row = { id: 1, date: '2026-11-17', status: 'incomplete', check_in_time: '2026-11-17T04:00:00Z', check_out_time: null, check_in_comment: null };

(async () => {
  render();
  assert.equal(requests[0].limit, 2);
  attendance = row;
  render();
  assert.equal(requests.length, 2, 'Check-in must refresh even while the first query is pending');
  requests[1].resolve({ data: [row] });
  await flush();
  assert.deepEqual(states[0], [row]);
  requests[0].resolve({ data: [] });
  await flush();
  assert.deepEqual(states[0], [row], 'Stale query must not erase the check-in');
  render();
  assert.equal(requests.length, 2, 'Unrelated rerenders must not refetch');
  attendance = { ...row, status: 'present', check_out_time: '2026-11-17T12:00:00Z' };
  render();
  requests[2].resolve({ data: [attendance] });
  await flush();
  assert.deepEqual(states[0], [attendance], 'Check-out must update the activity card');
  render(false);
  assert.equal(requests[3].limit, undefined, 'Full activity page must stay unlimited');
  cleanup();
  requests[3].resolve({ data: [] });
  await flush();
  assert.deepEqual(states[0], [attendance], 'Unmounted requests must not update state');
  console.log('Recent Activity checks passed (check-in, check-out, stale requests, Home limit, full list).');
})().catch(error => { console.error(error); process.exitCode = 1; });

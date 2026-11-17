// Run with node scripts/check-add-user-flow.cjs; no accounts or network required.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const React = require('react');

function load(file, mocks) {
  const module = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  new Function('require', 'module', 'exports', code)(name => {
    if (name in mocks) return mocks[name];
    if (name === 'react/jsx-runtime') return require(name);
    throw new Error(`Unexpected import: ${name}`);
  }, module, module.exports);
  return module.exports;
}

const states = [];
let index = 0;
const react = {
  ...React,
  useState(initial) {
    const slot = index++;
    if (!(slot in states)) states[slot] = initial;
    return [states[slot], value => { states[slot] = value; }];
  },
  useCallback: fn => fn,
  useMemo: fn => fn(),
  useEffect: () => {},
  useRef: () => ({ current: null }),
};
const alerts = [];
let response = { success: true, tempPassword: 'test-only-password' };
let creationError = false;
const profile = { id: 'admin', organization_id: 1 };
const { useUserDirectory } = load('src/hooks/useUserDirectory.ts', {
  react,
  'react-native': { Alert: { alert: (...args) => alerts.push(args) } },
  '@/src/api/apiClient': {},
  '@/src/services/admin/add-user-service': { adminAddUserService: async () => {
    if (creationError) throw new Error('Creation failed');
    return response;
  } },
  '@/src/services/admin.service': { fetchUsersService: () => new Promise(() => {}) },
  '@/src/services/currentuser.service': {},
  '@/src/store/useAuthStore': { useAuthStore: () => ({ user: { id: 'admin' } }) },
  '@/src/store/useUsersStore': { useUsersStore: () => ({ users: [], currentUserProfile: profile, setUsers: () => {} }) },
});
function directory() { index = 0; return useUserDirectory(); }
const input = { email: 'test@example.com', first_name: 'Test', last_name: 'User', supervisor_id: null };

(async () => {
  directory().setShowAddModal(true);
  let deadline;
  const result = await Promise.race([
    directory().handleAddUser(input),
    new Promise((_, reject) => { deadline = setTimeout(() => reject(new Error('Creation blocked by list refresh')), 200); }),
  ]);
  clearTimeout(deadline);
  assert.equal(result, true);
  assert.equal(directory().tempPassword, response.tempPassword);
  assert.equal(directory().showAddModal, true, 'Password must stay inside the open Add User modal');
  assert.equal(directory().isAddingUser, false);
  assert.equal(alerts.length, 0, 'Do not open a success alert over the password');

  creationError = true;
  assert.equal(await directory().handleAddUser(input), false);
  assert.equal(directory().showAddModal, true);
  assert.equal(directory().isAddingUser, false);
  creationError = false;
  response = { success: true };
  assert.equal(await directory().handleAddUser(input), true);
  assert.equal(directory().tempPassword, null);
  assert.equal(directory().showAddModal, false);
  assert.match(alerts.at(-1)[1], /No temporary password was returned/);

  let resets = 0;
  let closes = 0;
  const AddUserModal = load('src/screens/admin/manage-users/AddUserModal.tsx', {
    react,
    './TempPasswordContent': { __esModule: true, default: 'PasswordContent' },
    '@/theme/colors': { colors: {} },
    '@/theme/tw': { __esModule: true, default: () => ({}) },
    'react-hook-form': { useForm: () => ({ control: {}, reset: () => { resets++; }, handleSubmit: fn => () => fn(input) }), Controller: 'Controller' },
    'react-native': { Keyboard: { dismiss: () => {} }, View: 'View', Text: 'Text', ScrollView: 'ScrollView', Pressable: 'Pressable' },
    '@/src/components/form/FormActions': { __esModule: true, default: 'Actions' },
    '@/src/components/form/FormField': {},
    '@/src/components/ui/ModalShell': { __esModule: true, default: 'ModalShell' },
    '@/src/schema/admin/addUserSchema': {},
    '@hookform/resolvers/zod': { zodResolver: () => {} },
    'lucide-react-native': {},
  }).default;
  const props = { visible: true, onClose: () => { closes++; }, supervisors: [], isSubmitting: false };
  index = 0;
  const failedForm = AddUserModal({ ...props, onSubmit: async () => false });
  await failedForm.props.footer.props.onSubmit();
  assert.equal(resets, 0, 'Failure must preserve form input');
  assert.equal(closes, 0);
  index = 0;
  const form = AddUserModal({ ...props, onSubmit: async () => true });
  await form.props.footer.props.onSubmit();
  assert.equal(resets, 1);
  assert.equal(closes, 0, 'Successful creation must not dismiss the password stage');
  index = 0;
  const password = AddUserModal({ ...props, tempPassword: 'test-only-password' });
  assert.equal(password.type, form.type, 'Both stages must reuse the same native modal shell');
  assert.equal(password.props.footer, undefined);
  assert.equal(password.props.children.type, 'PasswordContent');
  password.props.children.props.onDone();
  assert.equal(closes, 1);
  console.log('Add User checks passed (single modal, immediate password, slow refresh, failure, Done).');
})().catch(error => { console.error(error); process.exitCode = 1; });

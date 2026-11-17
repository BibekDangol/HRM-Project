// Run with node scripts/check-startup.cjs; no device or network required.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');

async function checkStartup(unmountBeforeRestore) {
  const effects = [];
  let restoring = true;
  let updates = 0;
  let hides = 0;
  let resolveRestore;
  let resolveUrl;
  let sessions = 0;
  let removed = false;
  const restore = new Promise(resolve => { resolveRestore = resolve; });
  const initialUrl = new Promise(resolve => { resolveUrl = resolve; });
  const mocks = {
    react: {
      useState: () => [restoring, value => { restoring = value; updates++; }],
      useEffect: effect => effects.push(effect),
    },
    'expo-linking': {
      getInitialURL: () => initialUrl,
      addEventListener: () => ({ remove: () => { removed = true; } }),
    },
    'expo-splash-screen': {
      preventAutoHideAsync: async () => {},
      hideAsync: async () => { hides++; },
    },
    'expo-router': { Stack: 'Stack' },
    'expo-status-bar': { StatusBar: 'StatusBar' },
    'react-native-gesture-handler': { GestureHandlerRootView: 'Root' },
    'react-native-safe-area-context': { SafeAreaProvider: 'SafeArea' },
    'react-native-toast-message': { __esModule: true, default: 'Toast' },
    '../store/useAuthStore': { useAuthStore: select => select({ restoreSession: () => restore }) },
    '../supabase/supabaseClient': { supabase: { auth: { setSession: async () => { sessions++; } } } },
  };
  const code = ts.transpileModule(fs.readFileSync('src/app/_layout.tsx', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  const loaded = { exports: {} };
  new Function('require', 'module', 'exports', code)(name => {
    if (name in mocks) return mocks[name];
    if (name === 'react/jsx-runtime') return require(name);
    throw new Error(`Unexpected import: ${name}`);
  }, loaded, loaded.exports);
  const Layout = loaded.exports.default;
  function containsStack(node) {
    if (!node) return false;
    if (Array.isArray(node)) return node.some(containsStack);
    return node.type === 'Stack' || containsStack(node.props?.children);
  }
  assert.ok(containsStack(Layout()), 'Navigator must mount before session restoration');
  assert.equal(updates, 0, 'Rendering must not update state');
  const cleanups = effects.map(effect => effect());
  assert.equal(hides, 0, 'Native splash must cover session restoration');
  if (unmountBeforeRestore) cleanups.forEach(cleanup => cleanup?.());
  resolveUrl('techhaushrm:///#access_token=test&refresh_token=test');
  resolveRestore();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(updates, unmountBeforeRestore ? 0 : 1);
  assert.equal(sessions, unmountBeforeRestore ? 0 : 1);
  if (unmountBeforeRestore) assert.ok(removed);
  else {
    effects.length = 0;
    assert.ok(containsStack(Layout()));
    effects[0]();
    assert.equal(hides, 1, 'Hide native splash after restoration and navigator render');
    cleanups.forEach(cleanup => cleanup?.());
  }
}

(async () => {
  await checkStartup(false);
  await checkStartup(true);
  console.log('Startup checks passed (navigator, splash timing, unmount cleanup).');
})().catch(error => { console.error(error); process.exitCode = 1; });

// Run with node scripts/check-home-header.cjs; no device or account required.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const React = require('react');

function load(file, mocks) {
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  const module = { exports: {} };
  new Function('require', 'module', 'exports', code)(name => {
    if (name in mocks) return mocks[name];
    if (name === 'react' || name === 'react/jsx-runtime') return require(name);
    throw new Error(`Unexpected import: ${name}`);
  }, module, module.exports);
  return module.exports;
}

const colors = { canvas: '#f7f8fa', primary: '#4b6382', surface: '#ffffff' };
const mocks = {
  '@/theme/colors': { colors },
  '@/theme/twStyles': { TW: { bgSecondary: colors.primary } },
  '@/src/components/BackButton': { BackButton: 'BackButton' },
  '@/src/utils/attendanceHelper': {},
  'lucide-react-native': {},
  'react-native': { View: 'View', Dimensions: { get: () => ({ width: 390, height: 844 }) }, Platform: { OS: 'ios' } },
  'react-native-safe-area-context': { SafeAreaView: 'SafeAreaView' },
  '../common/getDropdownPosition': {},
};
const { getTabScreenOptions } = load('src/config/tabScreenOptions.ts', mocks);
for (const path of ['/dashboard', '/manage-users', '/leave', '/more', '/profile', '/holidays', '/activity-log', '/more/supervisor-settings/leave/pending-details']) {
  const options = getTabScreenOptions();
  assert.equal(options.headerShown, false, path);
  assert.equal(options.sceneStyle.backgroundColor, colors.canvas, path);
}
const { AppScreenLayout } = load('src/components/navigation/header/AppHeader.tsx', mocks);
const content = React.createElement('Content');
const intro = React.createElement('HomePageIntro');
const home = AppScreenLayout({ isHome: true, children: content, homeContent: intro });
assert.equal(home.type, 'SafeAreaView');
assert.equal(home.props.style.backgroundColor, colors.canvas);
assert.deepEqual(home.props.edges, ['top', 'left', 'right']);
assert.equal(home.props.children[0], intro);
assert.equal(home.props.children[1], content);
const plain = AppScreenLayout({ isHome: false, children: content, homeContent: intro });
assert.equal(plain.type, 'SafeAreaView');
assert.deepEqual(plain.props.edges, ['top', 'left', 'right']);
assert.equal(plain.props.children[0], null, 'Root tabs should not get a back row');
const back = () => {};
const detail = AppScreenLayout({ isHome: false, children: content, onBack: back });
assert.equal(detail.props.children[0].props.children.props.onPress, back);
assert.equal(detail.props.children[1], content);
console.log('Home page checks passed (no navigation headers, Home-only intro, safe areas, back button).');

// Exercise signup step handlers without a device, account, or network.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const React = require('react');
const root = path.resolve(__dirname, '..');
const cache = new Map();
let step = 0;
let values;
let errors = {};
let signupCalls = 0;
let payload;
const destinations = [];
const Field = () => null;
const Password = () => null;
const Button = () => null;
const Controller = () => null;

function parse() { return schema.safeParse(values); }
function collectErrors(result) {
  return Object.fromEntries(result.error.issues.map(issue => [issue.path[0], { message: issue.message }]));
}
const form = {
  control: {},
  formState: { get errors() { return errors; }, isSubmitting: false },
  setFocus: () => {},
  trigger: async names => {
    const result = parse();
    const allErrors = result.success ? {} : collectErrors(result);
    for (const name of names) {
      if (allErrors[name]) errors[name] = allErrors[name];
      else delete errors[name];
    }
    return names.every(name => !allErrors[name]);
  },
  handleSubmit: (valid, invalid) => async () => {
    const result = parse();
    if (result.success) await valid(result.data);
    else { errors = collectErrors(result); invalid?.(errors); }
  },
};

function load(relative) {
  const file = path.resolve(root, relative);
  if (cache.has(file)) return cache.get(file).exports;
  const module = { exports: {} };
  cache.set(file, module);
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  function resolve(name) {
    if (name === 'react') return { ...React, useState: () => [step, next => { step = next; }] };
    if (name === 'react-native') return { Text: 'Text', View: 'View', Pressable: 'Pressable', Alert: { alert: () => {} }, Keyboard: { dismiss: () => {} } };
    if (name === 'expo-router') return { useRouter: () => ({ dismissTo: destination => destinations.push(destination) }) };
    if (name.endsWith('/AuthScreen')) return { __esModule: true, default: () => null, authStyles: {} };
    if (name.endsWith('/FormField')) return { __esModule: true, default: Field };
    if (name.endsWith('/PasswordField')) return { __esModule: true, default: Password };
    if (name.endsWith('/AppButton')) return { __esModule: true, default: Button };
    if (name.endsWith('/useAuthStore')) return { useAuthStore: select => select({ signUp: async data => { signupCalls++; payload = data; } }) };
    if (name === '@hookform/resolvers/zod') return { zodResolver: () => null };
    if (name === 'react-hook-form') return { Controller, useForm: options => {
      assert.equal(options.shouldUnregister, false, 'Step changes must retain unmounted values');
      values ??= { ...options.defaultValues };
      return form;
    } };
    if (name.startsWith('@/') || name.startsWith('.')) {
      const stem = name.startsWith('@/') ? path.join(root, name.slice(2)) : path.resolve(path.dirname(file), name);
      const target = [stem + '.ts', stem + '.tsx', path.join(stem, 'index.ts')].find(candidate => fs.existsSync(candidate));
      return load(target);
    }
    return require(name);
  }
  new Function('require', 'exports', 'module', code)(resolve, module.exports, module);
  return module.exports;
}
const { signupSchema: schema } = load('src/schema/auth/signup.schema.ts');
const Signup = load('src/screens/auth/Signup.tsx').default;
function nodes(node) {
  if (Array.isArray(node)) return node.flatMap(nodes);
  return React.isValidElement(node) ? [node, ...nodes(node.props.children)] : [];
}
const render = () => Signup();
const fields = tree => nodes(tree).filter(node => node.type === Controller).map(node => node.props.name);
const press = async title => {
  const button = nodes(render()).find(node => node.type === Button && node.props.title === title);
  assert(button, `Missing action: ${title}`);
  await button.props.onPress();
};

(async () => {
  assert.deepEqual(fields(render()), ['firstName', 'lastName']);
  await press('Continue');
  assert.equal(step, 0, 'Invalid names must not advance');
  Object.assign(values, { firstName: 'Ada', lastName: 'Lovelace' });
  await press('Continue');
  assert.equal(step, 1);
  assert.deepEqual(fields(render()), ['organizationName', 'email']);
  Object.assign(values, { organizationName: ' Example ', email: 'invalid' });
  await press('Continue');
  assert.equal(step, 1, 'Invalid email must not advance');
  values.email = 'ADA@EXAMPLE.COM';
  await press('Continue');
  assert.equal(step, 2);
  assert.deepEqual(fields(render()), ['password', 'confirmPassword']);
  await press('Back');
  assert.equal(step, 1);
  assert.equal(values.firstName, 'Ada');
  assert.equal(values.email, 'ADA@EXAMPLE.COM');
  await press('Continue');
  Object.assign(values, { password: 'Example9!', confirmPassword: 'Different9!' });
  await press('Create account');
  assert.equal(signupCalls, 0, 'Mismatched passwords must not create an account');
  assert.equal(step, 2);
  // Final validation must bring an earlier invalid field back into view.
  values.firstName = '';
  await press('Create account');
  assert.equal(step, 0);
  assert.equal(signupCalls, 0);
  values.firstName = 'Ada';
  await press('Continue');
  await press('Continue');
  values.confirmPassword = 'Example9!';
  await press('Create account');
  assert.equal(signupCalls, 1);
  assert.deepEqual(payload, { firstName: 'Ada', lastName: 'Lovelace', organizationName: 'Example', email: 'ada@example.com', password: 'Example9!' });
  assert.deepEqual(destinations, ['/(auth)/login']);
  step = 0;
  render().props.onBack();
  assert.equal(destinations.at(-1), '/(auth)/login');
  console.log('Signup flow passed: step validation, retained values, back navigation, hidden-error recovery, and one final normalized submission.');
})().catch(error => { console.error(error); process.exitCode = 1; });

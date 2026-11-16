const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const css = fs.readFileSync(path.join(root, 'global.css'), 'utf8');
const declarations = css.match(/:root\s*\{([^}]+)\}/)?.[1];
if (!declarations) throw new Error('global.css must contain a :root palette.');

const colors = {};
for (const declaration of declarations.split(';')) {
  if (!declaration.trim()) continue;
  const match = declaration.trim().match(/^--color-([a-z-]+):\s*(#[\da-f]{6}|rgba\([\d.,\s]+\))$/i);
  if (!match) throw new Error(`Invalid palette declaration: ${declaration.trim()}`);
  const key = match[1].replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
  if (key in colors) throw new Error(`Duplicate palette color: ${key}`);
  colors[key] = match[2];
}
if (!Object.keys(colors).length) throw new Error('global.css palette is empty.');

const output = '// Generated from global.css by scripts/sync-theme.cjs. Do not edit.\n' +
  `export const colors = ${JSON.stringify(colors, null, 2)};\n`;
const target = path.join(root, 'theme/colors.ts');
if (process.argv.includes('--check')) {
  if (!fs.existsSync(target) || fs.readFileSync(target, 'utf8') !== output) {
    throw new Error('Theme is out of date. Run npm run theme.');
  }
} else if (!fs.existsSync(target) || fs.readFileSync(target, 'utf8') !== output) {
  fs.writeFileSync(target, output);
}

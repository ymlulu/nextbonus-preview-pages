import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const failures = [];

async function text(file) {
  return readFile(path.join(ROOT, file), 'utf8');
}

function requireText(source, needle, label) {
  if (!source.includes(needle)) failures.push(label);
}

const [app, finalize, index] = await Promise.all([
  text('app.js'),
  text('ui/finalize.js'),
  text('index.html')
]);

requireText(app, 'NextBonusUIFinalize?.schedule?.(document)', 'app.js must explicitly schedule the UI finalization pipeline after render.');
requireText(finalize, 'NextBonusUserFacingCopy?.polish?.(root)', 'ui/finalize.js must call the user-facing copy owner.');
requireText(finalize, 'NextBonusTerminologyUI?.polish?.(root)', 'ui/finalize.js must call the terminology owner.');
requireText(finalize, 'NextBonusTypography?.sync?.(root)', 'ui/finalize.js must call the typography owner.');
requireText(finalize, 'NextBonusSemanticTypography?.sync?.(root)', 'ui/finalize.js must call the semantic typography owner.');

const orderedScripts = [
  'ui/user-facing-copy.js',
  'ui/terminology.js',
  'ui/typography.js',
  'ui/semantic-typography.js',
  'ui/finalize.js',
  'app.js'
];
let previous = -1;
for (const script of orderedScripts) {
  const current = index.indexOf(script);
  if (current < 0) failures.push(`index.html must load ${script}.`);
  else if (current <= previous) failures.push(`index.html script order is invalid around ${script}.`);
  previous = Math.max(previous, current);
}

const SKIP_DIRS = new Set(['.git', 'node_modules', 'scripts']);
async function runtimeJs(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.isDirectory() && SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await runtimeJs(full));
    else if (entry.isFile() && entry.name.endsWith('.js')) files.push(full);
  }
  return files;
}

for (const file of await runtimeJs(ROOT)) {
  const source = await readFile(file, 'utf8');
  if (/\bMutationObserver\b/.test(source)) {
    failures.push(`${path.relative(ROOT, file)} introduces a runtime MutationObserver; render synchronization must stay explicit.`);
  }
}

if (failures.length) {
  console.error('Architecture guard failed:');
  failures.forEach(item => console.error(`- ${item}`));
  process.exit(1);
}

console.log('Architecture guards OK (UI finalization ownership + explicit render pipeline).');

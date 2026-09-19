import { spawnSync } from 'node:child_process';

const base = process.env.CI_BASE_SHA?.trim();
if (!base || /^0+$/.test(base)) {
  console.log('Typography drift guard skipped: CI_BASE_SHA is not available.');
  process.exit(0);
}

const result = spawnSync('git', [
  'diff', '--unified=1', `${base}...HEAD`, '--', '*.css', '*.js', '*.html'
], { encoding: 'utf8' });

if (result.status !== 0) {
  console.error(result.stderr || result.stdout || 'git diff failed');
  process.exit(result.status || 1);
}

const OWNER_FILES = new Set([
  'ui/typography.css',
  'ui/typography-balance.css',
  'ui/typography.js',
  'ui/semantic-typography.js'
]);
const DECLARATION = /(?:^|[;{])\s*(?:font-family|font-size|font-weight|line-height|letter-spacing)\s*:/i;
const FONT_SHORTHAND = /(?:^|[;{])\s*font\s*:\s*(?!inherit\b)/i;
const INLINE_STYLE = /style\s*=.*(?:font-family|font-size|font-weight|line-height|letter-spacing)\s*:/i;
const DOM_STYLE = /\.style\.(?:fontFamily|fontSize|fontWeight|lineHeight|letterSpacing)\s*=|setProperty\(\s*['"](?:font-family|font-size|font-weight|line-height|letter-spacing)['"]/i;
const EXEMPT = 'nb-typography-exempt: marketing';

let file = null;
let previousPatchLine = '';
const violations = [];
for (const raw of result.stdout.split('\n')) {
  if (raw.startsWith('+++ b/')) {
    file = raw.slice(6);
    previousPatchLine = '';
    continue;
  }
  if (!file || raw.startsWith('@@') || raw.startsWith('--- ')) {
    previousPatchLine = raw;
    continue;
  }
  if (!raw.startsWith('+') || raw.startsWith('+++')) {
    previousPatchLine = raw;
    continue;
  }
  const line = raw.slice(1);
  const owner = OWNER_FILES.has(file);
  const marketingExempt = line.includes(EXEMPT) || previousPatchLine.includes(EXEMPT);
  const forbidden = DECLARATION.test(line) || FONT_SHORTHAND.test(line) || INLINE_STYLE.test(line) || DOM_STYLE.test(line);
  if (!owner && forbidden && !marketingExempt) violations.push({ file, line: line.trim() });
  previousPatchLine = raw;
}

if (violations.length) {
  console.error('Typography ownership guard failed. New typography declarations must live in ui/typography*.');
  console.error(`For intentional poster/marketing artwork only, add an adjacent "${EXEMPT}" comment.`);
  for (const item of violations) console.error(`- ${item.file}: ${item.line}`);
  process.exit(1);
}

console.log('Typography ownership guard OK: no new local typography declarations outside the global owner.');

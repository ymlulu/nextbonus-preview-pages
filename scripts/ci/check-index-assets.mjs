import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const indexPath = path.join(ROOT, 'index.html');
const html = await readFile(indexPath, 'utf8');
const refs = [];
const tagPattern = /<(?:script|link)\b[^>]*?\b(?:src|href)\s*=\s*["']([^"']+)["'][^>]*>/gi;
let match;
while ((match = tagPattern.exec(html))) refs.push(match[1]);

function localPath(ref) {
  if (!ref || /^(?:[a-z]+:|\/\/|#)/i.test(ref)) return null;
  const clean = ref.split(/[?#]/, 1)[0].trim();
  if (!clean) return null;
  return path.join(ROOT, clean.replace(/^\/+/, ''));
}

const missing = [];
for (const ref of refs) {
  const target = localPath(ref);
  if (!target) continue;
  try {
    const info = await stat(target);
    if (!info.isFile()) missing.push(ref);
  } catch {
    missing.push(ref);
  }
}

if (missing.length) {
  console.error('index.html references missing local assets:');
  missing.forEach(ref => console.error(`- ${ref}`));
  process.exit(1);
}

console.log(`index.html local asset references OK (${refs.length} refs checked).`);

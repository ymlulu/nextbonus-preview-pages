import { readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const ROOT = process.cwd();
const SKIP_DIRS = new Set(['.git', 'node_modules']);

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.isDirectory() && SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(full));
    else if (entry.isFile() && /\.(?:js|mjs|cjs)$/i.test(entry.name)) files.push(full);
  }
  return files;
}

const files = (await walk(ROOT)).sort();
const failures = [];
for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (result.status !== 0) {
    failures.push({
      file: path.relative(ROOT, file),
      message: (result.stderr || result.stdout || 'syntax check failed').trim()
    });
  }
}

if (failures.length) {
  for (const failure of failures) {
    console.error(`\n[syntax] ${failure.file}\n${failure.message}`);
  }
  process.exit(1);
}

console.log(`JavaScript syntax OK (${files.length} files).`);

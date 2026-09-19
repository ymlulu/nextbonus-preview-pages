import { readFile } from 'node:fs/promises';

if (process.env.GITHUB_EVENT_NAME !== 'pull_request') {
  console.log('PR preflight acknowledgement skipped outside pull_request events.');
  process.exit(0);
}

const eventPath = process.env.GITHUB_EVENT_PATH;
if (!eventPath) {
  console.error('GITHUB_EVENT_PATH is unavailable.');
  process.exit(1);
}

const event = JSON.parse(await readFile(eventPath, 'utf8'));
const body = String(event.pull_request?.body || '');
const required = '- [x] Preflight: read AGENTS.md and ARCHITECTURE.md before editing';

if (!body.includes(required)) {
  console.error('PR preflight acknowledgement is missing.');
  console.error('Read AGENTS.md and ARCHITECTURE.md before editing, then add this exact checked line to the PR body:');
  console.error(required);
  process.exit(1);
}

console.log('PR preflight acknowledgement present.');

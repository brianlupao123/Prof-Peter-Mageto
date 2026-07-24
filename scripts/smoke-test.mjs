import { spawn } from 'node:child_process';

const siteUrl = (process.env.SITE_URL || 'https://prof-peter-mageto.vercel.app').replace(/\/$/, '');
const publicRoutes = ['/', '/leadership', '/scholarship', '/strategy', '/roadmap', '/contact', '/sources'];
const npmCli = process.env.npm_execpath;

function runNodeScript(scriptPath, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [scriptPath, ...args], { stdio: 'inherit' });
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`node ${scriptPath} ${args.join(' ')} failed with exit code ${code}`));
    });
  });
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), Number(process.env.SMOKE_TIMEOUT_MS || 10000));

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

if (!npmCli) {
  throw new Error('npm_execpath is not available; run this script through npm run smoke.');
}

await runNodeScript(npmCli, ['run', 'build']);

const failures = [];

for (const route of publicRoutes) {
  const response = await fetchWithTimeout(`${siteUrl}${route}`);
  if (!response.ok) {
    failures.push(`${route} returned ${response.status}`);
  } else {
    console.log(`OK public ${route} -> ${response.status}`);
  }
}

const protectedResponse = await fetchWithTimeout(`${siteUrl}/api/messages`);
if (![401, 403].includes(protectedResponse.status)) {
  failures.push(`/api/messages without auth returned ${protectedResponse.status}, expected 401 or 403`);
} else {
  console.log(`OK protected /api/messages unauthenticated -> ${protectedResponse.status}`);
}

if (failures.length > 0) {
  console.error('\nSmoke test failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`\nSmoke test passed for ${siteUrl}`);

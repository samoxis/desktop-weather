import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createServer } from '../server.mjs';

test('Local server serves the app and rejects cross-origin, host spoofing and traversal', async t => {
  const snapshot = { schemaVersion: 1, mode: 'live', cpu: { loadPercent: 14 } };
  const server = createServer({ port: 4783, telemetry: { snapshot: () => snapshot } });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  function request(path, headers = {}, method = 'GET') {
    return new Promise((resolve, reject) => {
      const req = http.request({ hostname: '127.0.0.1', port: server.address().port, path, method, headers: { Host: '127.0.0.1:4783', ...headers } }, response => {
        let body = ''; response.on('data', chunk => body += chunk); response.on('end', () => resolve({ status: response.statusCode, body, headers: response.headers }));
      }); req.on('error', reject); req.end();
    });
  }
  const index = await request('/'); assert.equal(index.status, 200); assert.match(index.body, /Desktop Weather/);
  const css = await request('/style.css'); assert.equal(css.status, 200); assert.match(css.headers['content-type'], /text\/css/);
  const api = await request('/api/telemetry'); assert.equal(api.status, 200); assert.deepEqual(JSON.parse(api.body), snapshot);
  assert.equal(api.headers['cache-control'], 'no-store');
  assert.equal(api.headers['access-control-allow-origin'], undefined);
  assert.equal((await request('/api/telemetry', { Host: 'attacker.example:4783' })).status, 403);
  assert.equal((await request('/api/telemetry', { Origin: 'https://attacker.example' })).status, 403);
  assert.equal((await request('/api/telemetry', {}, 'POST')).status, 405);
  assert.equal((await request('/%2e%2e%2fpackage.json')).status, 403);
  assert.equal((await request('/..%5cpackage.json')).status, 403);
  assert.equal((await request('/.env')).status, 404);
  assert.equal((await request('/missing')).status, 404);
  assert.equal((await request('/', {}, 'HEAD')).body, '');
});

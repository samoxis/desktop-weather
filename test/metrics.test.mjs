import test from 'node:test';
import assert from 'node:assert/strict';
import { cpuUsage, counterRate, networkRate, parseNvidia, isFresh, finite } from '../src/metrics.mjs';
import { sceneActivity, demoSnapshot, formatRate, formatPercent } from '../public/model.mjs';

const cpu = (user, idle) => ({ times: { user, idle, sys: 0, nice: 0, irq: 0 } });
test('CPU percentage uses deltas across all logical CPUs', () => {
  assert.equal(cpuUsage([cpu(100, 100), cpu(100, 100)], [cpu(150, 150), cpu(100, 200)]), 25);
});
test('CPU warmup, topology change and reset stay unavailable', () => {
  assert.equal(cpuUsage(null, [cpu(1, 1)]), null);
  assert.equal(cpuUsage([cpu(1, 1)], [cpu(1, 1), cpu(1, 1)]), null);
  assert.equal(cpuUsage([cpu(100, 100)], [cpu(10, 10)]), null);
  assert.equal(cpuUsage([cpu(1, 1)], [cpu(1, 1)]), null);
});
test('Counter deltas reject reset, unavailable readings and zero duration', () => {
  assert.equal(counterRate(100, 400, 3), 100);
  assert.equal(counterRate(400, 100, 3), null);
  assert.equal(counterRate(null, 100, 3), null);
  assert.equal(counterRate(0, 100, 0), null);
});
test('Network selects the busiest interface without summing duplicated traffic', () => {
  const before = [{ id: 'Ethernet', rxBytes: 0, txBytes: 0 }, { id: 'VPN', rxBytes: 0, txBytes: 0 }];
  const after = [{ id: 'Ethernet', rxBytes: 1000, txBytes: 100 }, { id: 'VPN', rxBytes: 900, txBytes: 100 }];
  assert.equal(networkRate(before, after, 1).downBytesPerSec, 1000);
  assert.equal(networkRate(before, after, 1, 'VPN').downBytesPerSec, 900);
  assert.equal(networkRate(before, after, 1, 'missing'), null);
});
test('NVIDIA CSV preserves supported readings and unsupported sensors independently', () => {
  const gpu = parseNvidia('52, 61, 4096, 8192, 143.25, [N/A]\n0, 33, 0, 4096, N/A, 0');
  assert.equal(gpu.length, 2);
  assert.equal(gpu[0].vramPercent, 50);
  assert.equal(gpu[0].powerW, 143.25);
  assert.equal(gpu[0].fanPercent, null);
  assert.equal(gpu[1].powerW, null);
  assert.equal(gpu[1].fanPercent, 0);
  assert.deepEqual(parseNvidia('malformed output'), []);
});
test('Invalid numeric sensors never become real zero readings', () => {
  for (const v of [null, undefined, '', true, 'N/A', Infinity]) assert.equal(finite(v), null);
  assert.equal(finite(0), 0);
  assert.equal(finite(101, 0, 100), null);
});
test('Freshness rejects stale or future timestamps', () => {
  assert.equal(isFresh(10000, 20000), true);
  assert.equal(isFresh(10000, 23000), false);
  assert.equal(isFresh(30000, 20000), false);
  assert.equal(isFresh(null, 20000), false);
});
test('GPU choice, usage and rain calibration affect the scenery', () => {
  const data = demoSnapshot('render');
  data.gpu.devices.push({ index: 1, loadPercent: 10 });
  assert.equal(sceneActivity(data, 25, 1).fireflies, .1);
  assert.equal(sceneActivity(data, 1, 0).rain, 1);
  assert.ok(sceneActivity(data, 100, 0).rain < .1);
});
test('Missing telemetry leaves the world at rest, with unavailable labels', () => {
  assert.deepEqual(sceneActivity(null), { wind: 0, glow: 0, fireflies: 0, rain: 0, ripples: 0 });
  assert.equal(formatRate(null), '—');
  assert.equal(formatPercent(null), '—');
  assert.equal(formatRate(0), '0 B/s');
  assert.equal(formatRate(2e6), '2.0 MB/s');
});

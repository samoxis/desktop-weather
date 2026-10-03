export function clamp(value, low = 0, high = 1) { return Math.max(low, Math.min(high, value)); }
export function number(value) { return typeof value === 'number' && Number.isFinite(value) ? value : null; }
export function formatPercent(value) { return number(value) === null ? '—' : `${Math.round(value)}%`; }
export function formatRate(value) {
  if (number(value) === null) return '—';
  if (value >= 1e6) return `${(value / 1e6).toFixed(1)} MB/s`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)} KB/s`;
  return `${Math.round(value)} B/s`;
}
export function demoSnapshot(mode, time = 0) {
  const presets = {
    idle: [9, 7, 32, .02, .01, .3, .1, 34],
    game: [58, 92, 68, .4, .1, 6, 2, 69],
    render: [94, 97, 86, 1.2, .4, 45, 24, 74],
    download: [24, 12, 49, 68, 2, 4, 65, 39]
  };
  const p = presets[mode] || presets.idle;
  const wave = Math.sin(time / 9000) * 2;
  return { schemaVersion: 1, mode: 'demo', timestamp: Date.now(),
    cpu: { loadPercent: clamp(p[0] + wave, 0, 100), temperatureC: null },
    memory: { usedPercent: p[2], usedBytes: p[2] / 100 * 32 * 1073741824, totalBytes: 32 * 1073741824 },
    network: { downBytesPerSec: p[3] * 1e6, upBytesPerSec: p[4] * 1e6, adapter: 'Simulated adapter' },
    disk: { readBytesPerSec: p[5] * 1e6, writeBytesPerSec: p[6] * 1e6 },
    gpu: { status: 'demo', devices: [{ index: 0, loadPercent: clamp(p[1] + wave, 0, 100), temperatureC: p[7], vramUsedBytes: 6 * 1073741824, vramTotalBytes: 12 * 1073741824, vramPercent: 50, powerW: p[1] * 2.4, fanPercent: p[1] * .6, source: 'simulated' }] }
  };
}
export function sceneActivity(data, rainScale = 25, gpuIndex = 0) {
  const gpu = data?.gpu?.devices?.find(item => item.index === gpuIndex);
  const down = number(data?.network?.downBytesPerSec);
  const up = number(data?.network?.upBytesPerSec);
  const read = number(data?.disk?.readBytesPerSec), write = number(data?.disk?.writeBytesPerSec);
  return {
    wind: clamp((number(data?.cpu?.loadPercent) ?? 0) / 100),
    glow: clamp((number(data?.memory?.usedPercent) ?? 0) / 100),
    fireflies: clamp((number(gpu?.loadPercent) ?? 0) / 100),
    rain: down === null || up === null ? 0 : clamp((down + up) / (Math.max(1, rainScale) * 1e6)),
    ripples: read === null || write === null ? 0 : clamp((read + write) / 100e6)
  };
}

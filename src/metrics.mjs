export function finite(value, min = 0, max = Infinity) {
  if (value === null || value === undefined || value === '' || typeof value === 'boolean') return null;
  const n = Number(value);
  return Number.isFinite(n) && n >= min && n <= max ? n : null;
}

export function cpuUsage(previous, current) {
  if (!previous || previous.length !== current.length) return null;
  let idle = 0, total = 0;
  for (let i = 0; i < current.length; i++) {
    for (const key of ['user', 'nice', 'sys', 'idle', 'irq']) {
      const delta = current[i].times[key] - previous[i].times[key];
      if (delta < 0) return null;
      total += delta;
      if (key === 'idle') idle += delta;
    }
  }
  return total > 0 ? Math.max(0, Math.min(100, (1 - idle / total) * 100)) : null;
}

export function counterRate(previous, current, seconds) {
  if (finite(previous) === null || finite(current) === null || seconds <= 0 || current < previous) return null;
  return (current - previous) / seconds;
}

export function networkRate(previous, current, seconds, selected = null) {
  if (!previous) return null;
  const candidates = current.flatMap(adapter => {
    if (selected && adapter.id !== selected) return [];
    const before = previous.find(item => item.id === adapter.id);
    if (!before) return [];
    const down = counterRate(before.rxBytes, adapter.rxBytes, seconds);
    const up = counterRate(before.txBytes, adapter.txBytes, seconds);
    return down === null || up === null ? [] : [{ downBytesPerSec: down, upBytesPerSec: up, adapter: adapter.id }];
  });
  // Never sum physical + virtual interfaces: that can count the same traffic twice.
  return candidates.sort((a, b) => (b.downBytesPerSec + b.upBytesPerSec) - (a.downBytesPerSec + a.upBytesPerSec))[0] ?? null;
}

export function parseNvidia(text) {
  return text.trim().split(/\r?\n/).filter(Boolean).map((line, index) => {
    const fields = line.split(',').map(item => item.trim());
    if (fields.length !== 6) return null;
    const [loadPercent, temperatureC, usedMiB, totalMiB, powerW, fanPercent] = fields;
    const used = finite(usedMiB), total = finite(totalMiB, 1);
    return {
      index,
      loadPercent: finite(loadPercent, 0, 100),
      temperatureC: finite(temperatureC, -30, 150),
      vramUsedBytes: used === null ? null : used * 1048576,
      vramTotalBytes: total === null ? null : total * 1048576,
      vramPercent: used === null || total === null || used > total ? null : used / total * 100,
      powerW: finite(powerW),
      fanPercent: finite(fanPercent, 0, 100),
      source: 'nvidia-smi'
    };
  }).filter(Boolean);
}

export function isFresh(timestamp, now = Date.now(), maxAge = 12000) {
  return Number.isFinite(timestamp) && now >= timestamp && now - timestamp <= maxAge;
}

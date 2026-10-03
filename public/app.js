import { clamp, number, formatPercent, formatRate, demoSnapshot, sceneActivity } from './model.mjs';
const $ = id => document.getElementById(id);
const params = new URLSearchParams(location.search);
const local = ['localhost', '127.0.0.1'].includes(location.hostname);
let saved = {};
try { saved = JSON.parse(localStorage.getItem('desktop-weather-settings') || '{}'); } catch { }
const settings = {
  mode: params.get('demo') || (local ? 'live' : 'idle'),
  light: saved.light || 'morning', quality: saved.quality || 'eco',
  rainScale: Number(saved.rainScale) || 25, gpuIndex: Number(saved.gpuIndex) || 0,
  showMetrics: saved.showMetrics !== false
};
if (!['live', 'idle', 'game', 'render', 'download'].includes(settings.mode)) settings.mode = 'idle';
if (!['morning', 'dusk', 'night', 'auto'].includes(settings.light)) settings.light = 'morning';
if (!['eco', 'balanced', 'still'].includes(settings.quality)) settings.quality = 'eco';
settings.rainScale = clamp(settings.rainScale, 1, 100);
let data = null, connection = 'connecting', lastReceived = 0, activity = sceneActivity(null), target = activity;
let inScreenMode = params.get('screen') === '1', fetchBusy = false;
const media = matchMedia('(prefers-reduced-motion: reduce)');
const scene = $('scene'), canvas = $('weather'), context = canvas.getContext('2d');
let width = 1, height = 1, lastDraw = 0, frameCount = 0;
const particles = Array.from({ length: 80 }, (_, i) => ({ x: ((i * 47 + 17) % 101) / 101, y: ((i * 31 + 3) % 97) / 97, phase: i * 1.7 }));
const windows = [[.232,.311],[.225,.33],[.264,.369],[.266,.397],[.46,.289],[.465,.32],[.498,.363],[.479,.393],[.217,.466],[.218,.493],[.321,.54],[.358,.507],[.408,.515],[.702,.499],[.804,.457],[.824,.431],[.835,.488],[.806,.601],[.776,.584],[.771,.519]];

function persist() {
  try { localStorage.setItem('desktop-weather-settings', JSON.stringify({ light: settings.light, quality: settings.quality, rainScale: settings.rainScale, gpuIndex: settings.gpuIndex, showMetrics: settings.showMetrics })); } catch { }
}
function updateSettings() {
  $('mode').value = settings.mode; $('light').value = settings.light;
  $('quality').value = settings.quality; $('rain-scale').value = settings.rainScale;
  $('rain-output').value = settings.rainScale; $('show-metrics').checked = settings.showMetrics;
  $('source-note').textContent = settings.mode === 'live'
    ? 'Live readings come from the local companion. Missing sensors stay unavailable.'
    : 'Demo values are simulated. This page does not read your computer or upload telemetry.';
  $('readings').hidden = inScreenMode && !settings.showMetrics;
}
function screenMode(value) {
  inScreenMode = value;
  document.body.classList.toggle('screen-mode', value);
  $('restore-ui').hidden = !value;
  $('settings').hidden = true; $('settings-button').setAttribute('aria-expanded', 'false');
  updateSettings(); resize();
}
function applyLight() {
  const hour = new Date().getHours();
  const light = settings.light === 'auto' ? hour >= 7 && hour < 17 ? 'morning' : hour >= 17 && hour < 20 ? 'dusk' : 'night' : settings.light;
  scene.dataset.light = light;
  $('clock').textContent = new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(new Date());
  $('time-label').textContent = { morning: 'Morning light', dusk: 'Golden hour', night: 'Moonlight' }[light];
}
function setBar(id, value) { $(id + '-bar').style.width = `${clamp(number(value) ?? 0, 0, 100)}%`; }
function renderReadings() {
  const isDemo = settings.mode !== 'live';
  if (!isDemo && lastReceived && Date.now() - lastReceived > 12000) { data = null; connection = 'unavailable'; }
  const gpu = data?.gpu?.devices?.find(item => item.index === settings.gpuIndex);
  const cpu = number(data?.cpu?.loadPercent), ram = number(data?.memory?.usedPercent);
  const down = number(data?.network?.downBytesPerSec), up = number(data?.network?.upBytesPerSec);
  const read = number(data?.disk?.readBytesPerSec), write = number(data?.disk?.writeBytesPerSec);
  $('cpu').textContent = formatPercent(cpu);
  $('cpu-detail').textContent = cpu === null ? 'CPU reading unavailable' : 'Total processor activity';
  $('gpu').textContent = formatPercent(gpu?.loadPercent);
  const gpuDetails = [];
  if (number(gpu?.temperatureC) !== null) gpuDetails.push(`${Math.round(gpu.temperatureC)} °C`);
  if (number(gpu?.powerW) !== null) gpuDetails.push(`${Math.round(gpu.powerW)} W`);
  if (number(gpu?.vramUsedBytes) !== null && number(gpu?.vramTotalBytes) !== null) gpuDetails.push(`VRAM ${(gpu.vramUsedBytes / 1073741824).toFixed(1)}/${(gpu.vramTotalBytes / 1073741824).toFixed(1)} GiB`);
  $('gpu-detail').textContent = gpu ? gpuDetails.join(' · ') || 'GPU sensors unavailable' : data?.gpu?.status === 'disabled' ? 'GPU collection disabled' : 'NVIDIA GPU unavailable';
  $('ram').textContent = formatPercent(ram);
  $('ram-detail').textContent = ram === null ? 'Memory reading unavailable' : `${(data.memory.usedBytes / 1073741824).toFixed(1)} / ${(data.memory.totalBytes / 1073741824).toFixed(1)} GiB`;
  $('network').textContent = formatRate(down);
  $('network-detail').textContent = down === null ? 'Network reading unavailable' : `↓ download · ↑ ${formatRate(up)}`;
  $('disk').textContent = formatRate(write);
  $('disk-detail').textContent = write === null ? 'Disk reading unavailable' : `write · read ${formatRate(read)}`;
  setBar('cpu', cpu); setBar('gpu', gpu?.loadPercent); setBar('ram', ram);
  setBar('network', down === null || up === null ? null : (down + up) / (settings.rainScale * 1e6) * 100);
  setBar('disk', read === null || write === null ? null : (read + write) / 1e6);
  $('source').dataset.state = isDemo ? 'demo' : connection;
  $('source').textContent = isDemo ? 'Demo · simulated' : connection === 'live' ? 'Live · local' : connection === 'connecting' ? 'Connecting' : 'Unavailable';
  $('footer-source').textContent = isDemo ? 'Simulated readings · browser demo' : 'Local telemetry · no account · no cloud';
  $('scene-status').textContent = isDemo ? 'Illustrated world · simulated telemetry' : connection === 'live' ? 'Connected to this computer · updates every 3s' : 'No live data · scenery resting';
  const title = isDemo ? { idle: 'A quiet morning.', game: 'A little more life.', render: 'Busy, but peaceful.', download: 'A passing shower.' }[settings.mode] : connection === 'live' ? 'Your PC, at its own pace.' : 'A small world.\nWaiting for a heartbeat.';
  $('scene-title').textContent = title;
  $('scene-description').textContent = isDemo ? 'Explore how system activity changes the coast.' : connection === 'live' ? 'Real readings. Gentle changes. Everything stays local.' : 'Start the local companion to see real readings.';
  const options = data?.gpu?.devices || [];
  const desired = options.length ? options.map(g => `${g.index}`).join(',') : 'none';
  if ($('gpu-device').dataset.devices !== desired) {
    $('gpu-device').replaceChildren();
    for (const g of options.length ? options : [{ index: 0 }]) {
      const option = document.createElement('option'); option.value = g.index;
      option.textContent = options.length ? `GPU ${g.index + 1}${isDemo ? ' · simulated' : ' · NVIDIA'}` : 'GPU unavailable';
      $('gpu-device').appendChild(option);
    }
    $('gpu-device').dataset.devices = desired;
  }
  $('gpu-device').value = String(settings.gpuIndex);
  target = sceneActivity(data, settings.rainScale, settings.gpuIndex);
  applyLight();
}
async function sample() {
  if (document.hidden || fetchBusy) return;
  if (settings.mode !== 'live') { data = demoSnapshot(settings.mode, performance.now()); renderReadings(); return; }
  fetchBusy = true;
  try {
    const response = await fetch('./api/telemetry', { cache: 'no-store', signal: AbortSignal.timeout(5000) });
    if (!response.ok) throw new Error('Collector unavailable');
    const snapshot = await response.json();
    if (snapshot.schemaVersion !== 1 || snapshot.mode !== 'live' || !Number.isFinite(snapshot.timestamp) || Date.now() - snapshot.timestamp > 12000) throw new Error('Invalid telemetry');
    if (settings.mode === 'live') { data = snapshot; lastReceived = Date.now(); connection = 'live'; }
  } catch { if (settings.mode === 'live') { data = null; connection = 'unavailable'; } }
  finally { fetchBusy = false; renderReadings(); }
}
function resize() {
  const rect = scene.getBoundingClientRect(); width = rect.width; height = rect.height;
  const ratio = Math.min(devicePixelRatio || 1, settings.quality === 'eco' ? 1.25 : 2);
  canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  lastDraw = 0;
}
function scenePoint(x, y) {
  const imageRatio = 1672 / 941, scale = Math.max(width / 1672, height / 941);
  const imageWidth = 1672 * scale, imageHeight = imageWidth / imageRatio;
  return [x * imageWidth + (width - imageWidth) * (width < 480 ? .54 : .5), y * imageHeight + (height - imageHeight) * .5];
}
function draw(now) {
  requestAnimationFrame(draw);
  if (document.hidden) return;
  const still = settings.quality === 'still' || media.matches;
  const interval = still ? 1000 : settings.quality === 'eco' ? 1000 / 15 : 1000 / 30;
  if (now - lastDraw < interval) return;
  const dt = Math.min(.1, (now - lastDraw) / 1000 || .03); lastDraw = now; frameCount++;
  for (const key of Object.keys(activity)) activity[key] += (target[key] - activity[key]) * (still ? 1 : .06);
  context.clearRect(0, 0, width, height);
  const night = scene.dataset.light === 'night', time = still ? 0 : now / 1000;
  // Anchored highlights follow the illustrated windows; they are not new 3D geometry.
  windows.slice(0, Math.round(activity.glow * windows.length)).forEach(([x, y]) => {
    const [px, py] = scenePoint(x, y), radius = Math.max(4, width * .009);
    const gradient = context.createRadialGradient(px, py, 0, px, py, radius);
    gradient.addColorStop(0, night ? '#ffd69ba0' : '#ffe6b54a'); gradient.addColorStop(1, '#ffd69b00');
    context.fillStyle = gradient; context.fillRect(px - radius, py - radius, radius * 2, radius * 2);
  });
  const fireflies = Math.round(activity.fireflies * 22);
  for (let i = 0; i < fireflies; i++) {
    const p = particles[i], [x, y] = scenePoint(.22 + p.x * .64 + Math.sin(time * .25 + p.phase) * .015, .39 + p.y * .28 + Math.cos(time * .4 + p.phase) * .008);
    context.fillStyle = night ? '#ffdf9fb0' : '#fff3cbad'; context.shadowColor = '#eac187'; context.shadowBlur = night ? 9 : 3;
    context.beginPath(); context.arc(x, y, 1.5 + Math.sin(time + p.phase) * .4, 0, Math.PI * 2); context.fill();
  }
  context.shadowBlur = 0;
  if (activity.rain > .025) {
    context.strokeStyle = night ? '#b7d4e258' : '#56879b46'; context.lineWidth = 1;
    for (let i = 0; i < Math.round(activity.rain * 65); i++) {
      const p = particles[i]; if (!still) p.y = (p.y + dt * (.14 + activity.rain * .08)) % 1;
      const x = width * (.52 + p.x * .46), y = p.y * height;
      context.beginPath(); context.moveTo(x, y); context.lineTo(x - 2 - activity.wind * 3, y + 7); context.stroke();
    }
  }
  for (let i = 0; i < 3 + Math.round(activity.ripples * 12); i++) {
    const p = particles[i + 30], [x, y] = scenePoint(.6 + p.x * .11, .64 + p.y * .16);
    const phase = (time * (.2 + activity.ripples * .3) + p.phase) % 1;
    context.strokeStyle = `rgba(223,239,230,${(1 - phase) * .25})`;
    context.beginPath(); context.ellipse(x, y, 2 + phase * 12, 1 + phase * 3, 0, 0, Math.PI * 2); context.stroke();
  }
  // Soft floating seed motes express CPU-driven wind, never inferred temperature.
  for (let i = 0; i < Math.round(activity.wind * 16); i++) {
    const p = particles[i + 55], x = ((p.x + time * (.008 + activity.wind * .012)) % 1) * width;
    const y = (.2 + p.y * .55 + Math.sin(time + p.phase) * .008) * height;
    context.fillStyle = '#f7edc780'; context.beginPath(); context.ellipse(x, y, 2.2, 1, -.5, 0, Math.PI * 2); context.fill();
  }
}
function toggleSettings() { $('settings').hidden = !$('settings').hidden; $('settings-button').setAttribute('aria-expanded', String(!$('settings').hidden)); }
async function fullscreen() {
  try { if (!document.fullscreenElement) await document.documentElement.requestFullscreen(); else await document.exitFullscreen(); }
  catch { $('fullscreen').textContent = 'Use browser F11'; }
}
$('settings-button').addEventListener('click', toggleSettings);
$('close-settings').addEventListener('click', toggleSettings);
$('fullscreen').addEventListener('click', fullscreen);
$('hide-ui').addEventListener('click', () => screenMode(true));
$('restore-ui').addEventListener('click', () => screenMode(false));
for (const [id, key] of [['light', 'light'], ['quality', 'quality']]) $(id).addEventListener('change', event => { settings[key] = event.target.value; persist(); renderReadings(); resize(); });
$('mode').addEventListener('change', event => { settings.mode = event.target.value; data = null; connection = 'connecting'; lastReceived = 0; updateSettings(); renderReadings(); sample(); });
$('gpu-device').addEventListener('change', event => { settings.gpuIndex = Number(event.target.value); persist(); renderReadings(); });
$('rain-scale').addEventListener('input', event => { settings.rainScale = Number(event.target.value); persist(); updateSettings(); renderReadings(); });
$('show-metrics').addEventListener('change', event => { settings.showMetrics = event.target.checked; persist(); updateSettings(); });
document.addEventListener('keydown', event => {
  if (['INPUT', 'SELECT', 'TEXTAREA'].includes(event.target.tagName) || event.ctrlKey || event.metaKey || event.altKey) return;
  if (event.key.toLowerCase() === 'k') screenMode(!inScreenMode);
  if (event.key.toLowerCase() === 'f') fullscreen();
  if (event.key === 'Escape' && !$('settings').hidden) toggleSettings();
});
document.addEventListener('visibilitychange', () => { if (!document.hidden) { lastDraw = 0; sample(); } });
new ResizeObserver(resize).observe(scene);
media.addEventListener('change', resize);
window.desktopWeather = { get state() { return { mode: settings.mode, connection, activity: { ...target }, frames: frameCount }; } };
updateSettings(); screenMode(inScreenMode); renderReadings(); sample();
setInterval(sample, 3000); requestAnimationFrame(draw);

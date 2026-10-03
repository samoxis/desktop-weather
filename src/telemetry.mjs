import os from 'node:os';
import { spawn, execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { cpuUsage, counterRate, networkRate, parseNvidia, isFresh } from './metrics.mjs';

export class Telemetry {
  constructor({ intervalMs = 3000, gpu = true, networkInterface = null } = {}) {
    this.previousCpu = os.cpus();
    this.cpu = null;
    this.io = { network: null, disk: null, timestamp: null };
    this.gpu = { devices: [], timestamp: null, status: gpu ? 'starting' : 'disabled' };
    this.started = Date.now();
    this.gpuBusy = false;
    this.closed = false;
    this.networkInterface = networkInterface;
    this.intervalMs = intervalMs;
    this.timer = setInterval(() => this.tick(gpu), intervalMs);
    if (os.platform() === 'win32') this.startWindowsCounters();
    if (gpu) this.pollGpu();
  }

  tick(gpu) {
    const current = os.cpus();
    this.cpu = cpuUsage(this.previousCpu, current);
    this.previousCpu = current;
    if (gpu) this.pollGpu();
  }

  startWindowsCounters() {
    const script = fileURLToPath(new URL('../scripts/windows-counters.ps1', import.meta.url));
    this.collector = spawn('powershell.exe', ['-NoLogo', '-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', script], { windowsHide: true, stdio: ['ignore', 'pipe', 'ignore'] });
    let buffer = '', previous = null;
    this.collector.stdout.setEncoding('utf8');
    this.collector.stdout.on('data', chunk => {
      buffer += chunk;
      if (buffer.length > 1048576) buffer = '';
      let newline;
      while ((newline = buffer.indexOf('\n')) >= 0) {
        const line = buffer.slice(0, newline).trim();
        buffer = buffer.slice(newline + 1);
        try {
          const current = JSON.parse(line);
          const now = Date.now();
          const seconds = previous ? (now - previous.timestamp) / 1000 : 0;
          const network = Array.isArray(current.network) && Array.isArray(previous?.network)
            ? networkRate(previous.network, current.network, seconds, this.networkInterface) : null;
          const disk = current.disk && previous?.disk ? {
            readBytesPerSec: counterRate(previous.disk.readBytes, current.disk.readBytes, seconds),
            writeBytesPerSec: counterRate(previous.disk.writeBytes, current.disk.writeBytes, seconds)
          } : null;
          this.io = { network, disk, timestamp: now };
          previous = { ...current, timestamp: now };
        } catch { /* A broken collector line is never treated as a zero reading. */ }
      }
    });
    this.collector.on('error', () => { this.io = { network: null, disk: null, timestamp: null }; });
    this.collector.on('exit', () => { this.io = { network: null, disk: null, timestamp: null }; });
  }

  pollGpu() {
    if (this.gpuBusy || this.closed) return;
    this.gpuBusy = true;
    this.gpuProcess = execFile('nvidia-smi', [
      '--query-gpu=utilization.gpu,temperature.gpu,memory.used,memory.total,power.draw,fan.speed',
      '--format=csv,noheader,nounits'
    ], { windowsHide: true, timeout: 2200, maxBuffer: 65536 }, (error, stdout) => {
      this.gpuBusy = false;
      if (this.closed) return;
      const devices = error ? [] : parseNvidia(stdout);
      this.gpu = { devices, timestamp: devices.length ? Date.now() : null, status: devices.length ? 'available' : 'unavailable' };
    });
  }

  snapshot() {
    const now = Date.now(), total = os.totalmem(), free = os.freemem();
    const ioFresh = isFresh(this.io.timestamp, now);
    const gpuFresh = isFresh(this.gpu.timestamp, now);
    return {
      schemaVersion: 1, mode: 'live', timestamp: now,
      cpu: { loadPercent: this.cpu, source: 'node:os', temperatureC: null },
      memory: { usedBytes: total - free, totalBytes: total, usedPercent: (1 - free / total) * 100, source: 'node:os' },
      network: ioFresh ? this.io.network : null,
      disk: ioFresh ? this.io.disk : null,
      gpu: { devices: gpuFresh ? this.gpu.devices : [], status: gpuFresh ? 'available' : this.gpu.status === 'available' ? 'stale' : this.gpu.status },
      cooling: { coolantCpuC: null, coolantGpuC: null, pumpRpm: null },
      sources: { io: os.platform() === 'win32' ? ioFresh ? 'windows-cim' : 'unavailable' : 'unsupported', gpu: 'nvidia-smi' },
      sampledEveryMs: this.intervalMs
    };
  }

  close() {
    this.closed = true;
    clearInterval(this.timer);
    this.collector?.kill();
    this.gpuProcess?.kill();
  }
}

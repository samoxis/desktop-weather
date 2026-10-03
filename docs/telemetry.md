# Telemetry contract

## Sources and units

The local server returns `GET /api/telemetry`, schema version 1. CPU and GPU utilization are percentages, temperature is °C, power is watts, storage quantities are bytes, rates are bytes/second. The UI displays decimal MB/s and binary GiB. Sensor absence is `null`; an empty GPU list means no current GPU reading.

| Field | Source | Caveat |
|---|---|---|
| `cpu.loadPercent` | Delta of `os.cpus()` time counters, across logical CPUs | First sample unavailable; reflects the sampling interval |
| `memory.usedPercent` | `os.totalmem()` minus `os.freemem()` | Physical-memory occupancy, not committed memory; may differ from Task Manager categories |
| `network.downBytesPerSec`, `upBytesPerSec` | Delta of Windows `Win32_PerfRawData_Tcpip_NetworkInterface` byte counters | Busiest adapter, or explicitly pinned adapter; includes protocol overhead and local-network traffic, not just Internet downloads |
| `disk.readBytesPerSec`, `writeBytesPerSec` | Delta of `Win32_PerfRawData_PerfDisk_PhysicalDisk`, `_Total` | Aggregate physical-disk I/O; not remaining capacity |
| `gpu.devices[].loadPercent` | `nvidia-smi utilization.gpu` | Driver-provided aggregate utilization; not the Windows per-engine display |
| `temperatureC` | `nvidia-smi temperature.gpu` | GPU temperature, not hotspot, VRAM or water temperature |
| `vramUsedBytes`, `vramTotalBytes` | `nvidia-smi memory.used`, `memory.total` | NVIDIA MiB converted to bytes |
| `powerW` | `nvidia-smi power.draw` | Sensor/driver availability varies |
| `fanPercent` | `nvidia-smi fan.speed` | Percentage; not RPM. Unsupported fans remain `null` |

The Windows collector runs in a hidden, persistent, noninteractive PowerShell process. It reads CIM counters about every three seconds; it makes no system changes. `-ExecutionPolicy Bypass` applies only to that child process, not the machine's stored policy. Network/disk require two samples. Failed or stale readings are suppressed after 12 seconds. Failed NVIDIA queries immediately become unavailable. The UI likewise clears readings when its local request fails; it never falls back silently to demo values.

## Pin an interface

Use the exact `adapter` string in your own local API response. Names remain local and are not part of the public demo.

PowerShell:

```powershell
$env:DW_INTERFACE = 'Your exact CIM adapter name'
node server.mjs
```

If that name is not present, the network reading is unavailable. No guesses or fallback to another interface.

To change the listening port, set `DW_PORT` (1024–65535). Binding remains loopback only. This initial release intentionally does not offer LAN binding.

## Optional future sensor adapters

LibreHardwareMonitor and HWiNFO expose richer hardware readings, but board/sensor support, privileges and licensing vary. They are not bundled or enabled by v0.1. A future adapter must carry the source, unit, identifier, freshness and explicit user-selected mapping. CPU-loop water and GPU-loop water must be separate fields; neither may be inferred from chip temperatures. The current `cooling` fields are reserved and always `null`.

## Browser limitations

A static web page cannot access these OS/hardware readings by itself. The GitHub Pages demo always uses simulated data. A remote demo does not connect to the local companion. Live mode is supported from the companion's own local origin only.

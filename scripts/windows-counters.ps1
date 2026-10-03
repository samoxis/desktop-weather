param([switch]$Once)
# Read-only raw counters. No registry edits, drivers or system settings.
$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
do {
    $result = @{ network = $null; disk = $null }
    try {
        $rows = Get-CimInstance -ClassName Win32_PerfRawData_Tcpip_NetworkInterface
        $result.network = @($rows | ForEach-Object {
            @{ id = $_.Name; rxBytes = [double]$_.BytesReceivedPersec; txBytes = [double]$_.BytesSentPersec }
        })
    } catch { }
    try {
        $diskRow = Get-CimInstance -ClassName Win32_PerfRawData_PerfDisk_PhysicalDisk | Where-Object { $_.Name -eq '_Total' } | Select-Object -First 1
        if ($null -ne $diskRow) {
            $result.disk = @{ readBytes = [double]$diskRow.DiskReadBytesPersec; writeBytes = [double]$diskRow.DiskWriteBytesPersec }
        }
    } catch { }
    $result | ConvertTo-Json -Depth 5 -Compress
    if (-not $Once) { Start-Sleep -Seconds 3 }
} while (-not $Once)

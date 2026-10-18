$p = 'd:\GITHUB\undangan-digital\event-loader.js'
$lines = Get-Content $p
# Ubah baris terakhir yang non-kosong dari '});' menjadi '})();'
for ($i = $lines.Length - 1; $i -ge 0; $i--) {
    if ($lines[$i].Trim() -ne '') {
        if ($lines[$i].Trim() -eq '});') {
            $lines[$i] = $lines[$i] -replace '}\);$', '})();'
        }
        break
    }
}
Set-Content $p -Value $lines -Encoding UTF8
Write-Host "Selesai."
$p = 'd:\GITHUB\undangan-digital\event-loader.js'
$c = Get-Content $p -Raw
# Ganti penutup IIFE terakhir '});' menjadi '})();'
$c = $c -replace '\}\);\s*$', '})();'
Set-Content $p -Value $c -Encoding UTF8
Write-Host "Selesai."
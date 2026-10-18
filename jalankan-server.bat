@echo off
REM Nyalakan server undangan digital di localhost:8080 (klik 2x file ini)
cd /d "%~dp0"
echo ============================================
echo  UNDANGAN DIGITAL - Putra ^& Putri
echo ============================================
echo  Buka di browser: http://localhost:8080
echo  Tutup jendela ini untuk menghentikan server.
echo ============================================
node serve.js 8080
pause

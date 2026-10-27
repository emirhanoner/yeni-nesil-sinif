@echo off
chcp 65001 >nul
title GitHub'a Yukleniyor...
echo ========================================================
echo  Yeni Nesil Sinif Projesi GitHub'a Yukleniyor...
echo ========================================================
cd /d "%~dp0"

"%LOCALAPPDATA%\Programs\MinGit\cmd\git.exe" push -u origin main

echo.
if %ERRORLEVEL% equ 0 (
    echo ========================================================
    echo  [BASARILI] Tum dosyalar GitHub'a yuklendi!
    echo  Depo Adresi: https://github.com/emirhanoner/yeni-nesil-sinif
    echo ========================================================
) else (
    echo ========================================================
    echo  [BILGI] GitHub giris ekranini onaylamaniz gerekebilir.
    echo ========================================================
)
echo.
pause

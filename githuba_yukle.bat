@echo off
chcp 65001 >nul
title GitHub'a Yukleniyor...
echo ========================================================
echo  Yeni Nesil Sinif Dosyalari GitHub Kök Dizinine Yukleniyor...
echo ========================================================
cd /d "%~dp0"

"%LOCALAPPDATA%\Programs\MinGit\cmd\git.exe" push -u origin main --force

echo.
if %ERRORLEVEL% equ 0 (
    echo ========================================================
    echo  [TEBRIKLER] Tum dosyalar GitHub ana dizinine yuklendi!
    echo  Siteniz 1 dakika icinde surada acilacaktir:
    echo  https://emirhanoner.github.io/yeni-nesil-sinif/
    echo ========================================================
) else (
    echo ========================================================
    echo  Eger GitHub giris ekrani acildiysa lutfen onaylayin.
    echo ========================================================
)
echo.
pause

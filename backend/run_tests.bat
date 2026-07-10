@echo off
REM Script de test des rapports

echo 🚀 Démarrage du serveur backend...
cd /d a:\BD_v5_fix\projet_v4\backend

REM Démarrer le serveur en arrière-plan
start /B node server.js

echo.
echo ⏳ Attente du démarrage du serveur (3 secondes)...
timeout /t 3 /nobreak

echo.
echo 🧪 Exécution des tests API...
echo.

REM Exécuter les tests
node test_rapports_api.js

REM Arrêter le serveur Node
taskkill /F /IM node.exe /T 2>NUL

exit /B 0

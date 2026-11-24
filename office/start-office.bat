@echo off
title First Fix AI Office
cd /d "%~dp0"
where node >nul 2>nul || (echo Node.js is required: https://nodejs.org & pause & exit /b 1)
start "" http://localhost:4321
node server.js 4321
pause

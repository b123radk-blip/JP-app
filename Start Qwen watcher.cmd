@echo off
rem Double-click to start the Qwen watcher (docs/QWEN.md). Close this window or press Ctrl+C to stop it.
cd /d "%~dp0"
node scripts\qwen-watch.mjs %*
pause

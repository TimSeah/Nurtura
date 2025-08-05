@echo off
echo Testing batch file...
if "%1"=="test" (
    echo Test command received!
    echo Parameter 1: %1
) else (
    echo No parameter or different parameter
    echo Parameter 1: %1
)
echo Done.

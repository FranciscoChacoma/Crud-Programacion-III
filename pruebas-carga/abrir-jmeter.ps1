# Abre la interfaz grafica de JMeter con el plan de prueba ya cargado.
# El plan crea solo su organizador y su torneo al apretar Start (no hace falta preparar nada).
#
# Uso:  powershell -ExecutionPolicy Bypass -File .\abrir-jmeter.ps1
#       powershell -ExecutionPolicy Bypass -File .\abrir-jmeter.ps1 -Usuarios 50 -RampUp 10

param(
    [int]$Usuarios = 50,
    [int]$RampUp = 10
)

$aqui = $PSScriptRoot

$candidatos = @("C:\jmeter\bin\jmeter.bat")
$candidatos += Get-ChildItem "C:\jmeter\apache-jmeter-*\bin\jmeter.bat" -ErrorAction SilentlyContinue | ForEach-Object FullName
if ($env:JMETER_HOME) { $candidatos += Join-Path $env:JMETER_HOME "bin\jmeter.bat" }
$candidatos += Get-Command jmeter.bat -ErrorAction SilentlyContinue | ForEach-Object Source
$jmeter = $candidatos | Where-Object { $_ -and (Test-Path $_) } | Select-Object -First 1
if (-not $jmeter) {
    Write-Host "No encontre jmeter.bat (busque en C:\jmeter, JMETER_HOME y PATH)" -ForegroundColor Red
    exit 1
}

# action_if_file_exists=APPEND evita el cartel de "el archivo ya existe" al apretar Start
& $jmeter -t (Join-Path $aqui "inscripcion-parejas.jmx") "-Jusuarios=$Usuarios" "-Jrampup=$RampUp" "-Jresultcollector.action_if_file_exists=APPEND"

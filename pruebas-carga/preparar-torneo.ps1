# Prepara los datos previos para la prueba de carga:
#   1. Crea (o reutiliza) un organizador de prueba y obtiene su token
#   2. Crea (o reutiliza) el torneo "Torneo Prueba Carga JMeter"
#   3. Guarda el UUID del torneo en torneo.properties para que JMeter lo use
#
# Uso:  powershell -ExecutionPolicy Bypass -File .\preparar-torneo.ps1

param(
    [string]$BaseUrl = "http://localhost:8080/api"
)

$ErrorActionPreference = "Stop"
$NombreTorneo = "Torneo Prueba Carga JMeter"
$Email = "jmeter@prueba.local"
$Password = "jmeter123"

function Invoke-Api($Method, $Path, $Body, $Token) {
    $headers = @{}
    if ($Token) { $headers["Authorization"] = "Bearer $Token" }
    $params = @{ Method = $Method; Uri = "$BaseUrl$Path"; Headers = $headers; ContentType = "application/json" }
    if ($Body) { $params["Body"] = ($Body | ConvertTo-Json) }
    Invoke-RestMethod @params
}

try {
    $torneos = Invoke-Api GET "/tournaments"
} catch {
    Write-Host "No se pudo conectar al backend en $BaseUrl. Esta corriendo?" -ForegroundColor Red
    exit 1
}

$torneo = $torneos | Where-Object { $_.name -eq $NombreTorneo } | Select-Object -First 1

if ($torneo) {
    Write-Host "El torneo de prueba ya existe, se reutiliza."
} else {
    try {
        $token = (Invoke-Api POST "/auth/register" @{ name = "Organizador JMeter"; email = $Email; password = $Password }).token
    } catch {
        $token = (Invoke-Api POST "/auth/login" @{ email = $Email; password = $Password }).token
    }
    $torneo = Invoke-Api POST "/tournaments" @{ name = $NombreTorneo; type = "ESTANDAR"; category = "A3" } $token
    Write-Host "Torneo de prueba creado."
}

$archivo = Join-Path $PSScriptRoot "torneo.properties"
"torneoId=$($torneo.id)" | Set-Content -Path $archivo -Encoding ascii

# Tambien lo deja como valor por defecto en el .jmx, para que funcione aunque se abra directo desde JMeter
$jmx = Join-Path $PSScriptRoot "inscripcion-parejas.jmx"
$contenido = [System.IO.File]::ReadAllText($jmx)
$contenido = [regex]::Replace($contenido, '\$\{__P\(torneoId,[^)]*\)\}', "`${__P(torneoId,$($torneo.id))}")
[System.IO.File]::WriteAllText($jmx, $contenido)

Write-Host "UUID del torneo: $($torneo.id)" -ForegroundColor Green
Write-Host "Guardado en: $archivo"

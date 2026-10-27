# Corre la prueba de carga de inscripcion de parejas en modo consola (sin interfaz)
# con distintas cantidades de usuarios y al final muestra una tabla comparativa.
#
# Uso:  powershell -ExecutionPolicy Bypass -File .\correr-pruebas.ps1
#       powershell -ExecutionPolicy Bypass -File .\correr-pruebas.ps1 -Usuarios "10,50" -RampUp 1
#
# Requisitos: PostgreSQL y backend corriendo (puerto 8080). El plan crea solo su organizador y su torneo.

param(
    [string]$Usuarios = "10,50,100,200,400",
    [int]$RampUp = 10,
    [string]$JMeter = "",
    [string]$Psql = "",
    [int]$PausaEntreCorridas = 5,
    [switch]$SinLimpiar
)

$ErrorActionPreference = "Stop"
$aqui = $PSScriptRoot
$jmx = Join-Path $aqui "inscripcion-parejas.jmx"

# --- Buscar JMeter ---
if (-not $JMeter) {
    $candidatos = @("C:\jmeter\bin\jmeter.bat")
    $candidatos += Get-ChildItem "C:\jmeter\apache-jmeter-*\bin\jmeter.bat" -ErrorAction SilentlyContinue | ForEach-Object FullName
    if ($env:JMETER_HOME) { $candidatos += Join-Path $env:JMETER_HOME "bin\jmeter.bat" }
    $candidatos += Get-Command jmeter.bat -ErrorAction SilentlyContinue | ForEach-Object Source
    $JMeter = $candidatos | Where-Object { $_ -and (Test-Path $_) } | Select-Object -First 1
}
if (-not $JMeter -or -not (Test-Path $JMeter)) {
    Write-Host "No encontre jmeter.bat (busque en C:\jmeter, JMETER_HOME y PATH). Pasalo con -JMeter <ruta>" -ForegroundColor Red
    exit 1
}

# --- Buscar psql (para limpiar las inscripciones de prueba) ---
if (-not $Psql) {
    $Psql = @(Get-Command psql.exe -ErrorAction SilentlyContinue | ForEach-Object Source) +
            @(Get-ChildItem "C:\Program Files\PostgreSQL\*\bin\psql.exe" -ErrorAction SilentlyContinue | Sort-Object FullName -Descending | ForEach-Object FullName) |
            Where-Object { $_ } | Select-Object -First 1
}

# --- Verificar backend y torneo ---
try {
    Invoke-RestMethod "http://localhost:8080/api/players" -TimeoutSec 5 | Out-Null
} catch {
    Write-Host "El backend no responde en http://localhost:8080. Levantalo antes de correr la prueba." -ForegroundColor Red
    exit 1
}

function Limpiar-Inscripciones {
    if ($SinLimpiar) { return }
    if (-not $Psql -or -not (Test-Path $Psql)) {
        Write-Host "  (no encontre psql, no se limpian las inscripciones de prueba)" -ForegroundColor Yellow
        return
    }
    $env:PGPASSWORD = "admin"
    & $Psql -h localhost -U postgres -d padel_db -q -v ON_ERROR_STOP=1 -f (Join-Path $aqui "limpiar.sql") | Out-Null
    if ($LASTEXITCODE -ne 0) { Write-Host "  (fallo la limpieza con psql)" -ForegroundColor Yellow }
}

function Medir($jtl, $n) {
    # Solo cuentan las inscripciones (no la preparacion: crear organizador y torneo)
    $filas = @(Import-Csv $jtl | Where-Object { $_.label -like "POST /api/pairs*" })
    $total = $filas.Count
    if ($total -eq 0) { return $null }

    $tiempos = $filas | ForEach-Object { [long]$_.elapsed } | Sort-Object
    $errores = @($filas | Where-Object { $_.success -ne "true" })
    $inicio = ($filas | ForEach-Object { [long]$_.timeStamp } | Measure-Object -Minimum).Minimum
    $fin = ($filas | ForEach-Object { [long]$_.timeStamp + [long]$_.elapsed } | Measure-Object -Maximum).Maximum
    $segundos = [math]::Max(($fin - $inicio) / 1000.0, 0.001)
    $p90 = $tiempos[[math]::Max([math]::Ceiling($total * 0.9) - 1, 0)]

    $errorMasComun = ""
    if ($errores.Count -gt 0) {
        $errorMasComun = ($errores | Group-Object { "$($_.responseCode) $($_.responseMessage)" } |
            Sort-Object Count -Descending | Select-Object -First 1).Name
    }

    [pscustomobject]@{
        "Usuarios"          = $n
        "Peticiones"        = $total
        "Promedio (ms)"     = [math]::Round(($tiempos | Measure-Object -Average).Average)
        "P90 (ms)"          = $p90
        "Max (ms)"          = $tiempos[-1]
        "Error %"           = [math]::Round(100.0 * $errores.Count / $total, 2)
        "Throughput (req/s)"= [math]::Round($total / $segundos, 2)
        "Error mas comun"   = $errorMasComun
    }
}

$carpeta = Join-Path $aqui ("resultados\" + (Get-Date -Format "yyyyMMdd-HHmmss"))
New-Item -ItemType Directory -Force $carpeta | Out-Null
$tabla = @()

foreach ($n in ($Usuarios -split "," | ForEach-Object { [int]$_.Trim() })) {
    Write-Host ""
    Write-Host "=== Corrida con $n usuarios (ramp-up $RampUp s) ===" -ForegroundColor Cyan
    Limpiar-Inscripciones

    $jtl = Join-Path $carpeta "$n-usuarios.jtl"
    $reporte = Join-Path $carpeta "reporte-$n-usuarios"
    $log = Join-Path $carpeta "$n-usuarios.log"

    & $JMeter -n -t $jmx "-Jusuarios=$n" "-Jrampup=$RampUp" -l $jtl -e -o $reporte -j $log

    if (Test-Path $jtl) {
        $fila = Medir $jtl $n
        if ($fila) { $tabla += $fila }
    } else {
        Write-Host "  JMeter no genero resultados, revisa $log" -ForegroundColor Red
    }
    Start-Sleep -Seconds $PausaEntreCorridas
}

Limpiar-Inscripciones

# --- Tabla final ---
Write-Host ""
Write-Host "================ RESULTADOS ================" -ForegroundColor Green
$tabla | Format-Table "Usuarios", "Promedio (ms)", "P90 (ms)", "Max (ms)", "Error %", "Throughput (req/s)", "Error mas comun" -AutoSize | Out-Host
$tabla | Export-Csv (Join-Path $carpeta "resumen.csv") -NoTypeInformation -Encoding UTF8

# --- Deteccion de degradacion: error > 1% o promedio > 3 veces el de la primera corrida ---
if ($tabla.Count -gt 0) {
    $base = [math]::Max($tabla[0]."Promedio (ms)", 50)
    $ultimaOk = $null
    $primeraMala = $null
    foreach ($f in $tabla) {
        $mala = ($f."Error %" -gt 1) -or ($f."Promedio (ms)" -gt 3 * $base)
        if ($mala) { $primeraMala = $f; break }
        $ultimaOk = $f
    }
    Write-Host "Criterio: se considera degradado si el error supera el 1% o el promedio supera 3 veces el de $($tabla[0].Usuarios) usuarios (minimo 50 ms de base, o sea mas de $(3 * $base) ms)."
    if ($primeraMala) {
        $motivo = @()
        if ($primeraMala."Error %" -gt 1) { $motivo += "error $($primeraMala.'Error %')%" }
        if ($primeraMala."Promedio (ms)" -gt 3 * $base) { $motivo += "promedio $($primeraMala.'Promedio (ms)') ms" }
        if ($ultimaOk) { Write-Host "Ultima carga estable: $($ultimaOk.Usuarios) usuarios." -ForegroundColor Green }
        Write-Host "Se degrada a partir de: $($primeraMala.Usuarios) usuarios ($($motivo -join ', '))." -ForegroundColor Yellow
    } else {
        Write-Host "No se detecto degradacion hasta $($tabla[-1].Usuarios) usuarios." -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Resultados guardados en: $carpeta"
Write-Host "  - resumen.csv               -> la tabla de arriba"
Write-Host "  - N-usuarios.jtl            -> cada peticion (se puede abrir en Summary Report / View Results Tree)"
Write-Host "  - reporte-N-usuarios\index.html -> reporte HTML con graficos"

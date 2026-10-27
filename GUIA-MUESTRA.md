# Guía para la muestra – PadelSync

Todo lo necesario para dejar PadelSync andando en una PC nueva (netbook de la muestra) y presentar las pruebas.

## 1. Qué pide la consigna y con qué lo cubrimos

| Requisito | Cómo lo cubrimos |
|---|---|
| **Entorno activo en vivo** con datos realistas | La app corriendo local (backend + frontend + PostgreSQL) con la base de `muestra/padel_db.sql`: torneo "Torneo noviembre 2026" de 1ra con 16 parejas, grupos jugados, llaves completas (campeones Tapia / Coello) y 30 jugadores sueltos (10 sin mail). Cuenta: **demo@padelsync.local / padelsync**. Los emails de los jugadores son todos `@example.com` (no se mandan a nadie real). |
| **Ejecución visual** de las pruebas de aceptación | **Playwright UI** (`npm run test:uat:ui`): se ve al navegador inscribir parejas, validar categorías y generar el fixture en tiempo real. |
| **Dossier impreso** de 10 historias en Gherkin | Lo arma el equipo (Maximiliano). Correcciones hechas: HU3 esc. 2 (6ta y 7ma explícito), HU6 esc. 2 (mínimo 2 franjas), HU7 esc. 2 (sin sede con canchas o menos de 2 parejas), HU8 esc. 2 (al mover un partido a un lugar ocupado se intercambian). |
| Extra: prueba de carga | **JMeter** (`pruebas-carga/`), ver `pruebas-carga/LEEME.md`. |

La prueba de Playwright cubre en vivo las HU1, HU2, HU3 (ambos escenarios), HU4, HU7 y HU10.

## 2. Instalar en la PC nueva (una sola vez)

1. **Git** – https://git-scm.com/download/win
2. **Java 25 (Temurin JDK)** – https://adoptium.net → JDK 25, Windows x64 `.msi`. En el instalador marcar *Set JAVA_HOME* y *Add to PATH*. Verificar con `java -version` (tiene que decir 25).
3. **PostgreSQL 17** – https://www.postgresql.org/download/windows/ . Usuario `postgres`, contraseña **`admin`**, puerto 5432 (es lo que espera `backend/src/main/resources/application.properties`).
4. **Node.js 22 o superior** – https://nodejs.org
5. **Google Chrome** (Playwright lo usa para la prueba visual).
6. **JMeter 5.6.3** (opcional, sólo para la prueba de carga) – descomprimir el `.zip` en `C:\jmeter`. Necesita Java, ya instalado en el paso 2.

## 3. Bajar el proyecto y cargar los datos

En una terminal PowerShell:

```powershell
cd $HOME\Desktop
git clone https://github.com/FranciscoChacoma/PadelSync.git
cd PadelSync

# Crear la base y cargar los datos de la muestra
$env:PGPASSWORD = "admin"
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -c "CREATE DATABASE padel_db;"
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -d padel_db -f muestra\padel_db.sql

# Dependencias del frontend
cd frontend
npm install
cd ..
```

Para volver los datos al estado original en cualquier momento, repetir sólo el comando `-f muestra\padel_db.sql` (borra y recarga todo).

## 4. Levantar la app (cada vez)

Dos terminales:

```powershell
# Terminal 1 – backend (http://localhost:8080)
cd backend
.\mvnw.cmd spring-boot:run
```

```powershell
# Terminal 2 – frontend (http://localhost:5173)
cd frontend
npm run dev
```

Abrir http://localhost:5173 e iniciar sesión con **demo@padelsync.local / padelsync**: ahí está el torneo de la muestra y la sede "Zone" con 4 canchas. La primera vez el backend tarda un par de minutos porque baja Maven y las dependencias (hace falta internet).

Si `mvnw` dice que la versión de Java no es 25: `$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-25..."` (la carpeta exacta que instaló) y volver a correrlo.

## 5. Prueba de aceptación visual (Playwright)

Con la app levantada, en una tercera terminal:

```powershell
cd frontend
npm run test:uat:ui
```

Se abre la ventana de Playwright → botón ▶ al lado de *inscripcion-parejas*. Se ve la app mientras el robot la usa y cada paso se marca en verde. Haciendo clic en un paso se ve cómo estaba la pantalla en ese momento.

Qué hace la prueba (`frontend/e2e/inscripcion-parejas.spec.ts`, ~8 segundos):

1. Registra un organizador nuevo y crea un torneo de 6ta.
2. Intenta inscribir un jugador de 5ta y uno de 8va → la app los **rechaza**.
3. Inscribe 4 parejas válidas (6ta y 7ma) → aparecen con el **indicador de categoría verde**.
4. Crea una sede con 2 canchas y **genera el fixture** → grupo con 6 partidos, todos con horario.

Otros comandos (desde `frontend`):

| Comando | Para qué |
|---|---|
| `npm run test:uat:ui` | Runner visual de Playwright (**el de la muestra**). |
| `npm run test:uat:demo` | Abre Chrome y se ve al robot en cámara lenta. |
| `npm run test:uat` | Corre la prueba sin ventana (resultado en la terminal). |
| `npm run test:uat:report` | Reporte HTML de la última corrida, con capturas. |

Cada corrida crea un organizador `uat…@padelpro.test` y un "Torneo UAT 6ta …" propios: no tocan el torneo de la muestra.

**Diferencia con JMeter:** Playwright prueba que la app haga lo correcto como lo ve un usuario (aceptación). JMeter manda muchos pedidos juntos al servidor para ver si aguanta (carga), no usa la pantalla.

## 6. Prueba de carga (JMeter, opcional)

Desde `pruebas-carga` y con el backend levantado:

```powershell
powershell -ExecutionPolicy Bypass -File .\abrir-jmeter.ps1     # con interfaz, ▶ Start
powershell -ExecutionPolicy Bypass -File .\correr-pruebas.ps1   # sin interfaz, tabla final
```

Crea sola el organizador **jmeter@prueba.local / jmeter123** y un torneo de 3ra, y 50 usuarios virtuales inscriben parejas. Detalle completo en `pruebas-carga/LEEME.md`.

## 7. Otros documentos

- `INFORME-FIXTURE.txt`: cómo se arma el fixture (grupos, franjas, 1:30 por partido, nunca 3 seguidos), pruebas de estrés y regla de categorías.
- `pruebas-carga/LEEME.md`: guía de JMeter paso a paso.

## 8. Si algo falla

| Síntoma | Causa probable |
|---|---|
| Playwright: `ECONNREFUSED` o la página no carga | El frontend o el backend no están levantados. |
| Backend: `password authentication failed` | La contraseña de `postgres` no es `admin`. |
| Backend: `database "padel_db" does not exist` | Falta el paso 3 (crear y cargar la base). |
| Backend: error de versión de Java | No está usando el JDK 25 (ver paso 4). |
| Playwright: no encuentra Chrome | Instalar Google Chrome. |
| El puerto 5173 u 8080 está ocupado | Ya hay otra copia corriendo: cerrar esas terminales. |

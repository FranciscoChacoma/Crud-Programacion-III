# Prueba de carga: inscripción de parejas (JMeter)

Esta prueba mide qué pasa cuando muchas personas inscriben parejas **al mismo tiempo**, como cuando se abre la inscripción a un torneo popular.

El plan es **autónomo**: al apretar Start, primero crea solo un organizador y un torneo de 3ra nuevos, y después todos los usuarios virtuales inscriben parejas en ese torneo. No hay que preparar nada antes.

- **Paso 1, preparación (1 vez por corrida):** `POST /api/auth/register` (crea el organizador `jmeter@prueba.local` si no existe), `POST /api/auth/login` (obtiene su token) y `POST /api/tournaments` (crea el torneo "Torneo Prueba Carga JMeter <fecha>" con ese token).
- **Paso 2, endpoint probado:** `POST http://localhost:8080/api/pairs`. Cada pareja lleva nombre, apellido, email y categoría de los dos jugadores (uno de 3ra y otro de 4ta, válidos para un torneo de 3ra), el nivel y 2 franjas horarias. Los jugadores se crean solos.
- **Respuesta correcta:** `200 OK`

## Archivos

| Archivo | Para qué sirve |
|---|---|
| `inscripcion-parejas.jmx` | Plan de prueba de JMeter (se abre con la interfaz gráfica). |
| `abrir-jmeter.ps1` | Abre JMeter con el plan ya cargado. |
| `correr-pruebas.ps1` | Corre la prueba sin interfaz con varias cantidades de usuarios y muestra la tabla final. |
| `limpiar.sql` | Borra solo los torneos, organizadores y jugadores de prueba. El script lo ejecuta solo. |

## En una PC nueva

Además de lo que ya usa el proyecto (Java, PostgreSQL con la base `padel_db` y Node para el frontend), hace falta:

1. **JMeter 5.6.3**: descargar el `.zip` de https://jmeter.apache.org/download_jmeter.cgi y descomprimirlo en `C:\jmeter`. Los scripts también lo encuentran si está en el `PATH` o si existe la variable `JMETER_HOME`.
2. Nada más: el plan crea su propio organizador y torneo en la base de esa PC.

## Antes de empezar

1. **PostgreSQL** tiene que estar corriendo (base `padel_db`).
2. **Backend** levantado, desde la carpeta `backend`:
   ```powershell
   .\mvnw.cmd spring-boot:run
   ```

## Demo en vivo (con interfaz)

```powershell
powershell -ExecutionPolicy Bypass -File .\abrir-jmeter.ps1
```

Qué mostrar en cada parte del árbol de la izquierda:

1. **1. Preparación: crear organizador y torneo** (setUp Thread Group): corre una sola vez, antes que todo.
   - *POST /api/auth/register*: crea el organizador `jmeter@prueba.local` (si ya existe responde 400, y también se acepta).
   - *POST /api/auth/login*: inicia sesión; el extractor JSON guarda el `token`.
   - *POST /api/tournaments*: crea el torneo de 3ra mandando `Authorization: Bearer ${token}`; guarda su `id` y lo comparte con los usuarios del paso 2.
2. **2. Usuarios inscribiendo parejas** (Thread Group):
   - *Number of Threads* = `${__P(usuarios,50)}`, es decir 50 usuarios virtuales (cada uno es una persona inscribiéndose).
   - *Ramp-up* = 10 segundos (los 50 usuarios arrancan repartidos en 10 segundos).
   - *Loop* = 1 (cada usuario inscribe una pareja).
3. **HTTP Request Defaults:** `localhost`, puerto `8080`.
4. **HTTP Header Manager:** `Content-Type: application/json`.
5. **POST /api/pairs:** el JSON. `${__threadNum}` y `${__RandomString}` hacen que cada usuario mande jugadores distintos, con su email y su categoría.
6. **Verificar código 200 OK** (Response Assertion): si la respuesta no es 200, se cuenta como error.
7. Apretar el botón verde **▶ Start**.
8. **Summary Report:** mirar *Average* (tiempo promedio en ms), *Error %* y *Throughput* (peticiones por segundo). Las dos filas de preparación aparecen una sola vez; la que importa es *POST /api/pairs*.
9. **View Results Tree:** cada petición aparece en verde (OK) o en rojo (error). Al hacer clic, la pestaña *Response data* muestra lo que respondió el backend.
10. Para mostrar el resultado en la app: cerrar sesión e iniciar con **jmeter@prueba.local / jmeter123**. Ahí aparece el torneo "Torneo Prueba Carga JMeter …" con todas las parejas que inscribió JMeter.

> Entre una corrida y otra conviene limpiar los resultados en pantalla con el botón de la escoba (**Clear All**).


## Prueba completa (sin interfaz)

Es la de la consigna: 10, 50, 100, 200 y 400 usuarios con 10 segundos de ramp-up.
```powershell
powershell -ExecutionPolicy Bypass -File .\correr-pruebas.ps1
```

Prueba de estrés, con todos los usuarios llegando en 1 segundo. Es la que muestra el límite:
```powershell
powershell -ExecutionPolicy Bypass -File .\correr-pruebas.ps1 -RampUp 1 -Usuarios "100,200,400,800,1600,3200"
```

Antes de cada corrida el script borra los torneos e inscripciones de prueba anteriores y vuelve a borrar al terminar. Los resultados quedan en `resultados\<fecha>\`:

- `resumen.csv`: la tabla final.
- `reporte-N-usuarios\index.html`: reporte con gráficos, ideal para mostrar.
- `N-usuarios.jtl`: cada petición. Se puede abrir en el Summary Report o en el View Results Tree con el botón *Browse...*.

Para limpiar a mano:
```powershell
$env:PGPASSWORD="admin"; & "C:\Program Files\PostgreSQL\17\bin\psql.exe" -h localhost -U postgres -d padel_db -f .\limpiar.sql
```

## Glosario rápido

- **Usuario virtual (thread):** una "persona" simulada por JMeter.
- **Ramp-up:** cuántos segundos tarda JMeter en arrancar a todos los usuarios. Con 50 usuarios y 10 segundos, arranca uno cada 0,2 segundos. Con 1 segundo, llegan casi todos juntos.
- **Promedio (Average):** cuánto tarda en promedio el backend en responder, en milisegundos.
- **P90:** el 90% de las peticiones tardó menos que este valor.
- **Error %:** porcentaje de peticiones que no devolvieron 200.
- **Throughput:** cuántas peticiones por segundo atendió el backend.

## Resultados obtenidos (20/10/2026, en una notebook, con backend y JMeter en la misma máquina)

**Ramp-up 10 s (consigna):**

| Usuarios | Promedio (ms) | Error % | Throughput (req/s) |
|---:|---:|---:|---:|
| 10 | 14 | 0 | 1,1 |
| 50 | 10 | 0 | 5,1 |
| 100 | 8 | 0 | 10,2 |
| 200 | 7 | 0 | 20,2 |
| 400 | 18 | 0 | 40,4 |

**Ramp-up 1 s (estrés):**

| Usuarios | Promedio (ms) | P90 (ms) | Error % | Throughput (req/s) |
|---:|---:|---:|---:|---:|
| 100 | 8 | 9 | 0 | 108 |
| 200 | 10 | 27 | 0 | 216 |
| 400 | 11 | 24 | 0 | 356 |
| **800** | **278** | **666** | **3,12** | 702 |
| 1600 | 536 | 941 | 0 | 621 |
| 3200 | 2164 | 2972 | 0,53 | 559 |

Los errores fueron `Connection refused`: el backend rechazó conexiones nuevas porque se llenó la cola de espera de Tomcat (por defecto acepta 100 conexiones en espera).

## Conclusión (borrador)

Con la configuración de la consigna (50 usuarios en 10 segundos) el backend responde en unos **10 ms promedio con 0% de error**. Incluso con 400 usuarios repartidos en 10 segundos sigue estable, porque cada inscripción se resuelve tan rápido que los pedidos casi nunca coinciden.

Para encontrar el límite real hicimos llegar a todos los usuarios en 1 segundo, que es lo que pasa cuando se abre la inscripción a un torneo popular. El backend se mantiene estable **hasta 400 inscripciones simultáneas** (11 ms promedio, 0% de error, unas 350 peticiones por segundo). **A partir de 800 usuarios simultáneos se degrada:** el tiempo promedio pasa de 11 ms a 278 ms (25 veces más), el error sube a 3,1% (por encima del 1% aceptable) y el throughput deja de crecer y se estanca en unas 550 a 700 peticiones por segundo. Con 3200 usuarios el promedio llega a más de 2 segundos.

**Límite:** alrededor de **400 a 800 inscripciones simultáneas**, con un techo de unas **600 peticiones por segundo**. Por encima de eso los usuarios esperan cada vez más y algunos directamente no pueden conectarse.

**Mejoras posibles:** aumentar la cola de conexiones de Tomcat (`server.tomcat.accept-count`) y el pool de conexiones a la base (HikariCP, 10 por defecto), desactivar `spring.jpa.show-sql` (imprime cada consulta en consola) y agregar un índice o una restricción única en jugadores (nombre y apellido), porque la búsqueda de jugadores crece con cada inscripción.

> Los números dependen de la máquina. Si vuelven a correr la prueba, actualicen las tablas con los valores de su `resumen.csv`.

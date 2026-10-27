-- Borra SOLO los datos generados por JMeter:
--   * los torneos "Torneo Prueba Carga JMeter ..." con sus parejas, grupos y partidos
--   * los organizadores jmeter...@prueba.local de corridas viejas (el de la demo, jmeter@prueba.local, se conserva)
--   * los jugadores cuyo nombre empieza con "JMeter" y que ya no estan en ninguna pareja
-- No toca torneos, parejas ni jugadores reales.

BEGIN;

CREATE TEMP TABLE torneos_jmeter ON COMMIT DROP AS
SELECT id FROM tournaments WHERE name LIKE 'Torneo Prueba Carga JMeter%';

DELETE FROM matches WHERE tournament_id IN (SELECT id FROM torneos_jmeter);

DELETE FROM pair_available_schedules
WHERE pair_id IN (SELECT id FROM pairs WHERE tournament_id IN (SELECT id FROM torneos_jmeter));

DELETE FROM pairs WHERE tournament_id IN (SELECT id FROM torneos_jmeter);
DELETE FROM tournament_groups WHERE tournament_id IN (SELECT id FROM torneos_jmeter);
DELETE FROM tournament_venues WHERE tournament_id IN (SELECT id FROM torneos_jmeter);
DELETE FROM tournaments WHERE id IN (SELECT id FROM torneos_jmeter);

DELETE FROM organizers o
WHERE o.email LIKE 'jmeter%@prueba.local' AND o.email <> 'jmeter@prueba.local'
  AND NOT EXISTS (SELECT 1 FROM tournaments t WHERE t.organizer_id = o.id)
  AND NOT EXISTS (SELECT 1 FROM venues v WHERE v.organizer_id = o.id);

DELETE FROM players pl
WHERE pl.name LIKE 'JMeter%'
  AND NOT EXISTS (SELECT 1 FROM pairs p WHERE p.player1_id = pl.id OR p.player2_id = pl.id);

COMMIT;

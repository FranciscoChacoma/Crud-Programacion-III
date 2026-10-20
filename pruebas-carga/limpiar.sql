-- Borra SOLO los datos generados por JMeter:
--   * todas las parejas del torneo de prueba "Torneo Prueba Carga JMeter"
--   * los jugadores cuyo nombre empieza con "JMeter" y que ya no estan en ninguna pareja
-- No toca torneos, parejas ni jugadores reales.

BEGIN;

DELETE FROM matches
WHERE pair1_id IN (SELECT p.id FROM pairs p JOIN tournaments t ON t.id = p.tournament_id WHERE t.name = 'Torneo Prueba Carga JMeter')
   OR pair2_id IN (SELECT p.id FROM pairs p JOIN tournaments t ON t.id = p.tournament_id WHERE t.name = 'Torneo Prueba Carga JMeter');

DELETE FROM pair_available_schedules
WHERE pair_id IN (SELECT p.id FROM pairs p JOIN tournaments t ON t.id = p.tournament_id WHERE t.name = 'Torneo Prueba Carga JMeter');

DELETE FROM pairs
WHERE tournament_id IN (SELECT id FROM tournaments WHERE name = 'Torneo Prueba Carga JMeter');

DELETE FROM players pl
WHERE pl.name LIKE 'JMeter%'
  AND NOT EXISTS (SELECT 1 FROM pairs p WHERE p.player1_id = pl.id OR p.player2_id = pl.id);

COMMIT;

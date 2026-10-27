package com.example.backend.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Adapta bases creadas con versiones anteriores (ddl-auto=update agrega columnas
 * pero no quita restricciones ni columnas viejas). Es idempotente.
 */
@Component
@RequiredArgsConstructor
public class SchemaMigration implements ApplicationRunner {

    private final JdbcTemplate jdbc;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        // Antes un partido ocupaba una franja entera de 3 h: ese fixture no es compatible con los turnos de 1:30.
        if (columnExists("matches", "time_slot")) {
            jdbc.execute("DELETE FROM matches");
            jdbc.execute("ALTER TABLE matches DROP COLUMN time_slot");
            jdbc.execute("UPDATE pairs SET group_id = NULL");
            jdbc.execute("DELETE FROM tournament_groups");
        }
        for (String column : List.of("group_id", "pair1_id", "pair2_id")) {
            jdbc.execute("ALTER TABLE matches ALTER COLUMN " + column + " DROP NOT NULL");
        }

        // Antes cada torneo tenía sus propias canchas: se convierten en una sede por torneo.
        if (columnExists("courts", "tournament_id")) {
            List<Map<String, Object>> rows = jdbc.queryForList(
                "SELECT DISTINCT t.id, t.name, t.organizer_id FROM tournaments t JOIN courts c ON c.tournament_id = t.id");
            for (Map<String, Object> row : rows) {
                UUID venueId = UUID.randomUUID();
                jdbc.update("INSERT INTO venues (id, name, organizer_id) VALUES (?, ?, ?)",
                    venueId, "Sede " + row.get("name"), row.get("organizer_id"));
                jdbc.update("UPDATE courts SET venue_id = ? WHERE tournament_id = ?", venueId, row.get("id"));
                jdbc.update("INSERT INTO tournament_venues (tournament_id, venue_id) VALUES (?, ?)", row.get("id"), venueId);
            }
            jdbc.execute("ALTER TABLE courts DROP COLUMN tournament_id");
        }
    }

    private boolean columnExists(String table, String column) {
        Integer n = jdbc.queryForObject(
            "SELECT count(*) FROM information_schema.columns WHERE table_name = ? AND column_name = ?",
            Integer.class, table, column);
        return n != null && n > 0;
    }
}

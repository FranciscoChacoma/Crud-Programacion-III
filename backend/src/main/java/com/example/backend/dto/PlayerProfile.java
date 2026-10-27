package com.example.backend.dto;

import java.util.List;
import java.util.UUID;

public record PlayerProfile(
    UUID id,
    String name,
    String lastName,
    String email,
    String phone,
    String category,
    List<Participation> participations
) {
    /** Una inscripción del jugador: en qué torneo, con quién y en qué condiciones. */
    public record Participation(
        UUID pairId,
        UUID tournamentId,
        String tournamentName,
        String partner,
        String category,
        String level
    ) {}
}

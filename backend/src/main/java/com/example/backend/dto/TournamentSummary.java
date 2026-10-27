package com.example.backend.dto;

import com.example.backend.model.Venue;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/** Torneo con el estado de cada paso (parejas, sedes, grupos, llaves) para guiar al organizador. */
public record TournamentSummary(
    UUID id,
    String name,
    String type,
    String category,
    LocalDate startDate,
    String stage,
    List<Venue> venues,
    int pairCount,
    int courtCount,
    int groupCount,
    int groupMatches,
    int unscheduledMatches,
    int playedGroupMatches,
    int bracketMatches,
    int playedBracketMatches,
    String champion
) {}

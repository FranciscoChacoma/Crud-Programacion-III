package com.example.backend.dto;

import java.util.List;
import java.util.UUID;

/** Todo lo que necesita la pantalla de fase de grupos (y el PDF / los mails). */
public record FixtureView(
    String date,
    List<String> turns,
    List<CourtColumn> courts,
    List<GroupView> groups,
    List<MatchView> unscheduled,
    List<String> warnings,
    int totalMatches,
    int playedMatches,
    boolean complete
) {
    public record CourtColumn(UUID id, String name, String venueName) {}

    public record PairView(UUID id, String player1, String player2, String level, List<String> availability) {}

    public record SetScore(int pair1, int pair2) {}

    public record MatchView(
        UUID id,
        String groupName,
        PairView pair1,
        PairView pair2,
        Integer turn,
        String time,
        UUID courtId,
        String courtName,
        String venueName,
        List<SetScore> sets,
        UUID winnerId,
        List<String> issues,
        Integer bracketRound,
        Integer bracketPosition,
        String pair1Seed,
        String pair2Seed
    ) {}

    public record StandingRow(
        PairView pair, int position, int played, int won, int lost,
        int setsWon, int setsLost, int gamesWon, int gamesLost, boolean qualified
    ) {}

    public record GroupView(UUID id, String name, String category, List<PairView> pairs,
                            List<StandingRow> standings, List<MatchView> matches, boolean complete) {}
}

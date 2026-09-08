package com.example.backend.dto;

import com.example.backend.model.enums.Category;
import com.example.backend.model.enums.TimeSlot;

import java.util.List;
import java.util.UUID;

public record FixtureResult(
    List<GroupResult> groups,
    List<UnassignedMatch> unassignedMatches,
    List<String> warnings
) {
    public record PairSummary(UUID id, String player1, String player2, String category, String level) {}

    public record MatchResult(UUID id, PairSummary pair1, PairSummary pair2, String courtName, TimeSlot timeSlot) {}

    public record GroupResult(String name, Category category, List<PairSummary> pairs, List<MatchResult> matches) {}

    public record UnassignedMatch(PairSummary pair1, PairSummary pair2, String groupName, String reason) {}
}

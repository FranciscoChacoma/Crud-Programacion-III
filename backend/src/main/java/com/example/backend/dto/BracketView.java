package com.example.backend.dto;

import java.util.List;

public record BracketView(
    String date,
    boolean groupsComplete,
    int pendingGroupMatches,
    List<Qualifier> qualifiers,
    List<Round> rounds,
    FixtureView.PairView champion
) {
    public record Qualifier(String seed, FixtureView.PairView pair) {}

    public record Round(int size, String name, List<FixtureView.MatchView> matches) {}
}

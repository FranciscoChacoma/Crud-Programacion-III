package com.example.backend.dto;

import java.util.List;
import java.util.UUID;

public record TournamentVenuesRequest(List<UUID> venueIds) {}

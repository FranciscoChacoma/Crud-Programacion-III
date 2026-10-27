package com.example.backend.dto;

import java.time.LocalDate;

public record TournamentRequest(String name, String type, String category, LocalDate startDate) {}

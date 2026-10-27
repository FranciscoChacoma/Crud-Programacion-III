package com.example.backend.dto;

import java.util.UUID;

/** courtId y turn en null dejan el partido sin horario. */
public record MoveRequest(UUID courtId, Integer turn) {}

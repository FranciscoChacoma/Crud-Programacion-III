package com.example.backend.dto;
import java.util.List;
import java.util.UUID;
public record PairRequest(
    String player1Name,
    String player1LastName,
    String player1Email,
    String player1Category,
    String player2Name,
    String player2LastName,
    String player2Email,
    String player2Category,
    UUID tournamentId,
    String category,
    String level,
    List<String> availableSchedules
) {}

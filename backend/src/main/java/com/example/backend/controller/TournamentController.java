package com.example.backend.controller;

import com.example.backend.dto.TournamentRequest;
import com.example.backend.dto.TournamentSummary;
import com.example.backend.dto.TournamentVenuesRequest;
import com.example.backend.service.JwtService;
import com.example.backend.service.TournamentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tournaments")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class TournamentController {

    private final TournamentService tournamentService;
    private final JwtService jwtService;

    @PostMapping
    public ResponseEntity<TournamentSummary> create(
            @RequestBody TournamentRequest request,
            @RequestHeader("Authorization") String authHeader) {
        return ResponseEntity.ok(tournamentService.create(request, jwtService.emailFromHeader(authHeader)));
    }

    @GetMapping
    public ResponseEntity<List<TournamentSummary>> getAll(@RequestHeader("Authorization") String authHeader) {
        return ResponseEntity.ok(tournamentService.getAll(jwtService.emailFromHeader(authHeader)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TournamentSummary> get(@PathVariable UUID id) {
        return ResponseEntity.ok(tournamentService.get(id));
    }

    @PutMapping("/{id}/venues")
    public ResponseEntity<TournamentSummary> setVenues(
            @PathVariable UUID id,
            @RequestBody TournamentVenuesRequest request,
            @RequestHeader("Authorization") String authHeader) {
        return ResponseEntity.ok(tournamentService.setVenues(id, request.venueIds(), jwtService.emailFromHeader(authHeader)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        tournamentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

package com.example.backend.controller;

import com.example.backend.dto.CourtRequest;
import com.example.backend.model.Court;
import com.example.backend.service.CourtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tournaments/{tournamentId}/courts")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class CourtController {

    private final CourtService courtService;

    @PostMapping
    public ResponseEntity<Court> create(@PathVariable UUID tournamentId, @RequestBody CourtRequest request) {
        return ResponseEntity.ok(courtService.create(tournamentId, request.name()));
    }

    @GetMapping
    public ResponseEntity<List<Court>> getAll(@PathVariable UUID tournamentId) {
        return ResponseEntity.ok(courtService.getByTournament(tournamentId));
    }

    @DeleteMapping("/{courtId}")
    public ResponseEntity<Void> delete(@PathVariable UUID tournamentId, @PathVariable UUID courtId) {
        courtService.delete(courtId);
        return ResponseEntity.noContent().build();
    }
}

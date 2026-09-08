package com.example.backend.controller;

import com.example.backend.dto.TournamentRequest;
import com.example.backend.model.Tournament;
import com.example.backend.service.JwtService;
import com.example.backend.service.TournamentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/tournaments")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class TournamentController {

    private final TournamentService tournamentService;
    private final JwtService jwtService;

    @PostMapping
    public ResponseEntity<Tournament> create(
            @RequestBody TournamentRequest request,
            @RequestHeader("Authorization") String authHeader) {

        String token = authHeader.replace("Bearer ", "");
        String email = jwtService.extractEmail(token);
        return ResponseEntity.ok(tournamentService.create(request, email));
    }

    @GetMapping
    public ResponseEntity<List<Tournament>> getAll() {
        return ResponseEntity.ok(tournamentService.getAll());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable java.util.UUID id) {
        tournamentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
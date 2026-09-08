package com.example.backend.controller;

import com.example.backend.dto.FixtureResult;
import com.example.backend.service.FixtureService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/tournaments/{tournamentId}/fixture")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class FixtureController {

    private final FixtureService fixtureService;

    @PostMapping("/generate")
    public ResponseEntity<FixtureResult> generate(@PathVariable UUID tournamentId) {
        return ResponseEntity.ok(fixtureService.generate(tournamentId));
    }

    @GetMapping
    public ResponseEntity<FixtureResult> get(@PathVariable UUID tournamentId) {
        return ResponseEntity.ok(fixtureService.getFixture(tournamentId));
    }
}

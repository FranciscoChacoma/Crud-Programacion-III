package com.example.backend.controller;

import com.example.backend.dto.PairRequest;
import com.example.backend.model.Pair;
import com.example.backend.service.PairService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/pairs")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class PairController {

    private final PairService pairService;

    @PostMapping
    public ResponseEntity<Pair> create(@RequestBody PairRequest request) {
        return ResponseEntity.ok(pairService.create(request));
    }

    @GetMapping("/tournament/{tournamentId}")
    public ResponseEntity<List<Pair>> getByTournament(@PathVariable UUID tournamentId) {
        return ResponseEntity.ok(pairService.getByTournament(tournamentId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Pair> getOne(@PathVariable UUID id) {
        return ResponseEntity.ok(pairService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Pair> update(@PathVariable UUID id, @RequestBody PairRequest request) {
        return ResponseEntity.ok(pairService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        pairService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

package com.example.backend.controller;

import com.example.backend.dto.PlayerProfile;
import com.example.backend.dto.PlayerRequest;
import com.example.backend.model.Player;
import com.example.backend.service.PlayerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/players")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class PlayerController {

    private final PlayerService playerService;

    @GetMapping("/search")
    public ResponseEntity<List<Player>> search(@RequestParam String q) {
        return ResponseEntity.ok(playerService.search(q));
    }

    @GetMapping
    public ResponseEntity<List<PlayerProfile>> getAll() {
        return ResponseEntity.ok(playerService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PlayerProfile> getOne(@PathVariable UUID id) {
        return ResponseEntity.ok(playerService.getProfile(id));
    }

    @PostMapping
    public ResponseEntity<Player> create(@RequestBody PlayerRequest request) {
        return ResponseEntity.ok(playerService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Player> update(@PathVariable UUID id, @RequestBody PlayerRequest request) {
        return ResponseEntity.ok(playerService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        playerService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

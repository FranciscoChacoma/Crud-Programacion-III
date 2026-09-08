package com.example.backend.controller;

import com.example.backend.model.Player;
import com.example.backend.service.PlayerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

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
}
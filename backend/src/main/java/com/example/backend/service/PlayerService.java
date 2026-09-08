package com.example.backend.service;

import com.example.backend.model.Player;
import com.example.backend.repository.PlayerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PlayerService {

    private final PlayerRepository playerRepository;

    public List<Player> search(String query) {
        return playerRepository.findByNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(query, query)
            .stream().limit(10).toList();
    }

    public Player findOrCreate(String name, String lastName) {
        return playerRepository
            .findByNameIgnoreCaseAndLastNameIgnoreCase(name, lastName)
            .orElseGet(() -> {
                Player p = new Player();
                p.setName(name);
                p.setLastName(lastName);
                return playerRepository.save(p);
            });
    }
}
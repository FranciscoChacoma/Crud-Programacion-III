package com.example.backend.repository;

import com.example.backend.model.Player;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PlayerRepository extends JpaRepository<Player, UUID> {
    List<Player> findByNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(String name, String lastName);
    Optional<Player> findByNameIgnoreCaseAndLastNameIgnoreCase(String name, String lastName);
}
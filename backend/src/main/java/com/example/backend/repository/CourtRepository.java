package com.example.backend.repository;

import com.example.backend.model.Court;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface CourtRepository extends JpaRepository<Court, UUID> {
    List<Court> findByTournamentId(UUID tournamentId);
    void deleteByTournamentId(UUID tournamentId);
}

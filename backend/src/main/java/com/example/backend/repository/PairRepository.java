package com.example.backend.repository;

import com.example.backend.model.Pair;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface PairRepository extends JpaRepository<Pair, UUID> {
    List<Pair> findByTournamentId(UUID tournamentId);
    List<Pair> findByGroupId(UUID groupId);
}
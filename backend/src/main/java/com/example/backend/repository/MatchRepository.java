package com.example.backend.repository;

import com.example.backend.model.Match;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface MatchRepository extends JpaRepository<Match, UUID> {
    List<Match> findByGroupId(UUID groupId);
    List<Match> findByGroupTournamentId(UUID tournamentId);
    boolean existsByCourtId(UUID courtId);
    void deleteByGroupTournamentId(UUID tournamentId);
    void deleteByPair1IdOrPair2Id(UUID pair1Id, UUID pair2Id);
}

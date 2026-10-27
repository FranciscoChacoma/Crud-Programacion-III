package com.example.backend.repository;

import com.example.backend.model.Match;
import com.example.backend.model.enums.MatchStage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface MatchRepository extends JpaRepository<Match, UUID> {
    List<Match> findByTournamentIdAndStage(UUID tournamentId, MatchStage stage);
    List<Match> findByTournamentId(UUID tournamentId);
    boolean existsByCourtId(UUID courtId);
    boolean existsByCourtVenueId(UUID venueId);
    void deleteByTournamentIdAndStage(UUID tournamentId, MatchStage stage);
    void deleteByTournamentId(UUID tournamentId);
    void deleteByPair1IdOrPair2Id(UUID pair1Id, UUID pair2Id);
}

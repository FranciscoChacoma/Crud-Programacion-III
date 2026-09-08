package com.example.backend.repository;

import com.example.backend.model.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface GroupRepository extends JpaRepository<Group, UUID> {
    List<Group> findByTournamentId(UUID tournamentId);
    void deleteByTournamentId(UUID tournamentId);
}

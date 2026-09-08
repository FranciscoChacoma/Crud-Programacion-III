package com.example.backend.repository;

import com.example.backend.model.Tournament;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface TournamentRepository extends JpaRepository<Tournament, UUID> {}
package com.example.backend.repository;

import com.example.backend.model.Court;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface CourtRepository extends JpaRepository<Court, UUID> {}

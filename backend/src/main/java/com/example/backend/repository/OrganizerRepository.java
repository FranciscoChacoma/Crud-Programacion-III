package com.example.backend.repository;

import com.example.backend.model.Organizer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface OrganizerRepository extends JpaRepository<Organizer, UUID> {
    Optional<Organizer> findByEmail(String email);
}
package com.example.backend.repository;

import com.example.backend.model.Venue;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface VenueRepository extends JpaRepository<Venue, UUID> {
    List<Venue> findByOrganizerEmailOrderByName(String email);
}

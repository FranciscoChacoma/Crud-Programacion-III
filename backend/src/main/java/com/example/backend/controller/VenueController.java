package com.example.backend.controller;

import com.example.backend.dto.CourtRequest;
import com.example.backend.dto.VenueRequest;
import com.example.backend.model.Venue;
import com.example.backend.service.JwtService;
import com.example.backend.service.VenueService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/venues")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class VenueController {

    private final VenueService venueService;
    private final JwtService jwtService;

    @GetMapping
    public ResponseEntity<List<Venue>> getAll(@RequestHeader("Authorization") String auth) {
        return ResponseEntity.ok(venueService.getAll(jwtService.emailFromHeader(auth)));
    }

    @PostMapping
    public ResponseEntity<Venue> create(@RequestBody VenueRequest request, @RequestHeader("Authorization") String auth) {
        return ResponseEntity.ok(venueService.create(request, jwtService.emailFromHeader(auth)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Venue> update(@PathVariable UUID id, @RequestBody VenueRequest request,
                                        @RequestHeader("Authorization") String auth) {
        return ResponseEntity.ok(venueService.update(id, request, jwtService.emailFromHeader(auth)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id, @RequestHeader("Authorization") String auth) {
        venueService.delete(id, jwtService.emailFromHeader(auth));
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/courts")
    public ResponseEntity<Venue> addCourt(@PathVariable UUID id, @RequestBody CourtRequest request,
                                          @RequestHeader("Authorization") String auth) {
        return ResponseEntity.ok(venueService.addCourt(id, request.name(), jwtService.emailFromHeader(auth)));
    }

    @DeleteMapping("/{id}/courts/{courtId}")
    public ResponseEntity<Venue> deleteCourt(@PathVariable UUID id, @PathVariable UUID courtId,
                                             @RequestHeader("Authorization") String auth) {
        return ResponseEntity.ok(venueService.deleteCourt(id, courtId, jwtService.emailFromHeader(auth)));
    }
}

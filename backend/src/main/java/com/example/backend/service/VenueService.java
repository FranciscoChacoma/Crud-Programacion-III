package com.example.backend.service;

import com.example.backend.dto.VenueRequest;
import com.example.backend.model.Court;
import com.example.backend.model.Organizer;
import com.example.backend.model.Tournament;
import com.example.backend.model.Venue;
import com.example.backend.repository.MatchRepository;
import com.example.backend.repository.OrganizerRepository;
import com.example.backend.repository.TournamentRepository;
import com.example.backend.repository.VenueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class VenueService {

    private final VenueRepository venueRepository;
    private final OrganizerRepository organizerRepository;
    private final TournamentRepository tournamentRepository;
    private final MatchRepository matchRepository;

    public List<Venue> getAll(String organizerEmail) {
        return venueRepository.findByOrganizerEmailOrderByName(organizerEmail);
    }

    public Venue create(VenueRequest req, String organizerEmail) {
        Organizer org = organizerRepository.findByEmail(organizerEmail)
            .orElseThrow(() -> new RuntimeException("Organizador no encontrado"));
        Venue v = new Venue();
        v.setOrganizer(org);
        apply(v, req);
        return venueRepository.save(v);
    }

    public Venue update(UUID id, VenueRequest req, String organizerEmail) {
        Venue v = owned(id, organizerEmail);
        apply(v, req);
        return venueRepository.save(v);
    }

    @Transactional
    public void delete(UUID id, String organizerEmail) {
        Venue v = owned(id, organizerEmail);
        if (matchRepository.existsByCourtVenueId(id)) {
            throw new RuntimeException("La sede tiene partidos asignados en algún torneo. Regenerá ese fixture antes de eliminarla.");
        }
        for (Tournament t : tournamentRepository.findByVenuesId(id)) {
            t.getVenues().remove(v);
            tournamentRepository.save(t);
        }
        venueRepository.delete(v);
    }

    @Transactional
    public Venue addCourt(UUID venueId, String name, String organizerEmail) {
        Venue v = owned(venueId, organizerEmail);
        if (name == null || name.isBlank()) {
            throw new RuntimeException("El nombre de la cancha es obligatorio.");
        }
        if (v.getCourts().stream().anyMatch(c -> c.getName().equalsIgnoreCase(name.trim()))) {
            throw new RuntimeException("La sede ya tiene una cancha llamada " + name.trim() + ".");
        }
        Court c = new Court();
        c.setName(name.trim());
        c.setVenue(v);
        v.getCourts().add(c);
        return venueRepository.save(v);
    }

    @Transactional
    public Venue deleteCourt(UUID venueId, UUID courtId, String organizerEmail) {
        Venue v = owned(venueId, organizerEmail);
        if (matchRepository.existsByCourtId(courtId)) {
            throw new RuntimeException("La cancha tiene partidos asignados. Movelos a otra cancha o regenerá el fixture primero.");
        }
        v.getCourts().removeIf(c -> c.getId().equals(courtId));
        return venueRepository.save(v);
    }

    private Venue owned(UUID id, String organizerEmail) {
        Venue v = venueRepository.findById(id).orElseThrow(() -> new RuntimeException("Sede no encontrada"));
        if (v.getOrganizer() == null || !v.getOrganizer().getEmail().equals(organizerEmail)) {
            throw new RuntimeException("La sede no es tuya.");
        }
        return v;
    }

    private void apply(Venue v, VenueRequest req) {
        if (req.name() == null || req.name().isBlank()) {
            throw new RuntimeException("El nombre de la sede es obligatorio.");
        }
        v.setName(req.name().trim());
        v.setAddress(req.address() == null || req.address().isBlank() ? null : req.address().trim());
    }
}

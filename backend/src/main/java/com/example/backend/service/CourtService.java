package com.example.backend.service;

import com.example.backend.model.Court;
import com.example.backend.model.Tournament;
import com.example.backend.repository.CourtRepository;
import com.example.backend.repository.MatchRepository;
import com.example.backend.repository.TournamentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CourtService {

    private final CourtRepository courtRepository;
    private final TournamentRepository tournamentRepository;
    private final MatchRepository matchRepository;

    public Court create(UUID tournamentId, String name) {
        if (name == null || name.isBlank()) {
            throw new RuntimeException("El nombre de la cancha es obligatorio");
        }
        Tournament tournament = tournamentRepository.findById(tournamentId)
            .orElseThrow(() -> new RuntimeException("Torneo no encontrado"));

        Court court = new Court();
        court.setName(name);
        court.setTournament(tournament);
        return courtRepository.save(court);
    }

    public List<Court> getByTournament(UUID tournamentId) {
        return courtRepository.findByTournamentId(tournamentId);
    }

    public void delete(UUID courtId) {
        if (matchRepository.existsByCourtId(courtId)) {
            throw new RuntimeException("No se puede eliminar una cancha con partidos ya asignados; regenerá el fixture primero");
        }
        courtRepository.deleteById(courtId);
    }
}

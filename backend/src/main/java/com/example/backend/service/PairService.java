package com.example.backend.service;

import com.example.backend.dto.PairRequest;
import com.example.backend.model.*;
import com.example.backend.model.enums.Category;
import com.example.backend.model.enums.Level;
import com.example.backend.model.enums.TimeSlot;
import com.example.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PairService {

    private final PairRepository pairRepository;
    private final TournamentRepository tournamentRepository;
    private final PlayerService playerService;
    private final MatchRepository matchRepository;

    public Pair create(PairRequest req) {
        Tournament tournament = tournamentRepository.findById(req.tournamentId())
            .orElseThrow(() -> new RuntimeException("Torneo no encontrado"));

        if (req.availableSchedules() == null || req.availableSchedules().size() < 2) {
            throw new RuntimeException("Seleccioná al menos 2 horarios disponibles: con uno solo (3 horas) no alcanza para jugar los 3 partidos mínimos de 1:30 c/u");
        }

        Player p1 = playerService.findOrCreate(req.player1Name(), req.player1LastName());
        Player p2 = playerService.findOrCreate(req.player2Name(), req.player2LastName());

        Pair pair = new Pair();
        pair.setPlayer1(p1);
        pair.setPlayer2(p2);
        pair.setTournament(tournament);
        pair.setCategory(Category.valueOf(req.category()));
        pair.setLevel(Level.valueOf(req.level()));
        pair.setAvailableSchedules(req.availableSchedules().stream()
            .map(TimeSlot::valueOf)
            .collect(Collectors.toSet()));
        return pairRepository.save(pair);
    }

    public List<Pair> getByTournament(java.util.UUID tournamentId) {
        return pairRepository.findByTournamentId(tournamentId);
    }

    public Pair getById(java.util.UUID id) {
        return pairRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Pareja no encontrada"));
    }

    @Transactional
    public Pair update(java.util.UUID id, PairRequest req) {
        Pair pair = getById(id);

        if (req.availableSchedules() == null || req.availableSchedules().size() < 2) {
            throw new RuntimeException("Seleccioná al menos 2 horarios disponibles: con uno solo (3 horas) no alcanza para jugar los 3 partidos mínimos de 1:30 c/u");
        }

        Player p1 = playerService.findOrCreate(req.player1Name(), req.player1LastName());
        Player p2 = playerService.findOrCreate(req.player2Name(), req.player2LastName());

        pair.setPlayer1(p1);
        pair.setPlayer2(p2);
        pair.setCategory(Category.valueOf(req.category()));
        pair.setLevel(Level.valueOf(req.level()));
        pair.setAvailableSchedules(req.availableSchedules().stream()
            .map(TimeSlot::valueOf)
            .collect(Collectors.toSet()));
        return pairRepository.save(pair);
    }

    @Transactional
    public void delete(java.util.UUID id) {
        Pair pair = getById(id);
        matchRepository.deleteByPair1IdOrPair2Id(id, id);
        pairRepository.delete(pair);
    }
}
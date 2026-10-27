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

    @Transactional
    public Pair create(PairRequest req) {
        Tournament tournament = tournamentRepository.findById(req.tournamentId())
            .orElseThrow(() -> new RuntimeException("Torneo no encontrado"));
        Pair pair = new Pair();
        pair.setTournament(tournament);
        apply(pair, req);
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
        apply(pair, req);
        return pairRepository.save(pair);
    }

    @Transactional
    public void delete(java.util.UUID id) {
        Pair pair = getById(id);
        matchRepository.deleteByPair1IdOrPair2Id(id, id);
        pairRepository.delete(pair);
    }

    /**
     * En un torneo de una categoría pueden jugar los de esa categoría y los de una
     * categoría abajo (en uno de 6ta: 6ta y 7ma; en uno de 1ra: 1ra y 2da). Nadie de una
     * categoría superior, ni de dos o más abajo.
     */
    static void checkCategory(String name, String lastName, String category, Category tournament) {
        String who = (name == null ? "" : name.trim()) + " " + (lastName == null ? "" : lastName.trim());
        if (category == null || category.isBlank()) {
            throw new RuntimeException("Indicá la categoría de " + who.trim() + ".");
        }
        Category c = Category.valueOf(category);
        int diff = c.ordinal() - tournament.ordinal();
        if (diff != 0 && diff != 1) {
            throw new RuntimeException(who.trim() + " es de " + label(c) + ": en un torneo de " + label(tournament)
                + " sólo pueden jugar jugadores de " + label(tournament)
                + (tournament.ordinal() + 1 < Category.values().length
                    ? " o de " + label(Category.values()[tournament.ordinal() + 1]) : "")
                + ".");
        }
    }

    private static String label(Category c) {
        String[] names = {"1ra", "2da", "3ra", "4ta", "5ta", "6ta", "7ma", "8va"};
        return names[c.ordinal()];
    }

    private void apply(Pair pair, PairRequest req) {
        if (req.availableSchedules() == null || req.availableSchedules().size() < 2) {
            throw new RuntimeException("Elegí al menos 2 franjas horarias: los 3 partidos de grupo (1:30 c/u) no entran en una sola franja de 3 horas.");
        }
        Category tournamentCategory = pair.getTournament().getCategory();
        checkCategory(req.player1Name(), req.player1LastName(), req.player1Category(), tournamentCategory);
        checkCategory(req.player2Name(), req.player2LastName(), req.player2Category(), tournamentCategory);
        Player p1 = playerService.findOrCreate(req.player1Name(), req.player1LastName(), req.player1Email(), req.player1Category());
        Player p2 = playerService.findOrCreate(req.player2Name(), req.player2LastName(), req.player2Email(), req.player2Category());
        if (p1.getId().equals(p2.getId())) {
            throw new RuntimeException("Los dos jugadores de la pareja no pueden ser la misma persona.");
        }
        for (Pair other : pairRepository.findByTournamentId(pair.getTournament().getId())) {
            if (other.getId().equals(pair.getId())) continue;
            for (Player p : List.of(p1, p2)) {
                if (other.getPlayer1().getId().equals(p.getId()) || other.getPlayer2().getId().equals(p.getId())) {
                    throw new RuntimeException(p.getName() + " " + p.getLastName() + " ya está inscripto en otra pareja de este torneo.");
                }
            }
        }

        pair.setPlayer1(p1);
        pair.setPlayer2(p2);
        pair.setCategory(tournamentCategory);
        pair.setLevel(Level.valueOf(req.level()));
        pair.setAvailableSchedules(req.availableSchedules().stream()
            .map(TimeSlot::valueOf)
            .collect(Collectors.toSet()));
    }
}

package com.example.backend.service;

import com.example.backend.dto.FixtureView.SetScore;
import com.example.backend.model.Match;
import com.example.backend.model.enums.MatchStage;
import com.example.backend.repository.MatchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/** Carga de resultados por sets (al mejor de 3; el tercero puede ser super tie-break). */
@Service
@RequiredArgsConstructor
public class ResultService {

    private final FixtureService fixtureService;
    private final BracketService bracketService;
    private final MatchRepository matchRepository;

    @Transactional
    public void save(UUID tournamentId, UUID matchId, List<SetScore> sets) {
        Match m = fixtureService.getMatch(tournamentId, matchId);
        if (m.getPair1() == null || m.getPair2() == null) {
            throw new RuntimeException("Todavía no se conocen las dos parejas de este partido.");
        }
        checkGroupsEditable(m);
        validate(sets);

        clearScore(m);
        m.setSet1Pair1(sets.get(0).pair1());
        m.setSet1Pair2(sets.get(0).pair2());
        m.setSet2Pair1(sets.get(1).pair1());
        m.setSet2Pair2(sets.get(1).pair2());
        if (sets.size() == 3) {
            m.setSet3Pair1(sets.get(2).pair1());
            m.setSet3Pair2(sets.get(2).pair2());
        }
        long firstWins = sets.stream().filter(s -> s.pair1() > s.pair2()).count();
        m.setWinner(firstWins >= 2 ? m.getPair1() : m.getPair2());
        matchRepository.save(m);
        if (m.getStage() == MatchStage.BRACKET) bracketService.advance(m);
    }

    @Transactional
    public void clear(UUID tournamentId, UUID matchId) {
        Match m = fixtureService.getMatch(tournamentId, matchId);
        checkGroupsEditable(m);
        clearScore(m);
        matchRepository.save(m);
        if (m.getStage() == MatchStage.BRACKET) bracketService.advance(m);
    }

    static void clearScore(Match m) {
        m.setSet1Pair1(null); m.setSet1Pair2(null);
        m.setSet2Pair1(null); m.setSet2Pair2(null);
        m.setSet3Pair1(null); m.setSet3Pair2(null);
        m.setWinner(null);
    }

    private void checkGroupsEditable(Match m) {
        if (m.getStage() == MatchStage.GROUP
            && !matchRepository.findByTournamentIdAndStage(m.getTournament().getId(), MatchStage.BRACKET).isEmpty()) {
            throw new RuntimeException("Las llaves ya se armaron con estos resultados. "
                + "Para corregir la fase de grupos, eliminá primero las llaves.");
        }
    }

    static void validate(List<SetScore> sets) {
        if (sets == null || sets.size() < 2 || sets.size() > 3) {
            throw new RuntimeException("Cargá 2 o 3 sets.");
        }
        for (int i = 0; i < sets.size(); i++) {
            SetScore s = sets.get(i);
            if (s == null || s.pair1() < 0 || s.pair2() < 0 || s.pair1() > 99 || s.pair2() > 99) {
                throw new RuntimeException("El set " + (i + 1) + " tiene un resultado inválido.");
            }
            if (s.pair1() == s.pair2()) {
                throw new RuntimeException("El set " + (i + 1) + " no puede terminar empatado.");
            }
        }
        boolean firstTwoSame = (sets.get(0).pair1() > sets.get(0).pair2()) == (sets.get(1).pair1() > sets.get(1).pair2());
        if (firstTwoSame && sets.size() == 3) {
            throw new RuntimeException("Una pareja ganó los dos primeros sets: no se juega el tercero.");
        }
        if (!firstTwoSame && sets.size() == 2) {
            throw new RuntimeException("Quedaron 1 a 1 en sets: falta el tercer set (o super tie-break).");
        }
    }
}

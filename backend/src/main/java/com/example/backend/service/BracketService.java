package com.example.backend.service;

import com.example.backend.dto.BracketView;
import com.example.backend.dto.BracketView.Qualifier;
import com.example.backend.dto.BracketView.Round;
import com.example.backend.dto.FixtureView;
import com.example.backend.dto.FixtureView.GroupView;
import com.example.backend.dto.FixtureView.MatchView;
import com.example.backend.dto.FixtureView.StandingRow;
import com.example.backend.model.Court;
import com.example.backend.model.Match;
import com.example.backend.model.Pair;
import com.example.backend.model.Tournament;
import com.example.backend.model.enums.MatchStage;
import com.example.backend.repository.MatchRepository;
import com.example.backend.repository.PairRepository;
import com.example.backend.service.scheduling.FixtureScheduler;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

/**
 * Fase final por eliminación directa con los 2 primeros de cada grupo.
 * Los cruces enfrentan al 1° de un grupo con el 2° del grupo vecino (1°A vs 2°B,
 * 1°B vs 2°A, 1°C vs 2°D...) y dos parejas del mismo grupo sólo pueden volver a
 * cruzarse en la final. Si la cantidad de clasificados no es potencia de 2, los
 * mejores primeros pasan directo a la ronda siguiente.
 */
@Service
@RequiredArgsConstructor
public class BracketService {

    private final FixtureService fixtureService;
    private final TournamentService tournamentService;
    private final MatchRepository matchRepository;
    private final PairRepository pairRepository;

    public BracketView getBracket(UUID tournamentId) {
        Tournament tournament = tournamentService.getEntity(tournamentId);
        FixtureView fixture = fixtureService.getFixture(tournamentId);
        List<Qualifier> qualifiers = qualifiers(fixture);
        Map<UUID, String> seeds = new HashMap<>();
        qualifiers.forEach(q -> seeds.put(q.pair().id(), q.seed()));

        List<Match> matches = matchRepository.findByTournamentIdAndStage(tournamentId, MatchStage.BRACKET);
        Map<Integer, List<MatchView>> byRound = new LinkedHashMap<>();
        matches.stream()
            .sorted(Comparator.comparing((Match m) -> -m.getBracketRound()).thenComparing(Match::getBracketPosition))
            .forEach(m -> byRound.computeIfAbsent(m.getBracketRound(), k -> new ArrayList<>())
                .add(fixtureService.toMatchView(m, List.of(), seeds)));

        List<Round> rounds = byRound.entrySet().stream()
            .map(e -> new Round(e.getKey(), roundName(e.getKey()), e.getValue())).toList();
        FixtureView.PairView champion = matches.stream()
            .filter(m -> m.getBracketRound() == 1 && m.getWinner() != null)
            .map(m -> fixtureService.toPairView(m.getWinner())).findFirst().orElse(null);

        return new BracketView(
            FixtureService.dateLabel(tournament.getStartDate() == null ? null : tournament.getStartDate().plusDays(1)),
            fixture.complete(),
            fixture.totalMatches() - fixture.playedMatches(),
            qualifiers,
            rounds,
            champion
        );
    }

    @Transactional
    public BracketView generate(UUID tournamentId) {
        Tournament tournament = tournamentService.getEntity(tournamentId);
        FixtureView fixture = fixtureService.getFixture(tournamentId);
        if (fixture.groups().isEmpty()) {
            throw new RuntimeException("Primero generá y jugá la fase de grupos.");
        }
        if (!fixture.complete()) {
            throw new RuntimeException("Faltan " + (fixture.totalMatches() - fixture.playedMatches())
                + " resultado(s) de la fase de grupos para conocer a los clasificados.");
        }

        List<StandingRow> firsts = new ArrayList<>();
        List<StandingRow> seconds = new ArrayList<>();
        List<Integer> firstGroup = new ArrayList<>();
        List<Integer> secondGroup = new ArrayList<>();
        for (int g = 0; g < fixture.groups().size(); g++) {
            List<StandingRow> st = fixture.groups().get(g).standings();
            if (!st.isEmpty()) { firsts.add(st.get(0)); firstGroup.add(g); }
            if (st.size() > 1) { seconds.add(st.get(1)); secondGroup.add(g); }
        }
        int qualified = firsts.size() + seconds.size();
        if (qualified < 2) {
            throw new RuntimeException("Hacen falta al menos 2 clasificados para armar las llaves.");
        }

        int size = Integer.highestOneBit(qualified);
        if (size < qualified) size *= 2;

        // seed[s] = pareja con siembra s (1..size); null = pase directo (bye).
        UUID[] seed = new UUID[size + 1];
        for (int i = 0; i < firsts.size(); i++) seed[i + 1] = firsts.get(i).pair().id();

        List<Integer> freeSeconds = new ArrayList<>();
        for (int i = 0; i < seconds.size(); i++) freeSeconds.add(i);
        int g1 = firsts.size();
        for (int s = 1; s <= g1; s++) {
            int opponent = size + 1 - s;
            if (opponent <= g1 || opponent > qualified) continue;
            int ownGroup = firstGroup.get(s - 1);
            int neighbour = ownGroup ^ 1;
            Integer pick = freeSeconds.stream().filter(i -> secondGroup.get(i) == neighbour).findFirst()
                .orElse(freeSeconds.stream().filter(i -> secondGroup.get(i) != ownGroup).findFirst()
                    .orElse(freeSeconds.get(0)));
            seed[opponent] = seconds.get(pick).pair().id();
            freeSeconds.remove(pick);
        }
        for (int s = g1 + 1; s <= qualified; s++) {
            if (seed[s] == null) seed[s] = seconds.get(freeSeconds.remove(0)).pair().id();
        }

        matchRepository.deleteByTournamentIdAndStage(tournamentId, MatchStage.BRACKET);
        matchRepository.flush();

        Map<UUID, Pair> pairs = new HashMap<>();
        pairRepository.findByTournamentId(tournamentId).forEach(p -> pairs.put(p.getId(), p));

        Map<String, Match> slots = new HashMap<>();
        for (int round = size / 2; round >= 1; round /= 2) {
            for (int pos = 0; pos < round; pos++) {
                Match m = new Match();
                m.setTournament(tournament);
                m.setStage(MatchStage.BRACKET);
                m.setBracketRound(round);
                m.setBracketPosition(pos);
                slots.put(round + ":" + pos, m);
            }
        }

        int[] order = bracketOrder(size);
        int firstRound = size / 2;
        for (int k = 0; k < firstRound; k++) {
            UUID a = seed[order[2 * k]];
            UUID b = seed[order[2 * k + 1]];
            if (a != null && b != null) {
                Match m = slots.get(firstRound + ":" + k);
                m.setPair1(pairs.get(a));
                m.setPair2(pairs.get(b));
            } else {
                // Pase directo: el partido no se juega y la pareja espera en la ronda siguiente.
                slots.remove(firstRound + ":" + k);
                Match next = slots.get(firstRound / 2 + ":" + k / 2);
                Pair advancing = pairs.get(a != null ? a : b);
                if (k % 2 == 0) next.setPair1(advancing); else next.setPair2(advancing);
            }
        }

        schedule(new ArrayList<>(slots.values()), tournamentService.courtsOf(tournament));
        matchRepository.saveAll(slots.values());
        return getBracket(tournamentId);
    }

    @Transactional
    public void clear(UUID tournamentId) {
        matchRepository.deleteByTournamentIdAndStage(tournamentId, MatchStage.BRACKET);
    }

    /**
     * Pone al ganador de un partido de llaves en el cruce siguiente. Si ahí ya
     * había otra pareja con resultado cargado, ese resultado deja de valer y se
     * limpia en cadena hacia la final.
     */
    void advance(Match m) {
        if (m.getBracketRound() == null || m.getBracketRound() <= 1) return;
        Match next = matchRepository.findByTournamentIdAndStage(m.getTournament().getId(), MatchStage.BRACKET).stream()
            .filter(o -> o.getBracketRound() == m.getBracketRound() / 2 && o.getBracketPosition() == m.getBracketPosition() / 2)
            .findFirst().orElse(null);
        if (next == null) return;

        boolean first = m.getBracketPosition() % 2 == 0;
        Pair current = first ? next.getPair1() : next.getPair2();
        Pair winner = m.getWinner();
        if (Objects.equals(current == null ? null : current.getId(), winner == null ? null : winner.getId())) return;

        if (first) next.setPair1(winner); else next.setPair2(winner);
        if (next.getWinner() != null) {
            ResultService.clearScore(next);
            matchRepository.save(next);
            advance(next);
        } else {
            matchRepository.save(next);
        }
    }

    static List<Qualifier> qualifiers(FixtureView fixture) {
        List<Qualifier> list = new ArrayList<>();
        for (GroupView g : fixture.groups()) {
            for (int i = 0; i < Math.min(2, g.standings().size()); i++) {
                list.add(new Qualifier((i + 1) + "° " + g.name(), g.standings().get(i).pair()));
            }
        }
        return list;
    }

    static String roundName(int size) {
        return switch (size) {
            case 1 -> "Final";
            case 2 -> "Semifinal";
            case 4 -> "Cuartos de final";
            case 8 -> "Octavos de final";
            default -> "Ronda de " + (size * 2);
        };
    }

    /** Orden clásico de siembra: para 8 → 1,8,4,5,2,7,3,6 (el 1 y el 2 sólo se cruzan en la final). */
    static int[] bracketOrder(int size) {
        int[] order = {1};
        while (order.length < size) {
            int n = order.length * 2;
            int[] next = new int[n];
            for (int i = 0; i < order.length; i++) {
                next[2 * i] = order[i];
                next[2 * i + 1] = n + 1 - order[i];
            }
            order = next;
        }
        return order;
    }

    /** Día de llaves: cada ronda arranca cuando termina la anterior, repartiendo las canchas. */
    private void schedule(List<Match> matches, List<Court> courts) {
        if (courts.isEmpty()) return;
        int startTurn = 0;
        List<Integer> rounds = matches.stream().map(Match::getBracketRound).distinct()
            .sorted(Comparator.reverseOrder()).toList();
        for (int round : rounds) {
            List<Match> inRound = matches.stream().filter(m -> m.getBracketRound() == round)
                .sorted(Comparator.comparing(Match::getBracketPosition)).toList();
            for (int i = 0; i < inRound.size(); i++) {
                int turn = startTurn + i / courts.size();
                if (turn >= FixtureScheduler.TURNS_PER_DAY) continue;
                inRound.get(i).setTurn(turn);
                inRound.get(i).setCourt(courts.get(i % courts.size()));
            }
            startTurn += (inRound.size() + courts.size() - 1) / courts.size();
        }
    }
}

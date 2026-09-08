package com.example.backend.service;

import com.example.backend.dto.FixtureResult;
import com.example.backend.model.Court;
import com.example.backend.model.Group;
import com.example.backend.model.Match;
import com.example.backend.model.Pair;
import com.example.backend.model.Tournament;
import com.example.backend.model.enums.Category;
import com.example.backend.model.enums.TimeSlot;
import com.example.backend.repository.CourtRepository;
import com.example.backend.repository.GroupRepository;
import com.example.backend.repository.MatchRepository;
import com.example.backend.repository.PairRepository;
import com.example.backend.repository.TournamentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.IdentityHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Genera el fixture de un torneo: arma grupos por categoría (sin restringir por
 * nivel, para maximizar cuántas parejas terminan con horario) y asigna
 * cancha+horario a cada partido con una heurística greedy "most constrained
 * first" que respeta la disponibilidad declarada por cada pareja. Lo que no
 * logra asignarse queda reportado explícitamente, no oculto.
 */
@Service
@RequiredArgsConstructor
public class FixtureService {

    private static final int TARGET_GROUP_SIZE = 4;

    private final TournamentRepository tournamentRepository;
    private final PairRepository pairRepository;
    private final CourtRepository courtRepository;
    private final GroupRepository groupRepository;
    private final MatchRepository matchRepository;

    @Transactional
    public FixtureResult generate(UUID tournamentId) {
        Tournament tournament = tournamentRepository.findById(tournamentId)
            .orElseThrow(() -> new RuntimeException("Torneo no encontrado"));

        List<Court> courts = courtRepository.findByTournamentId(tournamentId);
        if (courts.isEmpty()) {
            throw new RuntimeException("Cargá al menos una cancha antes de generar el fixture.");
        }

        clearPreviousFixture(tournamentId);

        List<Pair> pairs = pairRepository.findByTournamentId(tournamentId);
        Map<Category, List<Pair>> byCategory = new TreeMap<>();
        for (Pair p : pairs) {
            byCategory.computeIfAbsent(p.getCategory(), c -> new ArrayList<>()).add(p);
        }

        List<Match> matches = new ArrayList<>();

        for (Map.Entry<Category, List<Pair>> entry : byCategory.entrySet()) {
            List<Pair> catPairs = entry.getValue();
            if (catPairs.size() < 2) {
                continue;
            }

            // Orden neutral (no por nivel): el objetivo es maximizar cuántas parejas
            // terminan con horario asignado, así que los grupos no separan por nivel
            // y las parejas pueden cruzarse con cualquier otra de su categoría.
            catPairs.sort(
                Comparator.comparing((Pair p) -> p.getPlayer1().getLastName(), String.CASE_INSENSITIVE_ORDER)
                    .thenComparing((Pair p) -> p.getPlayer1().getName(), String.CASE_INSENSITIVE_ORDER)
                    .thenComparing(p -> p.getId().toString())
            );

            List<List<Pair>> chunks = chunkIntoGroups(catPairs);
            for (int i = 0; i < chunks.size(); i++) {
                Group group = new Group();
                group.setName(String.valueOf((char) ('A' + i)));
                group.setCategory(entry.getKey());
                group.setTournament(tournament);
                group = groupRepository.save(group);

                List<Pair> chunk = chunks.get(i);
                for (Pair p : chunk) {
                    p.setGroup(group);
                }
                pairRepository.saveAll(chunk);

                for (int a = 0; a < chunk.size(); a++) {
                    for (int b = a + 1; b < chunk.size(); b++) {
                        Match m = new Match();
                        m.setGroup(group);
                        m.setPair1(chunk.get(a));
                        m.setPair2(chunk.get(b));
                        matches.add(m);
                    }
                }
            }
        }

        assignSchedule(matches, courts);
        matchRepository.saveAll(matches);

        return getFixture(tournamentId);
    }

    public FixtureResult getFixture(UUID tournamentId) {
        tournamentRepository.findById(tournamentId)
            .orElseThrow(() -> new RuntimeException("Torneo no encontrado"));

        List<Pair> allPairs = pairRepository.findByTournamentId(tournamentId);
        List<String> warnings = computeWarnings(allPairs);

        List<Group> groups = groupRepository.findByTournamentId(tournamentId);
        List<FixtureResult.GroupResult> groupResults = new ArrayList<>();
        List<FixtureResult.UnassignedMatch> unassigned = new ArrayList<>();

        for (Group group : groups) {
            List<Pair> groupPairs = pairRepository.findByGroupId(group.getId());
            List<Match> groupMatches = matchRepository.findByGroupId(group.getId());
            List<FixtureResult.MatchResult> matchResults = new ArrayList<>();

            for (Match m : groupMatches) {
                if (m.getCourt() == null || m.getTimeSlot() == null) {
                    unassigned.add(new FixtureResult.UnassignedMatch(
                        toPairSummary(m.getPair1()), toPairSummary(m.getPair2()), group.getName(), reasonFor(m)));
                } else {
                    matchResults.add(new FixtureResult.MatchResult(
                        m.getId(), toPairSummary(m.getPair1()), toPairSummary(m.getPair2()),
                        m.getCourt().getName(), m.getTimeSlot()));
                }
            }

            groupResults.add(new FixtureResult.GroupResult(
                group.getName(), group.getCategory(),
                groupPairs.stream().map(this::toPairSummary).toList(),
                matchResults));
        }

        return new FixtureResult(groupResults, unassigned, warnings);
    }

    private List<String> computeWarnings(List<Pair> pairs) {
        Map<Category, List<Pair>> byCategory = new TreeMap<>();
        for (Pair p : pairs) {
            byCategory.computeIfAbsent(p.getCategory(), c -> new ArrayList<>()).add(p);
        }
        List<String> warnings = new ArrayList<>();
        for (Map.Entry<Category, List<Pair>> entry : byCategory.entrySet()) {
            if (entry.getValue().size() < 2) {
                warnings.add("Categoría " + entry.getKey() + ": sólo " + entry.getValue().size()
                    + " pareja(s) inscripta(s), no se pueden generar partidos.");
            }
        }
        return warnings;
    }

    private void clearPreviousFixture(UUID tournamentId) {
        matchRepository.deleteByGroupTournamentId(tournamentId);
        List<Pair> pairs = pairRepository.findByTournamentId(tournamentId);
        for (Pair p : pairs) {
            p.setGroup(null);
        }
        pairRepository.saveAll(pairs);
        groupRepository.deleteByTournamentId(tournamentId);
    }

    private List<List<Pair>> chunkIntoGroups(List<Pair> pairs) {
        int n = pairs.size();
        int numGroups = Math.max(1, (int) Math.round(n / (double) TARGET_GROUP_SIZE));
        int base = n / numGroups;
        int remainder = n % numGroups;

        List<List<Pair>> chunks = new ArrayList<>();
        int idx = 0;
        for (int i = 0; i < numGroups; i++) {
            int size = base + (i < remainder ? 1 : 0);
            chunks.add(new ArrayList<>(pairs.subList(idx, idx + size)));
            idx += size;
        }
        return chunks;
    }

    /** Cancha+horario candidatos para un partido en un instante dado del algoritmo. */
    private record CourtSlot(Court court, TimeSlot slot) {}

    private void assignSchedule(List<Match> matches, List<Court> courts) {
        List<TimeSlot> slots = List.of(TimeSlot.values());
        Set<String> occupied = new HashSet<>();
        Map<UUID, Set<TimeSlot>> pairBusy = new HashMap<>();

        IdentityHashMap<Match, Integer> seq = new IdentityHashMap<>();
        for (int i = 0; i < matches.size(); i++) {
            seq.put(matches.get(i), i);
        }

        List<Match> pending = new ArrayList<>(matches);

        while (!pending.isEmpty()) {
            Map<Match, List<CourtSlot>> feasibleByMatch = new IdentityHashMap<>();
            List<Match> stillPending = new ArrayList<>();

            for (Match m : pending) {
                List<CourtSlot> options = feasibleOptions(m, courts, slots, occupied, pairBusy);
                if (!options.isEmpty()) {
                    feasibleByMatch.put(m, options);
                    stillPending.add(m);
                }
                // Los partidos sin ninguna opción quedan afuera de forma permanente:
                // getFixture() los reporta como "sin asignar" leyendo court/timeSlot nulos.
            }

            if (stillPending.isEmpty()) {
                break;
            }

            Match best = stillPending.stream().min(
                Comparator.<Match>comparingInt(m -> feasibleByMatch.get(m).size())
                    .thenComparingInt(m -> m.getPair1().getAvailableSchedules().size()
                        + m.getPair2().getAvailableSchedules().size())
                    .thenComparing(m -> m.getGroup().getName())
                    .thenComparing(seq::get)
            ).orElseThrow();

            CourtSlot choice = feasibleByMatch.get(best).stream().min(
                Comparator.comparingInt((CourtSlot cs) -> cs.slot().ordinal())
                    .thenComparing(cs -> cs.court().getName())
                    .thenComparing(cs -> cs.court().getId().toString())
            ).orElseThrow();

            best.setCourt(choice.court());
            best.setTimeSlot(choice.slot());
            occupied.add(choice.court().getId() + "|" + choice.slot());
            pairBusy.computeIfAbsent(best.getPair1().getId(), k -> new HashSet<>()).add(choice.slot());
            pairBusy.computeIfAbsent(best.getPair2().getId(), k -> new HashSet<>()).add(choice.slot());

            pending = stillPending.stream().filter(m -> m != best).collect(Collectors.toList());
        }
    }

    private List<CourtSlot> feasibleOptions(Match m, List<Court> courts, List<TimeSlot> slots,
                                             Set<String> occupied, Map<UUID, Set<TimeSlot>> pairBusy) {
        Set<TimeSlot> common = new HashSet<>(m.getPair1().getAvailableSchedules());
        common.retainAll(m.getPair2().getAvailableSchedules());
        if (common.isEmpty()) {
            return List.of();
        }

        Set<TimeSlot> busy1 = pairBusy.getOrDefault(m.getPair1().getId(), Set.of());
        Set<TimeSlot> busy2 = pairBusy.getOrDefault(m.getPair2().getId(), Set.of());

        List<CourtSlot> options = new ArrayList<>();
        for (TimeSlot slot : slots) {
            if (!common.contains(slot) || busy1.contains(slot) || busy2.contains(slot)) {
                continue;
            }
            for (Court court : courts) {
                if (!occupied.contains(court.getId() + "|" + slot)) {
                    options.add(new CourtSlot(court, slot));
                }
            }
        }
        return options;
    }

    private String reasonFor(Match m) {
        Set<TimeSlot> common = new HashSet<>(m.getPair1().getAvailableSchedules());
        common.retainAll(m.getPair2().getAvailableSchedules());
        if (common.isEmpty()) {
            return "Las parejas no comparten ninguna franja horaria.";
        }
        return "Sin cancha/horario libre compatible: la capacidad de canchas no alcanza para esa franja horaria.";
    }

    private FixtureResult.PairSummary toPairSummary(Pair p) {
        return new FixtureResult.PairSummary(
            p.getId(),
            p.getPlayer1().getLastName() + ", " + p.getPlayer1().getName(),
            p.getPlayer2().getLastName() + ", " + p.getPlayer2().getName(),
            p.getCategory().name(),
            p.getLevel().name()
        );
    }
}

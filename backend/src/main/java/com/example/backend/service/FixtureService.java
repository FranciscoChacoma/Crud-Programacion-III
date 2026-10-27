package com.example.backend.service;

import com.example.backend.dto.FixtureView;
import com.example.backend.dto.FixtureView.CourtColumn;
import com.example.backend.dto.FixtureView.GroupView;
import com.example.backend.dto.FixtureView.MatchView;
import com.example.backend.dto.FixtureView.PairView;
import com.example.backend.dto.FixtureView.SetScore;
import com.example.backend.dto.FixtureView.StandingRow;
import com.example.backend.model.Court;
import com.example.backend.model.Group;
import com.example.backend.model.Match;
import com.example.backend.model.Pair;
import com.example.backend.model.Tournament;
import com.example.backend.model.enums.MatchStage;
import com.example.backend.model.enums.TimeSlot;
import com.example.backend.repository.GroupRepository;
import com.example.backend.repository.MatchRepository;
import com.example.backend.repository.PairRepository;
import com.example.backend.service.scheduling.FixtureScheduler;
import com.example.backend.service.scheduling.FixtureScheduler.Plan;
import com.example.backend.service.scheduling.FixtureScheduler.PlannedMatch;
import com.example.backend.service.scheduling.FixtureScheduler.Team;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
public class FixtureService {

    private static final DateTimeFormatter DATE_FORMAT =
        DateTimeFormatter.ofPattern("EEEE d 'de' MMMM", Locale.forLanguageTag("es-AR"));

    private final TournamentService tournamentService;
    private final PairRepository pairRepository;
    private final GroupRepository groupRepository;
    private final MatchRepository matchRepository;

    @Transactional
    public FixtureView generate(UUID tournamentId) {
        Tournament tournament = tournamentService.getEntity(tournamentId);
        List<Court> courts = tournamentService.courtsOf(tournament);
        if (courts.isEmpty()) {
            throw new RuntimeException("Elegí al menos una sede con canchas para el torneo antes de generar el fixture.");
        }
        List<Pair> pairs = pairRepository.findByTournamentId(tournamentId);
        if (pairs.size() < 2) {
            throw new RuntimeException("Inscribí al menos 2 parejas para generar el fixture.");
        }

        matchRepository.deleteByTournamentId(tournamentId);
        pairs.forEach(p -> p.setGroup(null));
        groupRepository.deleteByTournamentId(tournamentId);

        Map<UUID, Pair> pairById = new HashMap<>();
        List<Team> teams = new ArrayList<>();
        for (Pair p : pairs) {
            pairById.put(p.getId(), p);
            teams.add(new Team(p.getId(), p.getCategory().name(), p.getLevel().name(), turnMask(p)));
        }

        Plan plan = FixtureScheduler.plan(teams, courts.size());

        List<Group> groups = new ArrayList<>();
        for (int i = 0; i < plan.groups().size(); i++) {
            Group group = new Group();
            group.setName(groupName(i));
            group.setCategory(pairById.get(plan.groups().get(i).get(0).id()).getCategory());
            group.setTournament(tournament);
            group = groupRepository.save(group);
            groups.add(group);
            for (Team t : plan.groups().get(i)) {
                pairById.get(t.id()).setGroup(group);
            }
        }
        pairRepository.saveAll(pairs);

        List<Match> matches = new ArrayList<>();
        for (PlannedMatch pm : plan.matches()) {
            Match m = new Match();
            m.setTournament(tournament);
            m.setStage(MatchStage.GROUP);
            m.setGroup(groups.get(pm.group()));
            m.setPair1(pairById.get(pm.pair1().id()));
            m.setPair2(pairById.get(pm.pair2().id()));
            m.setTurn(pm.turn());
            m.setCourt(pm.court() == null ? null : courts.get(pm.court()));
            matches.add(m);
        }
        matchRepository.saveAll(matches);

        return getFixture(tournamentId);
    }

    public FixtureView getFixture(UUID tournamentId) {
        Tournament tournament = tournamentService.getEntity(tournamentId);
        List<Court> courts = tournamentService.courtsOf(tournament);
        List<Pair> pairs = pairRepository.findByTournamentId(tournamentId);
        List<Match> matches = matchRepository.findByTournamentIdAndStage(tournamentId, MatchStage.GROUP);
        List<Group> groups = groupRepository.findByTournamentId(tournamentId).stream()
            .sorted(Comparator.comparing(Group::getName)).toList();

        Map<UUID, List<String>> issues = scheduleIssues(matches);
        List<GroupView> groupViews = new ArrayList<>();
        List<MatchView> unscheduled = new ArrayList<>();
        int played = 0;

        for (Group group : groups) {
            List<Pair> groupPairs = pairs.stream()
                .filter(p -> p.getGroup() != null && p.getGroup().getId().equals(group.getId()))
                .sorted(Comparator.comparing(this::pairLabel)).toList();
            List<Match> groupMatches = matches.stream()
                .filter(m -> m.getGroup() != null && m.getGroup().getId().equals(group.getId()))
                .sorted(matchOrder()).toList();

            List<MatchView> views = groupMatches.stream()
                .map(m -> toMatchView(m, issues.getOrDefault(m.getId(), List.of()), Map.of())).toList();
            views.stream().filter(v -> v.turn() == null).forEach(unscheduled::add);
            long groupPlayed = groupMatches.stream().filter(m -> m.getWinner() != null).count();
            played += (int) groupPlayed;
            boolean complete = !groupMatches.isEmpty() && groupPlayed == groupMatches.size();

            groupViews.add(new GroupView(group.getId(), group.getName(), group.getCategory().name(),
                groupPairs.stream().map(this::toPairView).toList(),
                standings(groupPairs, groupMatches, complete), views, complete));
        }

        List<String> warnings = new ArrayList<>();
        long withoutGroup = pairs.stream().filter(p -> p.getGroup() == null).count();
        if (!groups.isEmpty() && withoutGroup > 0) {
            warnings.add(withoutGroup + " pareja(s) se inscribieron después de generar el fixture y no tienen grupo. "
                + "Regenerá el fixture para incluirlas.");
        }
        long courtless = matches.stream().filter(m -> m.getCourt() != null && !courts.contains(m.getCourt())).count();
        if (courtless > 0) {
            warnings.add(courtless + " partido(s) están en canchas de una sede que ya no está en el torneo.");
        }

        return new FixtureView(
            dateLabel(tournament.getStartDate()),
            turnLabels(),
            courts.stream().map(c -> new CourtColumn(c.getId(), c.getName(), c.getVenue().getName())).toList(),
            groupViews,
            unscheduled,
            warnings,
            matches.size(),
            played,
            !matches.isEmpty() && played == matches.size()
        );
    }

    /** Mueve un partido a otra cancha/turno; si el lugar está ocupado, los partidos se intercambian. */
    @Transactional
    public void move(UUID tournamentId, UUID matchId, UUID courtId, Integer turn) {
        Match match = getMatch(tournamentId, matchId);
        if (courtId == null || turn == null) {
            match.setCourt(null);
            match.setTurn(null);
            matchRepository.save(match);
            return;
        }
        if (turn < 0 || turn >= FixtureScheduler.TURNS_PER_DAY) {
            throw new RuntimeException("Turno inválido.");
        }
        Court court = tournamentService.courtsOf(match.getTournament()).stream()
            .filter(c -> c.getId().equals(courtId)).findFirst()
            .orElseThrow(() -> new RuntimeException("La cancha no pertenece a las sedes del torneo."));

        matchRepository.findByTournamentIdAndStage(tournamentId, match.getStage()).stream()
            .filter(o -> !o.getId().equals(matchId) && Objects.equals(o.getTurn(), turn) && court.equals(o.getCourt()))
            .findFirst()
            .ifPresent(other -> {
                other.setCourt(match.getCourt());
                other.setTurn(match.getTurn());
                matchRepository.save(other);
            });
        match.setCourt(court);
        match.setTurn(turn);
        matchRepository.save(match);
    }

    Match getMatch(UUID tournamentId, UUID matchId) {
        Match match = matchRepository.findById(matchId)
            .orElseThrow(() -> new RuntimeException("Partido no encontrado"));
        if (!match.getTournament().getId().equals(tournamentId)) {
            throw new RuntimeException("El partido no pertenece a este torneo.");
        }
        return match;
    }

    // ------------------------------------------------------------ posiciones

    /**
     * Ordena por partidos ganados. Entre dos empatadas decide el partido entre
     * ellas; entre tres o más, la diferencia de sets y después la de games.
     */
    List<StandingRow> standings(List<Pair> pairs, List<Match> matches, boolean complete) {
        Map<UUID, int[]> stats = new HashMap<>(); // played, won, lost, setsW, setsL, gamesW, gamesL
        for (Pair p : pairs) stats.put(p.getId(), new int[7]);
        Map<String, UUID> headToHead = new HashMap<>();

        for (Match m : matches) {
            if (m.getWinner() == null) continue;
            int[] s1 = stats.get(m.getPair1().getId());
            int[] s2 = stats.get(m.getPair2().getId());
            if (s1 == null || s2 == null) continue;
            s1[0]++; s2[0]++;
            boolean firstWon = m.getWinner().getId().equals(m.getPair1().getId());
            s1[firstWon ? 1 : 2]++;
            s2[firstWon ? 2 : 1]++;
            for (SetScore set : sets(m)) {
                s1[5] += set.pair1(); s1[6] += set.pair2();
                s2[5] += set.pair2(); s2[6] += set.pair1();
                if (set.pair1() > set.pair2()) { s1[3]++; s2[4]++; } else { s2[3]++; s1[4]++; }
            }
            headToHead.put(key(m.getPair1().getId(), m.getPair2().getId()), m.getWinner().getId());
        }

        List<Pair> sorted = new ArrayList<>(pairs);
        sorted.sort(Comparator.comparingInt((Pair p) -> -stats.get(p.getId())[1]).thenComparing(this::pairLabel));

        // Desempates dentro de cada bloque con la misma cantidad de victorias.
        List<Pair> ranked = new ArrayList<>();
        int i = 0;
        while (i < sorted.size()) {
            int wins = stats.get(sorted.get(i).getId())[1];
            int j = i;
            while (j < sorted.size() && stats.get(sorted.get(j).getId())[1] == wins) j++;
            List<Pair> block = new ArrayList<>(sorted.subList(i, j));
            if (block.size() == 2) {
                UUID winner = headToHead.get(key(block.get(0).getId(), block.get(1).getId()));
                if (winner != null && winner.equals(block.get(1).getId())) java.util.Collections.reverse(block);
            } else if (block.size() > 2) {
                block.sort(Comparator.comparingInt((Pair p) -> -(stats.get(p.getId())[3] - stats.get(p.getId())[4]))
                    .thenComparingInt(p -> -(stats.get(p.getId())[5] - stats.get(p.getId())[6]))
                    .thenComparingInt(p -> -stats.get(p.getId())[5])
                    .thenComparing(this::pairLabel));
            }
            ranked.addAll(block);
            i = j;
        }

        return IntStream.range(0, ranked.size()).mapToObj(pos -> {
            Pair p = ranked.get(pos);
            int[] s = stats.get(p.getId());
            return new StandingRow(toPairView(p), pos + 1, s[0], s[1], s[2], s[3], s[4], s[5], s[6],
                complete && pos < 2);
        }).toList();
    }

    private static String key(UUID a, UUID b) {
        return a.compareTo(b) < 0 ? a + "|" + b : b + "|" + a;
    }

    // ------------------------------------------------------------- vistas

    private Map<UUID, List<String>> scheduleIssues(List<Match> matches) {
        Map<UUID, List<String>> issues = new HashMap<>();
        Map<String, Integer> pairTurnCount = new HashMap<>();
        Map<UUID, Integer> pairTurns = new HashMap<>();
        for (Match m : matches) {
            if (m.getTurn() == null) continue;
            for (Pair p : List.of(m.getPair1(), m.getPair2())) {
                pairTurnCount.merge(p.getId() + "|" + m.getTurn(), 1, Integer::sum);
                pairTurns.merge(p.getId(), 1 << m.getTurn(), (a, b) -> a | b);
            }
        }
        for (Match m : matches) {
            List<String> list = new ArrayList<>();
            if (m.getTurn() == null) {
                list.add((turnMask(m.getPair1()) & turnMask(m.getPair2())) == 0
                    ? "No comparten ninguna franja horaria."
                    : "No quedó un turno con cancha libre que les sirva a ambas parejas.");
            } else {
                for (Pair p : List.of(m.getPair1(), m.getPair2())) {
                    if ((turnMask(p) & (1 << m.getTurn())) == 0) {
                        list.add(pairLabel(p) + " no eligió la franja de las " + turnLabel(m.getTurn()) + ".");
                    }
                    if (pairTurnCount.getOrDefault(p.getId() + "|" + m.getTurn(), 0) > 1) {
                        list.add(pairLabel(p) + " tiene otro partido a las " + turnLabel(m.getTurn()) + ".");
                    }
                    if (inRunOfThree(pairTurns.getOrDefault(p.getId(), 0), m.getTurn())) {
                        list.add(pairLabel(p) + " juega 3 partidos seguidos.");
                    }
                }
            }
            if (!list.isEmpty()) issues.put(m.getId(), list);
        }
        return issues;
    }

    /** El turno forma parte de una racha de 3 o más turnos seguidos de la pareja. */
    private static boolean inRunOfThree(int turns, int turn) {
        for (int start = turn - 2; start <= turn; start++) {
            if (start >= 0 && ((turns >> start) & 0b111) == 0b111) return true;
        }
        return false;
    }

    MatchView toMatchView(Match m, List<String> issues, Map<UUID, String> seeds) {
        return new MatchView(
            m.getId(),
            m.getGroup() == null ? null : m.getGroup().getName(),
            m.getPair1() == null ? null : toPairView(m.getPair1()),
            m.getPair2() == null ? null : toPairView(m.getPair2()),
            m.getTurn(),
            m.getTurn() == null ? null : turnLabel(m.getTurn()),
            m.getCourt() == null ? null : m.getCourt().getId(),
            m.getCourt() == null ? null : m.getCourt().getName(),
            m.getCourt() == null ? null : m.getCourt().getVenue().getName(),
            sets(m),
            m.getWinner() == null ? null : m.getWinner().getId(),
            issues,
            m.getBracketRound(),
            m.getBracketPosition(),
            m.getPair1() == null ? null : seeds.get(m.getPair1().getId()),
            m.getPair2() == null ? null : seeds.get(m.getPair2().getId())
        );
    }

    PairView toPairView(Pair p) {
        return new PairView(p.getId(),
            p.getPlayer1().getName() + " " + p.getPlayer1().getLastName(),
            p.getPlayer2().getName() + " " + p.getPlayer2().getLastName(),
            p.getLevel().name(),
            p.getAvailableSchedules().stream().sorted().map(Enum::name).toList());
    }

    static List<SetScore> sets(Match m) {
        List<SetScore> sets = new ArrayList<>();
        if (m.getSet1Pair1() != null) sets.add(new SetScore(m.getSet1Pair1(), m.getSet1Pair2()));
        if (m.getSet2Pair1() != null) sets.add(new SetScore(m.getSet2Pair1(), m.getSet2Pair2()));
        if (m.getSet3Pair1() != null) sets.add(new SetScore(m.getSet3Pair1(), m.getSet3Pair2()));
        return sets;
    }

    String pairLabel(Pair p) {
        return p.getPlayer1().getLastName() + " / " + p.getPlayer2().getLastName();
    }

    static Comparator<Match> matchOrder() {
        return Comparator.comparing((Match m) -> m.getTurn() == null ? Integer.MAX_VALUE : m.getTurn())
            .thenComparing(m -> m.getCourt() == null ? "" : m.getCourt().getName());
    }

    static int turnMask(Pair p) {
        int mask = 0;
        for (TimeSlot slot : p.getAvailableSchedules()) mask |= FixtureScheduler.franjaMask(slot.ordinal());
        return mask;
    }

    public static String turnLabel(int turn) {
        int minutes = 9 * 60 + turn * 90;
        return String.format("%02d:%02d", minutes / 60, minutes % 60);
    }

    static List<String> turnLabels() {
        return IntStream.range(0, FixtureScheduler.TURNS_PER_DAY).mapToObj(FixtureService::turnLabel).toList();
    }

    static String dateLabel(LocalDate date) {
        if (date == null) return null;
        String s = date.format(DATE_FORMAT);
        return Character.toUpperCase(s.charAt(0)) + s.substring(1);
    }

    private static String groupName(int i) {
        return i < 26 ? String.valueOf((char) ('A' + i)) : "G" + (i + 1);
    }
}

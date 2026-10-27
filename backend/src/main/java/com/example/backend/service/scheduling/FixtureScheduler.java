package com.example.backend.service.scheduling;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.UUID;

/**
 * Arma los grupos y el horario de la fase de grupos.
 *
 * El día se divide en turnos de 1:30 (8 turnos de 09:00 a 21:00); cada franja
 * horaria de 3 horas que elige una pareja equivale a 2 turnos. Las
 * disponibilidades se representan como máscaras de bits de turnos.
 *
 * 1. Grupos: por categoría, en grupos de 4 (o 3 cuando no da la cuenta). Se
 *    busca con backtracking una partición donde cada grupo pueda jugar todos
 *    sus partidos respetando la disponibilidad de cada pareja. Si no existe, se
 *    mejora con búsqueda local la partición que deja menos partidos imposibles.
 * 2. Horario: asigna un turno a cada partido sin superar la cantidad de canchas
 *    por turno ni poner a una pareja dos veces en el mismo turno. Backtracking
 *    "más restringido primero" con poda; si no hay solución completa, devuelve
 *    la que deja menos partidos sin horario.
 */
public final class FixtureScheduler {

    public static final int TURNS_PER_DAY = 8;
    private static final int GROUP_SIZE = 4;
    private static final long GROUPING_BUDGET = 400_000;
    private static final long SCHEDULE_BUDGET = 600_000;

    public record Team(UUID id, String category, String level, int turns) {}

    public record PlannedMatch(int group, Team pair1, Team pair2, Integer turn, Integer court) {}

    public record Plan(List<List<Team>> groups, List<String> groupCategories, List<PlannedMatch> matches) {}

    private FixtureScheduler() {}

    /** Máscara de turnos de una franja de 3 horas (0 = 09-12, 1 = 12-15, ...). */
    public static int franjaMask(int franja) {
        return 0b11 << (franja * 2);
    }

    public static Plan plan(List<Team> teams, int courts) {
        Map<String, List<Team>> byCategory = new java.util.TreeMap<>();
        for (Team t : teams) {
            byCategory.computeIfAbsent(t.category(), c -> new ArrayList<>()).add(t);
        }

        List<List<Team>> groups = new ArrayList<>();
        List<String> categories = new ArrayList<>();
        for (Map.Entry<String, List<Team>> e : byCategory.entrySet()) {
            if (e.getValue().size() < 2) continue;
            for (List<Team> g : groupCategory(e.getValue())) {
                groups.add(g);
                categories.add(e.getKey());
            }
        }

        List<int[]> pairsOfMatches = new ArrayList<>();
        List<Team[]> matchTeams = new ArrayList<>();
        for (int gi = 0; gi < groups.size(); gi++) {
            List<Team> g = groups.get(gi);
            for (int a = 0; a < g.size(); a++) {
                for (int b = a + 1; b < g.size(); b++) {
                    pairsOfMatches.add(new int[]{gi});
                    matchTeams.add(new Team[]{g.get(a), g.get(b)});
                }
            }
        }

        Integer[] turns = new Scheduler(matchTeams, courts).solve();
        Integer[] courtOf = assignCourts(turns, pairsOfMatches, courts);

        List<PlannedMatch> planned = new ArrayList<>();
        for (int i = 0; i < matchTeams.size(); i++) {
            planned.add(new PlannedMatch(pairsOfMatches.get(i)[0], matchTeams.get(i)[0], matchTeams.get(i)[1],
                turns[i], courtOf[i]));
        }
        return new Plan(groups, categories, planned);
    }

    // ---------------------------------------------------------------- grupos

    static List<List<Team>> groupCategory(List<Team> teams) {
        int n = teams.size();
        int groupCount = n <= GROUP_SIZE + 1 ? 1 : (n + GROUP_SIZE - 1) / GROUP_SIZE;
        int[] capacity = new int[groupCount];
        for (int i = 0; i < groupCount; i++) {
            capacity[i] = n / groupCount + (i < n % groupCount ? 1 : 0);
        }

        // Las parejas con menos turnos disponibles son las más difíciles de ubicar: van primero.
        List<Team> order = new ArrayList<>(teams);
        order.sort(Comparator.comparingInt((Team t) -> Integer.bitCount(t.turns()))
            .thenComparing(t -> t.id().toString()));

        List<List<Team>> groups = new ArrayList<>();
        for (int i = 0; i < groupCount; i++) groups.add(new ArrayList<>());

        long[] nodes = {0};
        if (placeStrict(order, 0, groups, capacity, nodes)) {
            return groups;
        }
        return localSearch(order, capacity);
    }

    private static boolean placeStrict(List<Team> order, int i, List<List<Team>> groups, int[] capacity, long[] nodes) {
        if (i == order.size()) return true;
        if (++nodes[0] > GROUPING_BUDGET) return false;
        Team t = order.get(i);

        List<Integer> candidates = new ArrayList<>();
        boolean[] triedEmptyOfSize = new boolean[GROUP_SIZE + 3];
        for (int g = 0; g < groups.size(); g++) {
            if (groups.get(g).size() >= capacity[g]) continue;
            if (groups.get(g).isEmpty()) {
                // Dos grupos vacíos de igual tamaño son intercambiables: basta con probar uno.
                if (triedEmptyOfSize[capacity[g]]) continue;
                triedEmptyOfSize[capacity[g]] = true;
            }
            candidates.add(g);
        }
        // Preferimos grupos con menos parejas del mismo nivel, para que queden parejos.
        candidates.sort(Comparator.comparingInt((Integer g) -> sameLevel(groups.get(g), t))
            .thenComparingInt(g -> groups.get(g).size()));

        for (int g : candidates) {
            List<Team> group = groups.get(g);
            boolean compatible = true;
            for (Team other : group) {
                if ((other.turns() & t.turns()) == 0) { compatible = false; break; }
            }
            if (!compatible) continue;
            group.add(t);
            if (playable(group) == matchCount(group.size()) && placeStrict(order, i + 1, groups, capacity, nodes)) {
                return true;
            }
            group.remove(group.size() - 1);
            if (nodes[0] > GROUPING_BUDGET) return false;
        }
        return false;
    }

    private static int sameLevel(List<Team> group, Team t) {
        int n = 0;
        for (Team o : group) if (o.level().equals(t.level())) n++;
        return n;
    }

    private static int matchCount(int size) {
        return size * (size - 1) / 2;
    }

    /**
     * Máxima cantidad de partidos del grupo que se pueden jugar respetando la
     * disponibilidad, sin que una pareja juegue dos partidos en el mismo turno
     * (sin contar canchas, que se resuelven en la etapa global).
     */
    static int playable(List<Team> group) {
        List<int[]> ms = new ArrayList<>();
        for (int a = 0; a < group.size(); a++) {
            for (int b = a + 1; b < group.size(); b++) ms.add(new int[]{a, b});
        }
        int[] busy = new int[group.size()];
        int[] best = {0};
        playableDfs(group, ms, 0, 0, busy, best);
        return best[0];
    }

    private static void playableDfs(List<Team> group, List<int[]> ms, int i, int done, int[] busy, int[] best) {
        if (done + (ms.size() - i) <= best[0]) return;
        if (i == ms.size()) { best[0] = done; return; }
        int a = ms.get(i)[0], b = ms.get(i)[1];
        int options = group.get(a).turns() & group.get(b).turns() & ~busy[a] & ~busy[b];
        for (int t = 0; t < TURNS_PER_DAY; t++) {
            if ((options & (1 << t)) == 0) continue;
            busy[a] |= 1 << t; busy[b] |= 1 << t;
            playableDfs(group, ms, i + 1, done + 1, busy, best);
            busy[a] &= ~(1 << t); busy[b] &= ~(1 << t);
            if (best[0] == ms.size()) return;
        }
        playableDfs(group, ms, i + 1, done, busy, best);
    }

    /** Partición que minimiza los partidos imposibles; desempata por grupos parejos en nivel. */
    private static List<List<Team>> localSearch(List<Team> order, int[] capacity) {
        Random random = new Random(42);
        List<List<Team>> best = null;
        long bestCost = Long.MAX_VALUE;

        for (int restart = 0; restart < 8; restart++) {
            List<Team> shuffled = new ArrayList<>(order);
            if (restart > 0) java.util.Collections.shuffle(shuffled, random);
            List<List<Team>> groups = greedyGroups(shuffled, capacity);
            long cost = cost(groups);

            boolean improved = true;
            while (improved && cost > 0) {
                improved = false;
                for (int g1 = 0; g1 < groups.size() && !improved; g1++) {
                    for (int g2 = g1 + 1; g2 < groups.size() && !improved; g2++) {
                        for (int i = 0; i < groups.get(g1).size() && !improved; i++) {
                            for (int j = 0; j < groups.get(g2).size() && !improved; j++) {
                                swap(groups, g1, i, g2, j);
                                long c = cost(groups);
                                if (c < cost) { cost = c; improved = true; }
                                else swap(groups, g1, i, g2, j);
                            }
                        }
                    }
                }
            }
            if (cost < bestCost) {
                bestCost = cost;
                best = groups;
            }
            if (bestCost < 100) break; // sin partidos imposibles: sólo queda afinar niveles
        }
        return best;
    }

    private static List<List<Team>> greedyGroups(List<Team> order, int[] capacity) {
        List<List<Team>> groups = new ArrayList<>();
        for (int i = 0; i < capacity.length; i++) groups.add(new ArrayList<>());
        for (Team t : order) {
            int bestGroup = -1;
            int bestScore = Integer.MIN_VALUE;
            for (int g = 0; g < groups.size(); g++) {
                if (groups.get(g).size() >= capacity[g]) continue;
                int score = 0;
                for (Team o : groups.get(g)) {
                    int common = Integer.bitCount(o.turns() & t.turns());
                    score += common == 0 ? -100 : Math.min(common, 4);
                }
                score -= sameLevel(groups.get(g), t) * 2;
                if (score > bestScore) { bestScore = score; bestGroup = g; }
            }
            groups.get(bestGroup).add(t);
        }
        return groups;
    }

    private static void swap(List<List<Team>> groups, int g1, int i, int g2, int j) {
        Team a = groups.get(g1).get(i);
        groups.get(g1).set(i, groups.get(g2).get(j));
        groups.get(g2).set(j, a);
    }

    private static long cost(List<List<Team>> groups) {
        long impossible = 0;
        long levelImbalance = 0;
        for (List<Team> g : groups) {
            impossible += matchCount(g.size()) - playable(g);
            Map<String, Integer> levels = new HashMap<>();
            for (Team t : g) levels.merge(t.level(), 1, Integer::sum);
            for (int c : levels.values()) levelImbalance += (long) (c - 1) * (c - 1);
        }
        return impossible * 100 + levelImbalance;
    }

    // ---------------------------------------------------------------- horario

    /** true si la máscara de turnos tiene 3 turnos consecutivos (4:30 h de juego sin descanso). */
    static boolean threeInARow(int turns) {
        return (turns & (turns >> 1) & (turns >> 2)) != 0;
    }

    private static final class Scheduler {
        private final Team[][] matches;
        private final int courts;
        private final Map<UUID, Integer> teamIndex = new HashMap<>();
        private final int[] teamOf1, teamOf2;
        private final int[] busy;
        private final int[] used = new int[TURNS_PER_DAY];
        private final Integer[] current;
        private Integer[] best;
        private int bestSkipped = Integer.MAX_VALUE;
        private long nodes;
        private boolean limitRuns;

        Scheduler(List<Team[]> matchTeams, int courts) {
            this.matches = matchTeams.toArray(new Team[0][]);
            this.courts = courts;
            this.teamOf1 = new int[matches.length];
            this.teamOf2 = new int[matches.length];
            for (int i = 0; i < matches.length; i++) {
                teamOf1[i] = teamIndex.computeIfAbsent(matches[i][0].id(), k -> teamIndex.size());
                teamOf2[i] = teamIndex.computeIfAbsent(matches[i][1].id(), k -> teamIndex.size());
            }
            this.busy = new int[teamIndex.size()];
            this.current = new Integer[matches.length];
            this.best = new Integer[matches.length];
        }

        /**
         * Primero busca un horario donde ninguna pareja juegue 3 partidos seguidos.
         * Sólo si así quedan partidos afuera prueba sin esa regla, y se queda con
         * la opción que deja menos partidos sin horario.
         */
        Integer[] solve() {
            if (courts <= 0 || matches.length == 0) return best;
            limitRuns = true;
            dfs(new boolean[matches.length], 0, 0);
            if (bestSkipped == 0) return best;

            Integer[] strict = best;
            int strictSkipped = bestSkipped;
            limitRuns = false;
            best = new Integer[matches.length];
            bestSkipped = Integer.MAX_VALUE;
            nodes = 0;
            dfs(new boolean[matches.length], 0, 0);
            return bestSkipped < strictSkipped ? best : strict;
        }

        private int options(int m) {
            int free = 0;
            for (int t = 0; t < TURNS_PER_DAY; t++) if (used[t] < courts) free |= 1 << t;
            int opts = matches[m][0].turns() & matches[m][1].turns() & ~busy[teamOf1[m]] & ~busy[teamOf2[m]] & free;
            if (limitRuns) {
                for (int t = 0; t < TURNS_PER_DAY; t++) {
                    if ((opts & (1 << t)) != 0 && (threeInARow(busy[teamOf1[m]] | 1 << t) || threeInARow(busy[teamOf2[m]] | 1 << t))) {
                        opts &= ~(1 << t);
                    }
                }
            }
            return opts;
        }

        private void dfs(boolean[] decided, int decidedCount, int skipped) {
            if (skipped >= bestSkipped || nodes++ > SCHEDULE_BUDGET) return;
            if (decidedCount == matches.length) {
                bestSkipped = skipped;
                best = current.clone();
                return;
            }

            int pick = -1, pickOptions = 0, pickCount = Integer.MAX_VALUE;
            for (int m = 0; m < matches.length; m++) {
                if (decided[m]) continue;
                int opts = options(m);
                int count = Integer.bitCount(opts);
                if (count < pickCount) { pick = m; pickOptions = opts; pickCount = count; }
                if (count == 0) break;
            }

            decided[pick] = true;
            for (int t : orderedTurns(pick, pickOptions)) {
                place(pick, t);
                dfs(decided, decidedCount + 1, skipped);
                unplace(pick, t);
                if (bestSkipped == 0) break;
            }
            // También se prueba dejarlo sin horario: a veces eso libera lugar para otros dos.
            if (bestSkipped > skipped + 1) {
                dfs(decided, decidedCount + 1, skipped + 1);
            }
            decided[pick] = false;
        }

        /** Primero los turnos que no obligan a jugar dos partidos seguidos y con canchas más libres. */
        private List<Integer> orderedTurns(int m, int opts) {
            List<Integer> turns = new ArrayList<>();
            for (int t = 0; t < TURNS_PER_DAY; t++) if ((opts & (1 << t)) != 0) turns.add(t);
            int adjacent1 = (busy[teamOf1[m]] << 1) | (busy[teamOf1[m]] >> 1);
            int adjacent2 = (busy[teamOf2[m]] << 1) | (busy[teamOf2[m]] >> 1);
            turns.sort(Comparator.comparingInt((Integer t) ->
                    ((adjacent1 >> t) & 1) + ((adjacent2 >> t) & 1))
                .thenComparingInt(t -> used[t])
                .thenComparingInt(t -> t));
            return turns;
        }

        private void place(int m, int t) {
            current[m] = t;
            used[t]++;
            busy[teamOf1[m]] |= 1 << t;
            busy[teamOf2[m]] |= 1 << t;
        }

        private void unplace(int m, int t) {
            current[m] = null;
            used[t]--;
            busy[teamOf1[m]] &= ~(1 << t);
            busy[teamOf2[m]] &= ~(1 << t);
        }
    }

    /** Dentro de cada turno reparte canchas en orden de grupo, así un grupo tiende a quedar en la misma cancha. */
    private static Integer[] assignCourts(Integer[] turns, List<int[]> groupOfMatch, int courts) {
        Integer[] court = new Integer[turns.length];
        Integer[] idx = new Integer[turns.length];
        for (int i = 0; i < idx.length; i++) idx[i] = i;
        Arrays.sort(idx, Comparator.comparingInt((Integer i) -> groupOfMatch.get(i)[0]).thenComparingInt(i -> i));
        int[] next = new int[TURNS_PER_DAY];
        for (int i : idx) {
            if (turns[i] == null) continue;
            court[i] = next[turns[i]]++;
            if (court[i] >= courts) { court[i] = null; turns[i] = null; }
        }
        return court;
    }
}

package com.example.backend.service.scheduling;

import com.example.backend.service.scheduling.FixtureScheduler.Plan;
import com.example.backend.service.scheduling.FixtureScheduler.PlannedMatch;
import com.example.backend.service.scheduling.FixtureScheduler.Team;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class FixtureSchedulerTest {

    private static final String[] LEVELS = {"ALTO", "MEDIO", "BAJO"};

    private static List<Team> randomTeams(int n, long seed) {
        Random r = new Random(seed);
        List<Team> teams = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            int mask = 0;
            int franjas = 2 + r.nextInt(3); // 2 a 4 franjas
            List<Integer> all = new ArrayList<>(List.of(0, 1, 2, 3));
            java.util.Collections.shuffle(all, r);
            for (int f = 0; f < franjas; f++) mask |= FixtureScheduler.franjaMask(all.get(f));
            teams.add(new Team(UUID.randomUUID(), "A1", LEVELS[r.nextInt(3)], mask));
        }
        return teams;
    }

    private static void assertValid(Plan plan, int courts) {
        Map<Integer, Integer> perTurn = new HashMap<>();
        Set<String> courtTurn = new HashSet<>();
        Set<String> pairTurn = new HashSet<>();
        for (PlannedMatch m : plan.matches()) {
            if (m.turn() == null) continue;
            assertTrue((m.pair1().turns() & (1 << m.turn())) != 0, "pareja 1 no disponible");
            assertTrue((m.pair2().turns() & (1 << m.turn())) != 0, "pareja 2 no disponible");
            assertTrue(pairTurn.add(m.pair1().id() + "|" + m.turn()), "pareja 1 juega dos veces en el turno");
            assertTrue(pairTurn.add(m.pair2().id() + "|" + m.turn()), "pareja 2 juega dos veces en el turno");
            assertTrue(courtTurn.add(m.court() + "|" + m.turn()), "cancha ocupada dos veces");
            perTurn.merge(m.turn(), 1, Integer::sum);
            assertTrue(m.court() < courts);
        }
        perTurn.values().forEach(c -> assertTrue(c <= courts));
    }

    @Test
    void findsTheOnlyWorkingGroupingWithTwoFranjasEach() {
        // 16 parejas con el mínimo de 2 franjas, mezcladas: sólo funciona agrupar por franjas iguales.
        int[][] combos = {{0, 1}, {1, 2}, {2, 3}, {0, 3}};
        List<Team> teams = new ArrayList<>();
        for (int i = 0; i < 16; i++) {
            int[] c = combos[i % combos.length];
            teams.add(new Team(UUID.randomUUID(), "A1", LEVELS[i % 3],
                FixtureScheduler.franjaMask(c[0]) | FixtureScheduler.franjaMask(c[1])));
        }
        java.util.Collections.shuffle(teams, new Random(7));
        Plan plan = FixtureScheduler.plan(teams, 4);
        assertEquals(4, plan.groups().size());
        assertValid(plan, 4);
        assertEquals(0, plan.matches().stream().filter(m -> m.turn() == null).count());
        assertNoThreeInARow(plan);
    }

    private static void assertNoThreeInARow(Plan plan) {
        Map<UUID, Integer> busy = new HashMap<>();
        for (PlannedMatch m : plan.matches()) {
            if (m.turn() == null) continue;
            busy.merge(m.pair1().id(), 1 << m.turn(), (a, b) -> a | b);
            busy.merge(m.pair2().id(), 1 << m.turn(), (a, b) -> a | b);
        }
        busy.values().forEach(mask -> assertTrue(!FixtureScheduler.threeInARow(mask), "una pareja juega 3 partidos seguidos"));
    }

    @Test
    void neverThreeInARowWhenItCanBeAvoided() {
        // Tres parejas con mañana+mediodía (09:00-15:00) y una con todo el día, varias veces.
        for (long seed = 1; seed <= 20; seed++) {
            List<Team> teams = new ArrayList<>();
            Random r = new Random(seed);
            for (int i = 0; i < 16; i++) {
                int mask = r.nextBoolean()
                    ? FixtureScheduler.franjaMask(0) | FixtureScheduler.franjaMask(1)
                    : FixtureScheduler.franjaMask(0) | FixtureScheduler.franjaMask(1) | FixtureScheduler.franjaMask(2) | FixtureScheduler.franjaMask(3);
                teams.add(new Team(UUID.randomUUID(), "A1", LEVELS[i % 3], mask));
            }
            Plan plan = FixtureScheduler.plan(teams, 12);
            assertValid(plan, 12);
            assertEquals(0, plan.matches().stream().filter(m -> m.turn() == null).count());
            assertNoThreeInARow(plan);
        }
    }

    @Test
    void randomTournamentsAreAlwaysValid() {
        for (long seed = 1; seed <= 40; seed++) {
            int n = 6 + (int) (seed % 15);
            Plan plan = FixtureScheduler.plan(randomTeams(n, seed), 2 + (int) (seed % 4));
            assertValid(plan, 2 + (int) (seed % 4));
            int pairsInGroups = plan.groups().stream().mapToInt(List::size).sum();
            assertEquals(n, pairsInGroups);
        }
    }

    @Test
    void reportsImpossibleMatchesInsteadOfFailing() {
        // Dos parejas sin ninguna franja en común en un grupo de 2: el partido queda sin horario.
        List<Team> teams = List.of(
            new Team(UUID.randomUUID(), "A1", "ALTO", FixtureScheduler.franjaMask(0) | FixtureScheduler.franjaMask(1)),
            new Team(UUID.randomUUID(), "A1", "ALTO", FixtureScheduler.franjaMask(2) | FixtureScheduler.franjaMask(3)));
        Plan plan = FixtureScheduler.plan(teams, 2);
        assertEquals(1, plan.matches().size());
        assertEquals(null, plan.matches().get(0).turn());
    }

    /** Búsqueda exhaustiva: ¿existe alguna partición en grupos de 4 donde cada grupo pueda jugar todo? */
    private static boolean perfectPartitionExists(List<Team> rest) {
        if (rest.isEmpty()) return true;
        int n = rest.size();
        for (int a = 1; a < n; a++) for (int b = a + 1; b < n; b++) for (int c = b + 1; c < n; c++) {
            List<Team> g = List.of(rest.get(0), rest.get(a), rest.get(b), rest.get(c));
            if (FixtureScheduler.playable(g) < 6) continue;
            List<Team> next = new ArrayList<>(rest);
            next.removeAll(g);
            if (perfectPartitionExists(next)) return true;
        }
        return false;
    }

    @Test
    void findsAPerfectFixtureWheneverOneExists() {
        // El caso más difícil: todas las parejas con el mínimo de 2 franjas al azar.
        for (long seed = 0; seed < 60; seed++) {
            List<Team> teams = randomTeams(16, seed);
            teams.replaceAll(t -> {
                Random r = new Random(t.id().getLeastSignificantBits());
                List<Integer> f = new ArrayList<>(List.of(0, 1, 2, 3));
                java.util.Collections.shuffle(f, r);
                return new Team(t.id(), t.category(), t.level(), FixtureScheduler.franjaMask(f.get(0)) | FixtureScheduler.franjaMask(f.get(1)));
            });
            Plan plan = FixtureScheduler.plan(teams, 16);
            boolean allScheduled = plan.matches().stream().noneMatch(m -> m.turn() == null);
            assertEquals(perfectPartitionExists(teams), allScheduled, "semilla " + seed);
        }
    }
}

package com.example.backend.service;

import com.example.backend.dto.TournamentRequest;
import com.example.backend.dto.TournamentSummary;
import com.example.backend.model.Court;
import com.example.backend.model.Match;
import com.example.backend.model.Organizer;
import com.example.backend.model.Pair;
import com.example.backend.model.Tournament;
import com.example.backend.model.Venue;
import com.example.backend.model.enums.Category;
import com.example.backend.model.enums.MatchStage;
import com.example.backend.model.enums.TournamentType;
import com.example.backend.repository.GroupRepository;
import com.example.backend.repository.MatchRepository;
import com.example.backend.repository.OrganizerRepository;
import com.example.backend.repository.PairRepository;
import com.example.backend.repository.TournamentRepository;
import com.example.backend.repository.VenueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class TournamentService {

    private static final Pattern NUMBER = Pattern.compile("\\d+");

    private final TournamentRepository tournamentRepository;
    private final OrganizerRepository organizerRepository;
    private final PairRepository pairRepository;
    private final GroupRepository groupRepository;
    private final MatchRepository matchRepository;
    private final VenueRepository venueRepository;

    public TournamentSummary create(TournamentRequest req, String organizerEmail) {
        Organizer org = organizerRepository.findByEmail(organizerEmail)
            .orElseThrow(() -> new RuntimeException("Organizador no encontrado"));
        if (req.name() == null || req.name().isBlank()) {
            throw new RuntimeException("El nombre del torneo es obligatorio.");
        }

        Tournament t = new Tournament();
        t.setName(req.name().trim());
        t.setType(TournamentType.valueOf(req.type()));
        t.setCategory(Category.valueOf(req.category()));
        t.setStartDate(req.startDate());
        t.setOrganizer(org);
        // Las sedes del organizador quedan seleccionadas por defecto; se pueden quitar en el paso de sedes.
        t.setVenues(new HashSet<>(venueRepository.findByOrganizerEmailOrderByName(organizerEmail)));
        return summary(tournamentRepository.save(t));
    }

    @Transactional(readOnly = true)
    public List<TournamentSummary> getAll(String organizerEmail) {
        return tournamentRepository.findByOrganizerEmail(organizerEmail).stream()
            .sorted(Comparator.comparing(Tournament::getName, String.CASE_INSENSITIVE_ORDER))
            .map(this::summary)
            .toList();
    }

    @Transactional(readOnly = true)
    public TournamentSummary get(UUID id) {
        return summary(getEntity(id));
    }

    public Tournament getEntity(UUID id) {
        return tournamentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Torneo no encontrado"));
    }

    /** Canchas de las sedes del torneo, ordenadas por sede y número de cancha. */
    public List<Court> courtsOf(Tournament t) {
        return t.getVenues().stream()
            .sorted(Comparator.comparing(Venue::getName, String.CASE_INSENSITIVE_ORDER))
            .flatMap(v -> v.getCourts().stream().sorted(Comparator.comparing(Court::getName, TournamentService::natural)))
            .toList();
    }

    @Transactional
    public TournamentSummary setVenues(UUID id, List<UUID> venueIds, String organizerEmail) {
        Tournament t = getEntity(id);
        Set<Venue> venues = new HashSet<>();
        for (UUID venueId : venueIds == null ? List.<UUID>of() : venueIds) {
            Venue v = venueRepository.findById(venueId)
                .orElseThrow(() -> new RuntimeException("Sede no encontrada"));
            if (v.getOrganizer() == null || !v.getOrganizer().getEmail().equals(organizerEmail)) {
                throw new RuntimeException("La sede no es tuya.");
            }
            venues.add(v);
        }
        for (Match m : matchRepository.findByTournamentId(id)) {
            if (m.getCourt() != null && !venues.contains(m.getCourt().getVenue())) {
                throw new RuntimeException("La sede " + m.getCourt().getVenue().getName()
                    + " tiene partidos asignados en este torneo. Movelos o regenerá el fixture antes de quitarla.");
            }
        }
        t.setVenues(venues);
        return summary(tournamentRepository.save(t));
    }

    @Transactional
    public void delete(UUID id) {
        Tournament t = getEntity(id);
        matchRepository.deleteByTournamentId(id);
        List<Pair> pairs = pairRepository.findByTournamentId(id);
        pairRepository.deleteAll(pairs);
        groupRepository.deleteByTournamentId(id);
        tournamentRepository.delete(t);
    }

    private TournamentSummary summary(Tournament t) {
        List<Match> matches = matchRepository.findByTournamentId(t.getId());
        List<Match> group = matches.stream().filter(m -> m.getStage() == MatchStage.GROUP).toList();
        List<Match> bracket = matches.stream().filter(m -> m.getStage() == MatchStage.BRACKET).toList();
        Match fin = bracket.stream().filter(m -> Objects.equals(m.getBracketRound(), 1)).findFirst().orElse(null);
        String champion = fin == null || fin.getWinner() == null ? null
            : fin.getWinner().getPlayer1().getLastName() + " / " + fin.getWinner().getPlayer2().getLastName();

        String stage = champion != null ? "FINALIZADO"
            : !bracket.isEmpty() ? "LLAVES"
            : !group.isEmpty() ? "GRUPOS"
            : "INSCRIPCION";

        List<Venue> venues = t.getVenues().stream()
            .sorted(Comparator.comparing(Venue::getName, String.CASE_INSENSITIVE_ORDER)).toList();

        return new TournamentSummary(
            t.getId(), t.getName(), t.getType().name(), t.getCategory().name(), t.getStartDate(), stage, venues,
            pairRepository.findByTournamentId(t.getId()).size(),
            courtsOf(t).size(),
            groupRepository.findByTournamentId(t.getId()).size(),
            group.size(),
            (int) group.stream().filter(m -> m.getTurn() == null).count(),
            (int) group.stream().filter(m -> m.getWinner() != null).count(),
            bracket.size(),
            (int) bracket.stream().filter(m -> m.getWinner() != null).count(),
            champion
        );
    }

    /** "Cancha 2" antes que "Cancha 10". */
    static int natural(String a, String b) {
        Matcher ma = NUMBER.matcher(a), mb = NUMBER.matcher(b);
        if (ma.find() && mb.find() && a.substring(0, ma.start()).equalsIgnoreCase(b.substring(0, mb.start()))) {
            int cmp = Long.compare(Long.parseLong(ma.group()), Long.parseLong(mb.group()));
            if (cmp != 0) return cmp;
        }
        return a.compareToIgnoreCase(b);
    }
}

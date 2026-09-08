package com.example.backend.service;

import com.example.backend.dto.TournamentRequest;
import com.example.backend.model.Organizer;
import com.example.backend.model.Pair;
import com.example.backend.model.Tournament;
import com.example.backend.model.enums.Category;
import com.example.backend.model.enums.TournamentType;
import com.example.backend.repository.CourtRepository;
import com.example.backend.repository.GroupRepository;
import com.example.backend.repository.MatchRepository;
import com.example.backend.repository.OrganizerRepository;
import com.example.backend.repository.PairRepository;
import com.example.backend.repository.TournamentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TournamentService {

    private final TournamentRepository tournamentRepository;
    private final OrganizerRepository organizerRepository;
    private final PairRepository pairRepository;
    private final GroupRepository groupRepository;
    private final MatchRepository matchRepository;
    private final CourtRepository courtRepository;

    public Tournament create(TournamentRequest req, String organizerEmail) {
        Organizer org = organizerRepository.findByEmail(organizerEmail)
            .orElseThrow(() -> new RuntimeException("Organizador no encontrado"));

        Tournament t = new Tournament();
        t.setName(req.name());
        t.setType(TournamentType.valueOf(req.type()));
        t.setCategory(Category.valueOf(req.category()));
        t.setOrganizer(org);
        return tournamentRepository.save(t);
    }

    public List<Tournament> getAll() {
        return tournamentRepository.findAll();
    }

    @Transactional
    public void delete(UUID id) {
        tournamentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Torneo no encontrado"));

        matchRepository.deleteByGroupTournamentId(id);
        List<Pair> pairs = pairRepository.findByTournamentId(id);
        pairRepository.deleteAll(pairs);
        groupRepository.deleteByTournamentId(id);
        courtRepository.deleteByTournamentId(id);
        tournamentRepository.deleteById(id);
    }
}
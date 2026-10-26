package com.example.backend.service;

import com.example.backend.dto.PlayerProfile;
import com.example.backend.dto.PlayerRequest;
import com.example.backend.model.Pair;
import com.example.backend.model.Player;
import com.example.backend.repository.PairRepository;
import com.example.backend.repository.PlayerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PlayerService {

    private final PlayerRepository playerRepository;
    private final PairRepository pairRepository;

    public List<Player> search(String query) {
        return playerRepository.findByNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(query, query)
            .stream().limit(10).toList();
    }

    public Player findOrCreate(String name, String lastName) {
        return playerRepository
            .findByNameIgnoreCaseAndLastNameIgnoreCase(name, lastName)
            .orElseGet(() -> {
                Player p = new Player();
                p.setName(name);
                p.setLastName(lastName);
                return playerRepository.save(p);
            });
    }

    public List<PlayerProfile> getAll() {
        return playerRepository.findAll().stream()
            .sorted(Comparator.comparing(Player::getLastName, String.CASE_INSENSITIVE_ORDER)
                .thenComparing(Player::getName, String.CASE_INSENSITIVE_ORDER))
            .map(this::toProfile)
            .toList();
    }

    public PlayerProfile getProfile(UUID id) {
        return toProfile(getById(id));
    }

    public Player create(PlayerRequest req) {
        validate(req, null);
        Player p = new Player();
        apply(p, req);
        return playerRepository.save(p);
    }

    public Player update(UUID id, PlayerRequest req) {
        Player p = getById(id);
        validate(req, id);
        apply(p, req);
        return playerRepository.save(p);
    }

    @Transactional
    public void delete(UUID id) {
        Player p = getById(id);
        int inscriptions = pairRepository.findByPlayer1IdOrPlayer2Id(id, id).size();
        if (inscriptions > 0) {
            throw new RuntimeException("No se puede eliminar: el jugador está inscripto en "
                + inscriptions + " pareja(s). Eliminá primero esas inscripciones.");
        }
        playerRepository.delete(p);
    }

    private Player getById(UUID id) {
        return playerRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Jugador no encontrado"));
    }

    // Nombre+apellido identifican al jugador (findOrCreate los usa al inscribir parejas),
    // así que no se permiten duplicados.
    private void validate(PlayerRequest req, UUID selfId) {
        if (isBlank(req.name()) || isBlank(req.lastName())) {
            throw new RuntimeException("Nombre y apellido son obligatorios.");
        }
        if (!isBlank(req.email()) && !req.email().trim().matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")) {
            throw new RuntimeException("El email no es válido.");
        }
        playerRepository.findByNameIgnoreCaseAndLastNameIgnoreCase(req.name().trim(), req.lastName().trim())
            .filter(existing -> !existing.getId().equals(selfId))
            .ifPresent(existing -> {
                throw new RuntimeException("Ya existe un jugador llamado " + existing.getName() + " " + existing.getLastName() + ".");
            });
    }

    private void apply(Player p, PlayerRequest req) {
        p.setName(req.name().trim());
        p.setLastName(req.lastName().trim());
        p.setEmail(isBlank(req.email()) ? null : req.email().trim());
        p.setPhone(isBlank(req.phone()) ? null : req.phone().trim());
    }

    private PlayerProfile toProfile(Player p) {
        List<PlayerProfile.Participation> participations = pairRepository.findByPlayer1IdOrPlayer2Id(p.getId(), p.getId())
            .stream()
            .map(pair -> toParticipation(pair, p))
            .toList();
        return new PlayerProfile(p.getId(), p.getName(), p.getLastName(), p.getEmail(), p.getPhone(), participations);
    }

    private PlayerProfile.Participation toParticipation(Pair pair, Player self) {
        Player partner = pair.getPlayer1().getId().equals(self.getId()) ? pair.getPlayer2() : pair.getPlayer1();
        return new PlayerProfile.Participation(
            pair.getId(),
            pair.getTournament().getId(),
            pair.getTournament().getName(),
            partner.getName() + " " + partner.getLastName(),
            pair.getCategory().name(),
            pair.getLevel().name()
        );
    }

    private static boolean isBlank(String s) {
        return s == null || s.isBlank();
    }
}

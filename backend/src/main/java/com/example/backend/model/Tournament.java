package com.example.backend.model;

import com.example.backend.model.enums.Category;
import com.example.backend.model.enums.TournamentType;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "tournaments")
@Data
public class Tournament {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TournamentType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Category category;

    /** Día de la fase de grupos; las llaves se juegan el día siguiente. */
    private LocalDate startDate;

    @ManyToOne
    @JoinColumn(name = "organizer_id")
    @JsonIgnore
    private Organizer organizer;

    @ManyToMany
    @JoinTable(name = "tournament_venues",
        joinColumns = @JoinColumn(name = "tournament_id"),
        inverseJoinColumns = @JoinColumn(name = "venue_id"))
    @JsonIgnore
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    private Set<Venue> venues = new HashSet<>();
}

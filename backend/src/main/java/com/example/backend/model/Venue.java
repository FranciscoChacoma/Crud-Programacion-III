package com.example.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/** Sede (club) del organizador; sus canchas se reutilizan en todos sus torneos. */
@Entity
@Table(name = "venues")
@Data
public class Venue {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    private String address;

    @ManyToOne
    @JoinColumn(name = "organizer_id")
    @JsonIgnore
    private Organizer organizer;

    @OneToMany(mappedBy = "venue", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @OrderBy("name")
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    private List<Court> courts = new ArrayList<>();
}

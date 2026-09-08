package com.example.backend.model;

import com.example.backend.model.enums.Category;
import com.example.backend.model.enums.Level;
import com.example.backend.model.enums.TimeSlot;
import jakarta.persistence.*;
import lombok.Data;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "pairs")
@Data
public class Pair {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "player1_id")
    private Player player1;

    @ManyToOne
    @JoinColumn(name = "player2_id")
    private Player player2;

    @ManyToOne
    @JoinColumn(name = "tournament_id")
    private Tournament tournament;

    @Enumerated(EnumType.STRING)
    private Category category;

    @Enumerated(EnumType.STRING)
    private Level level;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "pair_available_schedules", joinColumns = @JoinColumn(name = "pair_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "schedule")
    private Set<TimeSlot> availableSchedules = new HashSet<>();

    @ManyToOne
    @JoinColumn(name = "group_id")
    private Group group;
}

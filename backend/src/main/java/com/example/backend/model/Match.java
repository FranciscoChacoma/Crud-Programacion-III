package com.example.backend.model;

import com.example.backend.model.enums.TimeSlot;
import jakarta.persistence.*;
import lombok.Data;
import java.util.UUID;

@Entity
@Table(name = "matches")
@Data
public class Match {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "group_id", nullable = false)
    private Group group;

    @ManyToOne
    @JoinColumn(name = "pair1_id", nullable = false)
    private Pair pair1;

    @ManyToOne
    @JoinColumn(name = "pair2_id", nullable = false)
    private Pair pair2;

    @ManyToOne
    @JoinColumn(name = "court_id")
    private Court court;

    @Enumerated(EnumType.STRING)
    @Column(name = "time_slot")
    private TimeSlot timeSlot;
}

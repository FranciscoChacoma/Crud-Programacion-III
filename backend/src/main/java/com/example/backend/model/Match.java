package com.example.backend.model;

import com.example.backend.model.enums.MatchStage;
import jakarta.persistence.*;
import lombok.Data;
import java.util.UUID;

/**
 * Partido de grupos o de llaves. El horario es un turno de 1:30 dentro del día
 * (0 = 09:00, 1 = 10:30, ... 7 = 19:30); los de grupos se juegan el día del
 * torneo y los de llaves el día siguiente.
 */
@Entity
@Table(name = "matches")
@Data
public class Match {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "tournament_id")
    private Tournament tournament;

    @Enumerated(EnumType.STRING)
    private MatchStage stage;

    @ManyToOne
    @JoinColumn(name = "group_id")
    private Group group;

    /** En llaves puede ser null mientras no se conozca el ganador del cruce anterior. */
    @ManyToOne
    @JoinColumn(name = "pair1_id")
    private Pair pair1;

    @ManyToOne
    @JoinColumn(name = "pair2_id")
    private Pair pair2;

    @ManyToOne
    @JoinColumn(name = "court_id")
    private Court court;

    private Integer turn;

    /** Llaves: cantidad de partidos de la ronda (1 = final, 2 = semis, 4 = cuartos...). */
    private Integer bracketRound;

    /** Llaves: posición dentro de la ronda; el ganador pasa a (ronda / 2, posición / 2). */
    private Integer bracketPosition;

    private Integer set1Pair1;
    private Integer set1Pair2;
    private Integer set2Pair1;
    private Integer set2Pair2;
    private Integer set3Pair1;
    private Integer set3Pair2;

    @ManyToOne
    @JoinColumn(name = "winner_id")
    private Pair winner;
}

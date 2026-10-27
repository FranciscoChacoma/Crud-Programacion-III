package com.example.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.UUID;

@Entity
@Table(name = "players")
@Data
public class Player {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String lastName;

    private String email;

    private String phone;

    /** Categoría en la que juega (1ra a 8va); decide en qué torneos se puede inscribir. */
    @Enumerated(EnumType.STRING)
    private com.example.backend.model.enums.Category category;
}

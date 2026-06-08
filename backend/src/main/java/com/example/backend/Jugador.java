package com.example.backend;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Jugador {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String nombre;
    private String apellido;
}

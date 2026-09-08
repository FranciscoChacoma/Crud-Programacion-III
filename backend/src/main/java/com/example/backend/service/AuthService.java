package com.example.backend.service;

import com.example.backend.model.Organizer;
import com.example.backend.repository.OrganizerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.security.MessageDigest;
import java.util.Base64;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final OrganizerRepository organizerRepository;
    private final JwtService jwtService;

    public String register(String name, String email, String password) {
        if (name == null || name.isBlank()) {
            throw new RuntimeException("El nombre es obligatorio");
        }
        if (email == null || email.isBlank()) {
            throw new RuntimeException("El email es obligatorio");
        }
        if (password == null || password.length() < 6) {
            throw new RuntimeException("La contraseña debe tener al menos 6 caracteres");
        }
        if (organizerRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Ya existe un organizador registrado con ese email");
        }

        Organizer org = new Organizer();
        org.setName(name);
        org.setEmail(email);
        org.setPasswordHash(hashPassword(password));
        organizerRepository.save(org);

        return jwtService.generateToken(email);
    }

    public String login(String email, String password) {
        Organizer org = organizerRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Email o contraseña incorrectos"));

        if (!org.getPasswordHash().equals(hashPassword(password))) {
            throw new RuntimeException("Email o contraseña incorrectos");
        }

        return jwtService.generateToken(email);
    }

    public static String hashPassword(String password) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(password.getBytes());
            return Base64.getEncoder().encodeToString(hash);
        } catch (Exception e) {
            throw new RuntimeException("Error hasheando password");
        }
    }
}


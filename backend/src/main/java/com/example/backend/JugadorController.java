package com.example.backend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/jugadores")
@CrossOrigin(origins = "*")
public class JugadorController {

    @Autowired
    private JugadorRepository repo;

    @GetMapping
    public List<Jugador> listar() {
        return repo.findAll();
    }

    @PostMapping
    public Jugador guardar(@RequestBody Jugador j) {
        return repo.save(j);
    }

    @PutMapping("/{id}")
    public Jugador editar(@PathVariable Long id, @RequestBody Jugador j) {
        j.setId(id);
        return repo.save(j);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        repo.deleteById(id);
    }
}

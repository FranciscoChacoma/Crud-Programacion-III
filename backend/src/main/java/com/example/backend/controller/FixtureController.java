package com.example.backend.controller;

import com.example.backend.dto.BracketView;
import com.example.backend.dto.EmailReport;
import com.example.backend.dto.FixtureView;
import com.example.backend.dto.MoveRequest;
import com.example.backend.dto.ResultRequest;
import com.example.backend.service.BracketService;
import com.example.backend.service.FixtureService;
import com.example.backend.service.MailService;
import com.example.backend.service.PdfService;
import com.example.backend.service.ResultService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/tournaments/{tournamentId}")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class FixtureController {

    private final FixtureService fixtureService;
    private final BracketService bracketService;
    private final ResultService resultService;
    private final PdfService pdfService;
    private final MailService mailService;

    @GetMapping("/fixture")
    public ResponseEntity<FixtureView> get(@PathVariable UUID tournamentId) {
        return ResponseEntity.ok(fixtureService.getFixture(tournamentId));
    }

    @PostMapping("/fixture/generate")
    public ResponseEntity<FixtureView> generate(@PathVariable UUID tournamentId) {
        return ResponseEntity.ok(fixtureService.generate(tournamentId));
    }

    @GetMapping(value = "/fixture/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> pdf(@PathVariable UUID tournamentId) {
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=fixture.pdf")
            .body(pdfService.build(tournamentId));
    }

    @PostMapping("/fixture/email")
    public ResponseEntity<EmailReport> email(@PathVariable UUID tournamentId) {
        return ResponseEntity.ok(mailService.sendFixture(tournamentId));
    }

    @PutMapping("/matches/{matchId}/slot")
    public ResponseEntity<Void> move(@PathVariable UUID tournamentId, @PathVariable UUID matchId,
                                     @RequestBody MoveRequest request) {
        fixtureService.move(tournamentId, matchId, request.courtId(), request.turn());
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/matches/{matchId}/result")
    public ResponseEntity<Void> saveResult(@PathVariable UUID tournamentId, @PathVariable UUID matchId,
                                           @RequestBody ResultRequest request) {
        resultService.save(tournamentId, matchId, request.sets());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/matches/{matchId}/result")
    public ResponseEntity<Void> clearResult(@PathVariable UUID tournamentId, @PathVariable UUID matchId) {
        resultService.clear(tournamentId, matchId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/bracket")
    public ResponseEntity<BracketView> bracket(@PathVariable UUID tournamentId) {
        return ResponseEntity.ok(bracketService.getBracket(tournamentId));
    }

    @PostMapping("/bracket/generate")
    public ResponseEntity<BracketView> generateBracket(@PathVariable UUID tournamentId) {
        return ResponseEntity.ok(bracketService.generate(tournamentId));
    }

    @DeleteMapping("/bracket")
    public ResponseEntity<Void> clearBracket(@PathVariable UUID tournamentId) {
        bracketService.clear(tournamentId);
        return ResponseEntity.noContent().build();
    }
}

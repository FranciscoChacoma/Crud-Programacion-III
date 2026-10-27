package com.example.backend.service;

import com.example.backend.dto.BracketView;
import com.example.backend.dto.EmailReport;
import com.example.backend.dto.FixtureView;
import com.example.backend.dto.FixtureView.MatchView;
import com.example.backend.model.Pair;
import com.example.backend.model.Player;
import com.example.backend.model.Tournament;
import com.example.backend.repository.PairRepository;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.web.util.HtmlUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Stream;

/** Manda a cada jugador sus partidos y la planilla del torneo en PDF. */
@Service
@RequiredArgsConstructor
public class MailService {

    private final ObjectProvider<JavaMailSender> mailSender;
    private final TournamentService tournamentService;
    private final FixtureService fixtureService;
    private final BracketService bracketService;
    private final PdfService pdfService;
    private final PairRepository pairRepository;

    @Value("${spring.mail.username:}")
    private String from;

    public EmailReport sendFixture(UUID tournamentId) {
        JavaMailSender sender = mailSender.getIfAvailable();
        if (sender == null || from == null || from.isBlank()) {
            throw new RuntimeException("El envío de mails no está configurado. Completá MAIL_USERNAME y MAIL_PASSWORD "
                + "(con Gmail, una contraseña de aplicación) en application.properties y reiniciá el backend.");
        }

        Tournament t = tournamentService.getEntity(tournamentId);
        byte[] pdf = pdfService.build(tournamentId);
        FixtureView fixture = fixtureService.getFixture(tournamentId);
        BracketView bracket = bracketService.getBracket(tournamentId);
        List<MatchView> allMatches = Stream.concat(
            fixture.groups().stream().flatMap(g -> g.matches().stream()),
            bracket.rounds().stream().flatMap(r -> r.matches().stream())).toList();
        String fileName = t.getName().replaceAll("[^A-Za-z0-9áéíóúñÁÉÍÓÚÑ -]", "").trim() + ".pdf";

        int sent = 0;
        List<String> withoutEmail = new ArrayList<>();
        List<String> failed = new ArrayList<>();
        java.util.Set<UUID> notified = new java.util.HashSet<>();
        for (Pair pair : pairRepository.findByTournamentId(tournamentId)) {
            List<MatchView> own = allMatches.stream()
                .filter(m -> (m.pair1() != null && m.pair1().id().equals(pair.getId()))
                    || (m.pair2() != null && m.pair2().id().equals(pair.getId())))
                .toList();
            for (Player player : List.of(pair.getPlayer1(), pair.getPlayer2())) {
                if (!notified.add(player.getId())) continue;
                String name = player.getName() + " " + player.getLastName();
                if (player.getEmail() == null || player.getEmail().isBlank()) {
                    withoutEmail.add(name);
                    continue;
                }
                try {
                    MimeMessage msg = sender.createMimeMessage();
                    MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
                    helper.setFrom(from);
                    helper.setTo(player.getEmail());
                    helper.setSubject(t.getName() + " · Tus partidos");
                    helper.setText(body(t, player, pair, own, fixture.date(), bracket.date()), true);
                    helper.addAttachment(fileName, new ByteArrayResource(pdf), "application/pdf");
                    sender.send(msg);
                    sent++;
                } catch (Exception e) {
                    failed.add(name + " (" + player.getEmail() + ")");
                }
            }
        }
        if (sent == 0 && !failed.isEmpty()) {
            throw new RuntimeException("No se pudo enviar ningún mail. Revisá la configuración del correo (usuario, contraseña y servidor SMTP).");
        }
        return new EmailReport(sent, withoutEmail, failed);
    }

    private String body(Tournament t, Player player, Pair pair, List<MatchView> matches, String groupsDate, String bracketDate) {
        StringBuilder rows = new StringBuilder();
        for (MatchView m : matches) {
            boolean first = m.pair1() != null && m.pair1().id().equals(pair.getId());
            FixtureView.PairView rival = first ? m.pair2() : m.pair1();
            String when = m.groupName() != null
                ? (groupsDate != null ? groupsDate + " · " : "") + (m.time() == null ? "Horario a definir" : m.time())
                : (bracketDate != null ? bracketDate + " · " : "") + (m.time() == null ? "Horario a definir" : m.time());
            String where = m.courtName() == null ? "Cancha a definir" : m.courtName() + " · " + m.venueName();
            String stage = m.groupName() != null ? "Grupo " + m.groupName() : BracketService.roundName(m.bracketRound());
            rows.append("<tr>")
                .append(cell(esc(stage)))
                .append(cell("<strong>" + esc(when) + "</strong><br><span style=\"color:#667085\">" + esc(where) + "</span>"))
                .append(cell("vs " + esc(rival == null ? "A definir" : PdfService.pairName(rival))))
                .append("</tr>");
        }
        return """
            <div style="font-family:Arial,Helvetica,sans-serif;color:#101828;max-width:600px">
              <h2 style="color:#2556e8;margin:0 0 4px">%s</h2>
              <p>Hola %s, estos son tus partidos junto a %s:</p>
              <table style="border-collapse:collapse;width:100%%;font-size:14px">%s</table>
              <p style="color:#667085;font-size:13px">Adjuntamos la planilla completa del torneo en PDF. ¡Éxitos!</p>
            </div>
            """.formatted(esc(t.getName()), esc(player.getName()), esc(partnerOf(pair, player)),
                rows.isEmpty() ? "<tr><td>Todavía no hay partidos asignados.</td></tr>" : rows.toString());
    }

    private static String cell(String html) {
        return "<td style=\"padding:8px;border-bottom:1px solid #e4e7ec;vertical-align:top\">" + html + "</td>";
    }

    private static String partnerOf(Pair pair, Player player) {
        Player p = pair.getPlayer1().getId().equals(player.getId()) ? pair.getPlayer2() : pair.getPlayer1();
        return p.getName() + " " + p.getLastName();
    }

    private static String esc(String s) {
        return HtmlUtils.htmlEscape(s == null ? "" : s);
    }
}

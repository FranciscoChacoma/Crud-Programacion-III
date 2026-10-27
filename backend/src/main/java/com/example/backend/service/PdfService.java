package com.example.backend.service;

import com.example.backend.dto.BracketView;
import com.example.backend.dto.FixtureView;
import com.example.backend.dto.FixtureView.GroupView;
import com.example.backend.dto.FixtureView.MatchView;
import com.example.backend.dto.FixtureView.PairView;
import com.example.backend.dto.FixtureView.StandingRow;
import com.example.backend.model.Tournament;
import com.lowagie.text.Chunk;
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/** Planilla imprimible del torneo: grupos (posiciones y partidos) y, si ya existen, las llaves. */
@Service
@RequiredArgsConstructor
public class PdfService {

    private static final Color PRIMARY = new Color(37, 86, 232);
    private static final Color HEADER_BG = new Color(242, 244, 247);
    private static final Color BORDER = new Color(228, 231, 236);
    private static final Color MUTED = new Color(102, 112, 133);
    private static final Color QUALIFIED_BG = new Color(236, 253, 243);

    private static final Font TITLE = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20, new Color(16, 24, 40));
    private static final Font SUBTITLE = FontFactory.getFont(FontFactory.HELVETICA, 10, MUTED);
    private static final Font SECTION = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, PRIMARY);
    private static final Font GROUP = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, new Color(16, 24, 40));
    private static final Font TH = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, MUTED);
    private static final Font TD = FontFactory.getFont(FontFactory.HELVETICA, 9, new Color(16, 24, 40));
    private static final Font TD_BOLD = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, new Color(16, 24, 40));
    private static final Font TD_MUTED = FontFactory.getFont(FontFactory.HELVETICA, 8, MUTED);

    private final TournamentService tournamentService;
    private final FixtureService fixtureService;
    private final BracketService bracketService;

    public byte[] build(UUID tournamentId) {
        Tournament t = tournamentService.getEntity(tournamentId);
        FixtureView fixture = fixtureService.getFixture(tournamentId);
        if (fixture.groups().isEmpty()) {
            throw new RuntimeException("Todavía no se generó el fixture.");
        }
        BracketView bracket = bracketService.getBracket(tournamentId);

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.A4, 36, 36, 36, 36);
        PdfWriter.getInstance(doc, out);
        doc.open();

        doc.add(new Paragraph(t.getName(), TITLE));
        String venues = t.getVenues().stream().map(v -> v.getName()).sorted().collect(Collectors.joining(", "));
        String subtitle = "Categoría " + t.getCategory().name()
            + (fixture.date() != null ? "  ·  Fase de grupos: " + fixture.date() : "")
            + (venues.isEmpty() ? "" : "  ·  Sedes: " + venues);
        Paragraph sub = new Paragraph(subtitle, SUBTITLE);
        sub.setSpacingAfter(14);
        doc.add(sub);

        Paragraph section = new Paragraph("Fase de grupos", SECTION);
        section.setSpacingAfter(6);
        doc.add(section);

        for (GroupView g : fixture.groups()) {
            Paragraph title = new Paragraph("Grupo " + g.name(), GROUP);
            title.setSpacingBefore(10);
            title.setSpacingAfter(4);
            doc.add(title);
            doc.add(standingsTable(g.standings()));
            doc.add(matchesTable(g.matches(), false));
        }

        if (!fixture.unscheduled().isEmpty()) {
            Paragraph p = new Paragraph("Partidos sin horario asignado", GROUP);
            p.setSpacingBefore(12);
            p.setSpacingAfter(4);
            doc.add(p);
            doc.add(matchesTable(fixture.unscheduled(), true));
        }

        if (!bracket.rounds().isEmpty()) {
            doc.newPage();
            doc.add(new Paragraph("Llaves", SECTION));
            if (bracket.date() != null) doc.add(new Paragraph(bracket.date(), SUBTITLE));
            for (BracketView.Round round : bracket.rounds()) {
                Paragraph p = new Paragraph(round.name(), GROUP);
                p.setSpacingBefore(10);
                p.setSpacingAfter(4);
                doc.add(p);
                doc.add(matchesTable(round.matches(), false));
            }
            if (bracket.champion() != null) {
                Paragraph champ = new Paragraph("Campeones: " + pairName(bracket.champion()), SECTION);
                champ.setSpacingBefore(16);
                doc.add(champ);
            }
        }

        doc.close();
        return out.toByteArray();
    }

    private PdfPTable standingsTable(List<StandingRow> rows) {
        PdfPTable table = table(new float[]{0.5f, 6f, 0.8f, 0.8f, 0.8f, 1.3f, 1.5f});
        for (String h : List.of("#", "PAREJA", "PJ", "PG", "PP", "SETS", "GAMES")) table.addCell(th(h));
        for (StandingRow r : rows) {
            Color bg = r.qualified() ? QUALIFIED_BG : null;
            table.addCell(td(String.valueOf(r.position()), TD_BOLD, bg));
            table.addCell(td(pairName(r.pair()), TD, bg));
            table.addCell(td(String.valueOf(r.played()), TD, bg));
            table.addCell(td(String.valueOf(r.won()), TD_BOLD, bg));
            table.addCell(td(String.valueOf(r.lost()), TD, bg));
            table.addCell(td(r.setsWon() + "-" + r.setsLost(), TD, bg));
            table.addCell(td(r.gamesWon() + "-" + r.gamesLost(), TD, bg));
        }
        table.setSpacingAfter(6);
        return table;
    }

    private PdfPTable matchesTable(List<MatchView> matches, boolean withGroup) {
        PdfPTable table = table(new float[]{1f, 2.2f, 4.5f, 4.5f, 2.3f});
        for (String h : List.of("HORA", "CANCHA", withGroup ? "PAREJA 1 (GRUPO)" : "PAREJA 1", "PAREJA 2", "RESULTADO")) {
            table.addCell(th(h));
        }
        for (MatchView m : matches) {
            table.addCell(td(m.time() == null ? "A definir" : m.time(), TD_BOLD, null));
            Phrase court = new Phrase();
            court.add(new Chunk(m.courtName() == null ? "-" : m.courtName(), TD));
            if (m.venueName() != null) court.add(new Chunk("\n" + m.venueName(), TD_MUTED));
            table.addCell(cell(court, null));
            String p1 = m.pair1() == null ? "A definir" : pairName(m.pair1());
            table.addCell(td(withGroup && m.groupName() != null ? p1 + " (" + m.groupName() + ")" : p1,
                m.pair1() != null && m.pair1().id().equals(m.winnerId()) ? TD_BOLD : TD, null));
            table.addCell(td(m.pair2() == null ? "A definir" : pairName(m.pair2()),
                m.pair2() != null && m.pair2().id().equals(m.winnerId()) ? TD_BOLD : TD, null));
            String score = m.sets().isEmpty() ? "" : m.sets().stream()
                .map(s -> s.pair1() + "-" + s.pair2()).collect(Collectors.joining("  "));
            table.addCell(td(score, TD_BOLD, null));
        }
        table.setSpacingAfter(4);
        return table;
    }

    private static PdfPTable table(float[] widths) {
        PdfPTable table = new PdfPTable(widths);
        table.setWidthPercentage(100);
        table.setHeaderRows(1);
        table.setKeepTogether(true);
        return table;
    }

    private static PdfPCell th(String text) {
        PdfPCell c = cell(new Phrase(text, TH), HEADER_BG);
        c.setPaddingTop(5);
        c.setPaddingBottom(5);
        return c;
    }

    private static PdfPCell td(String text, Font font, Color bg) {
        return cell(new Phrase(text, font), bg);
    }

    private static PdfPCell cell(Phrase phrase, Color bg) {
        PdfPCell c = new PdfPCell(phrase);
        c.setBorderColor(BORDER);
        c.setPadding(5);
        c.setVerticalAlignment(Element.ALIGN_MIDDLE);
        if (bg != null) c.setBackgroundColor(bg);
        return c;
    }

    static String pairName(PairView p) {
        return p.player1() + " / " + p.player2();
    }
}

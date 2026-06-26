/*package ma.cite.service;

import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import ma.cite.model.*;
import ma.cite.repository.EvenementRepository;
import ma.cite.repository.InscriptionEvenementRepository;
import ma.cite.repository.ReservationRepository;
import ma.cite.repository.UtilisateurRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFFont;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.*;
import java.time.temporal.IsoFields;
import java.util.*;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatisticsService {

    private final ReservationRepository reservationRepo;
    private final EvenementRepository evenementRepo;
    private final InscriptionEvenementRepository inscriptionRepo;
    private final UtilisateurRepository utilisateurRepo;

    // =======================
    // EXISTANT: dashboard
    // =======================
    public Map<String, Object> getDashboardStats(LocalDateTime debut, LocalDateTime fin) {
        Map<String, Object> stats = new HashMap<>();

        long totalReservations = reservationRepo.countByPeriode(debut, fin);
        stats.put("totalReservations", totalReservations);
        stats.put("reservationsGratuites", true);

        long totalEvenements = evenementRepo.count();
        long evenementsPublies = evenementRepo.countByStatut(StatutPublication.PUBLIE);
        stats.put("totalEvenements", totalEvenements);
        stats.put("evenementsPublies", evenementsPublies);

        long inscriptionsEvenements = inscriptionRepo.countByDateInscriptionBetween(debut, fin);
        stats.put("inscriptionsEvenements", inscriptionsEvenements);
        stats.put("presencesCite", reservationRepo.countDemandeursActifs(debut, fin) + inscriptionsEvenements);

        List<Map<String, Object>> occupationLocaux = reservationRepo.findOccupationByLocalWithNames(debut, fin)
                .stream()
                .map(row -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("localId", row[0]);
                    m.put("localNom", row[1]);
                    m.put("localCode", row[2]);
                    m.put("count", row[3]);
                    return m;
                })
                .collect(Collectors.toList());
        stats.put("occupationLocaux", occupationLocaux);

        if (!occupationLocaux.isEmpty()) {
            stats.put("locauxPlusReserves", occupationLocaux.stream().limit(5).collect(Collectors.toList()));
            List<Map<String, Object>> reversed = occupationLocaux.stream()
                    .sorted((a, b) -> Long.compare(
                            ((Number) a.get("count")).longValue(),
                            ((Number) b.get("count")).longValue()))
                    .limit(5)
                    .collect(Collectors.toList());
            stats.put("locauxMoinsReserves", reversed);
        } else {
            stats.put("locauxPlusReserves", List.of());
            stats.put("locauxMoinsReserves", List.of());
        }

        List<Map<String, Object>> participationOrganismes = reservationRepo
                .findParticipationOrganismesReservations(debut, fin)
                .stream()
                .map(row -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("organisme", row[0]);
                    m.put("reservations", row[1]);
                    m.put("demandeursDistincts", row[2]);
                    return m;
                })
                .collect(Collectors.toList());
        stats.put("participationOrganismes", participationOrganismes);

        List<Map<String, Object>> typesEvenements = reservationRepo.countReservationsByTypeEvenement(debut, fin)
                .stream()
                .map(row -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("type", row[0] == null ? "AUTRE" : String.valueOf(row[0]));
                    m.put("count", row[1]);
                    return m;
                })
                .collect(Collectors.toList());

        stats.put("typesEvenements", typesEvenements);

        List<Map<String, Object>> presenceEvenements = inscriptionRepo.findParticipationByEtablissement(debut, fin)
                .stream()
                .map(row -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("etablissement", row[0]);
                    m.put("inscriptions", row[1]);
                    return m;
                })
                .collect(Collectors.toList());
        stats.put("presenceEvenements", presenceEvenements);

        List<String> partenaires = extractOrganismes(
                utilisateurRepo.findByTypeAndActifTrue(TypeUtilisateur.EXTERNE));
        stats.put("partenaires", partenaires);
        stats.put("nombrePartenaires", partenaires.size());

        List<String> organismesInternes = extractOrganismes(
                utilisateurRepo.findByTypeAndActifTrue(TypeUtilisateur.INTERNE));
        stats.put("organisationsInternes", organismesInternes);

        return stats;
    }

    private List<String> extractOrganismes(List<Utilisateur> users) {
        return users.stream()
                .filter(u -> u.getRole() == Role.DEMANDEUR)
                .map(u -> {
                    String org = u.getOrganisme();
                    if (org != null && !org.isBlank()) return org.trim();
                    return u.getEmail();
                })
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }

    // =======================
    // AJOUT: time series
    // =======================

    public Map<String, Object> getLocalTimeSeries(LocalDateTime debut, LocalDateTime fin, String granularity) {
        String g = normalizeGranularity(granularity);

        List<Object[]> rows = reservationRepo.findLocalReservationStarts(debut, fin);
        // row: [localId, localNom, localCode, dateDebut]

        record Key(Long id, String nom, String code, String period) {}
        Map<Key, Long> grouped = new HashMap<>();

        for (Object[] r : rows) {
            Long localId = (Long) r[0];
            String localNom = (String) r[1];
            String localCode = (String) r[2];
            LocalDateTime dt = (LocalDateTime) r[3];

            String period = toPeriod(dt.toLocalDate(), g);
            Key k = new Key(localId, localNom, localCode, period);
            grouped.merge(k, 1L, Long::sum);
        }

        List<Map<String, Object>> outRows = grouped.entrySet().stream()
                .sorted(Comparator
                        .comparing((Map.Entry<Key, Long> e) -> e.getKey().period())
                        .thenComparing(e -> -e.getValue()))
                .map(e -> {
                    Key k = e.getKey();
                    Map<String, Object> m = new HashMap<>();
                    m.put("localId", k.id());
                    m.put("localNom", k.nom());
                    m.put("localCode", k.code());
                    m.put("period", k.period());
                    m.put("count", e.getValue());
                    if ("WEEK_ISO".equals(g)) {
                        LocalDate start = isoWeekStart(k.period());
                        m.put("weekStart", start.toString());
                        m.put("weekEnd", start.plusDays(6).toString());
                    }
                    return m;
                })
                .toList();

        Map<String, Object> out = new HashMap<>();
        out.put("granularity", g);
        out.put("rows", outRows);
        return out;
    }

    public Map<String, Object> getOrganismeTimeSeries(LocalDateTime debut, LocalDateTime fin, String granularity) {
        String g = normalizeGranularity(granularity);

        List<Object[]> rows = reservationRepo.findOrganismeReservationStarts(debut, fin);
        // row: [organisme, dateDebut]

        record Key(String organisme, String period) {}
        Map<Key, Long> grouped = new HashMap<>();

        for (Object[] r : rows) {
            String org = (String) r[0];
            LocalDateTime dt = (LocalDateTime) r[1];
            String period = toPeriod(dt.toLocalDate(), g);

            Key k = new Key(org, period);
            grouped.merge(k, 1L, Long::sum);
        }

        List<Map<String, Object>> outRows = grouped.entrySet().stream()
                .sorted(Comparator
                        .comparing((Map.Entry<Key, Long> e) -> e.getKey().period())
                        .thenComparing(e -> -e.getValue()))
                .map(e -> {
                    Key k = e.getKey();
                    Map<String, Object> m = new HashMap<>();
                    m.put("organisme", k.organisme());
                    m.put("period", k.period());
                    m.put("count", e.getValue());
                    if ("WEEK_ISO".equals(g)) {
                        LocalDate start = isoWeekStart(k.period());
                        m.put("weekStart", start.toString());
                        m.put("weekEnd", start.plusDays(6).toString());
                    }
                    return m;
                })
                .toList();

        Map<String, Object> out = new HashMap<>();
        out.put("granularity", g);
        out.put("rows", outRows);
        return out;
    }

    private String normalizeGranularity(String g) {
        if (g == null) return "MONTH";
        String gg = g.trim().toUpperCase(Locale.ROOT);
        if (gg.equals("WEEK") || gg.equals("WEEK_ISO")) return "WEEK_ISO";
        return "MONTH";
    }

    private String toPeriod(LocalDate date, String granularity) {
        if ("WEEK_ISO".equals(granularity)) {
            int isoWeek = date.get(IsoFields.WEEK_OF_WEEK_BASED_YEAR);
            int isoYear = date.get(IsoFields.WEEK_BASED_YEAR);
            return String.format("%d-W%02d", isoYear, isoWeek);
        }
        // MONTH
        return String.format("%d-%02d", date.getYear(), date.getMonthValue());
    }

    private LocalDate isoWeekStart(String period) {
        // period "2026-W22"
        String[] parts = period.split("-W");
        int year = Integer.parseInt(parts[0]);
        int week = Integer.parseInt(parts[1]);

        // ISO week 1 is the week with Jan 4th
        return LocalDate.of(year, 1, 4)
                .with(IsoFields.WEEK_OF_WEEK_BASED_YEAR, week)
                .with(DayOfWeek.MONDAY);
    }

    // =======================
    // AJOUT: Export EXCEL
    // =======================
    public byte[] exportExcel(LocalDateTime debut, LocalDateTime fin, String granularity) {
        String g = normalizeGranularity(granularity);

        Map<String, Object> dashboard = getDashboardStats(debut, fin);
        Map<String, Object> localsTs = getLocalTimeSeries(debut, fin, g);
        Map<String, Object> orgTs = getOrganismeTimeSeries(debut, fin, g);

        try (XSSFWorkbook wb = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            CellStyle headerStyle = wb.createCellStyle();
            XSSFFont headerFont = wb.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);

            // Sheet 1: KPIs
            Sheet s1 = wb.createSheet("KPIs");
            int r = 0;
            r = writeRow(s1, r, headerStyle, "Période début", debut.toString());
            r = writeRow(s1, r, headerStyle, "Période fin", fin.toString());
            r++;
            r = writeRow(s1, r, headerStyle, "Total réservations", String.valueOf(dashboard.getOrDefault("totalReservations", 0)));
            r = writeRow(s1, r, headerStyle, "Total événements", String.valueOf(dashboard.getOrDefault("totalEvenements", 0)));
            r = writeRow(s1, r, headerStyle, "Événements publiés", String.valueOf(dashboard.getOrDefault("evenementsPublies", 0)));
            r = writeRow(s1, r, headerStyle, "Inscriptions événements", String.valueOf(dashboard.getOrDefault("inscriptionsEvenements", 0)));
            r = writeRow(s1, r, headerStyle, "Présences estimées", String.valueOf(dashboard.getOrDefault("presencesCite", 0)));
            autosize(s1, 2);

            // Sheet 2: Occupation locaux (global)
            Sheet s2 = wb.createSheet("OccupationLocaux");
            writeTable(s2, headerStyle,
                    List.of("localId", "localNom", "localCode", "count"),
                    (List<Map<String, Object>>) dashboard.getOrDefault("occupationLocaux", List.of()));
            autosize(s2, 4);

            // Sheet 3: Organismes (global)
            Sheet s3 = wb.createSheet("OrganismesReservations");
            writeTable(s3, headerStyle,
                    List.of("organisme", "reservations", "demandeursDistincts"),
                    (List<Map<String, Object>>) dashboard.getOrDefault("participationOrganismes", List.of()));
            autosize(s3, 3);

            // Sheet 4: Établissements (évènements)
            Sheet s4 = wb.createSheet("EtablissementsEvenements");
            writeTable(s4, headerStyle,
                    List.of("etablissement", "inscriptions"),
                    (List<Map<String, Object>>) dashboard.getOrDefault("presenceEvenements", List.of()));
            autosize(s4, 2);

            // Sheet 5: TimeSeries locaux
            Sheet s5 = wb.createSheet("TS_Locaux_" + g);
            writeTable(s5, headerStyle,
                    "WEEK_ISO".equals(g)
                            ? List.of("period", "weekStart", "weekEnd", "localId", "localCode", "localNom", "count")
                            : List.of("period", "localId", "localCode", "localNom", "count"),
                    (List<Map<String, Object>>) localsTs.getOrDefault("rows", List.of()));
            autosize(s5, 7);

            // Sheet 6: TimeSeries organismes
            Sheet s6 = wb.createSheet("TS_Organismes_" + g);
            writeTable(s6, headerStyle,
                    "WEEK_ISO".equals(g)
                            ? List.of("period", "weekStart", "weekEnd", "organisme", "count")
                            : List.of("period", "organisme", "count"),
                    (List<Map<String, Object>>) orgTs.getOrDefault("rows", List.of()));
            autosize(s6, 5);


            // Sheet 7: Détail Réservations (tableau style Excel)
            Sheet s7 = wb.createSheet("Reservations_Detail");
            List<Reservation> reportRows = reservationRepo.findForReport(debut, fin);

            List<String> cols = List.of(
                    "Horodateur", "Nom et prénom", "Adresse Email", "Numéro de Téléphone", "Organisme",
                    "Type d'événement", "Nombre participants",
                    "Date (début)", "Date (fin)",
                    "Salle souhaitée", "Code salle",
                    "Public reçu", "Equipement", "Mode de règlement"
            );

            int rr = 0;
            Row header = s7.createRow(rr++);
            for (int i = 0; i < cols.size(); i++) {
                Cell c = header.createCell(i);
                c.setCellValue(cols.get(i));
                c.setCellStyle(headerStyle);
            }

            for (Reservation res : reportRows) {
                Row row = s7.createRow(rr++);

                String nomPrenom = (res.getDemandeurNom() == null ? "" : res.getDemandeurNom())
                        + " " + (res.getDemandeurPrenom() == null ? "" : res.getDemandeurPrenom());
                nomPrenom = nomPrenom.trim();

                String equipements = (res.getEquipementsReserves() == null || res.getEquipementsReserves().isEmpty())
                        ? ""
                        : res.getEquipementsReserves().stream()
                        .map(e -> e.getNom()) // adapte si besoin
                        .filter(Objects::nonNull)
                        .distinct()
                        .collect(Collectors.joining(", "));

                row.createCell(0).setCellValue(res.getDateDemande() != null ? res.getDateDemande().toString() : "");
                row.createCell(1).setCellValue(nomPrenom);
                row.createCell(2).setCellValue(res.getDemandeurEmail() != null ? res.getDemandeurEmail() : "");
                row.createCell(3).setCellValue(res.getDemandeurTelephone() != null ? res.getDemandeurTelephone() : "");
                row.createCell(4).setCellValue(res.getDemandeurOrganisme() != null ? res.getDemandeurOrganisme() : "");
                row.createCell(5).setCellValue(res.getTypeEvenement() != null ? res.getTypeEvenement().name() : "AUTRE");
                row.createCell(6).setCellValue(res.getNombreParticipants() != null ? res.getNombreParticipants() : 0);
                row.createCell(7).setCellValue(res.getDateDebut() != null ? res.getDateDebut().toString() : "");
                row.createCell(8).setCellValue(res.getDateFin() != null ? res.getDateFin().toString() : "");
                row.createCell(9).setCellValue(res.getLocal() != null ? res.getLocal().getNom() : "");
                row.createCell(10).setCellValue(res.getLocal() != null ? res.getLocal().getCode() : "");
                row.createCell(11).setCellValue(res.getPublicRecu() != null ? res.getPublicRecu() : "");
                row.createCell(12).setCellValue(equipements);
                row.createCell(13).setCellValue(res.getModeReglement() != null ? res.getModeReglement() : "Gratuit");
            }

            autosize(s7, cols.size());


            wb.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Erreur export Excel", e);
        }
    }

    private int writeRow(Sheet s, int rowIndex, CellStyle headerStyle, String k, String v) {
        Row row = s.createRow(rowIndex);
        Cell c0 = row.createCell(0);
        c0.setCellValue(k);
        c0.setCellStyle(headerStyle);
        row.createCell(1).setCellValue(v);
        return rowIndex + 1;
    }

    private void writeTable(Sheet sheet, CellStyle headerStyle, List<String> columns, List<Map<String, Object>> rows) {
        int r = 0;
        Row header = sheet.createRow(r++);
        for (int i = 0; i < columns.size(); i++) {
            Cell c = header.createCell(i);
            c.setCellValue(columns.get(i));
            c.setCellStyle(headerStyle);
        }

        for (Map<String, Object> m : rows) {
            Row row = sheet.createRow(r++);
            for (int i = 0; i < columns.size(); i++) {
                Object val = m.get(columns.get(i));
                row.createCell(i).setCellValue(val == null ? "" : String.valueOf(val));
            }
        }
    }

    private void autosize(Sheet s, int cols) {
        for (int i = 0; i < cols; i++) s.autoSizeColumn(i);
    }

    // =======================
    // AJOUT: Export PDF
    // =======================
    public byte[] exportPdf(LocalDateTime debut, LocalDateTime fin, String granularity) {
        String g = normalizeGranularity(granularity);

        Map<String, Object> dashboard = getDashboardStats(debut, fin);
        Map<String, Object> localsTs = getLocalTimeSeries(debut, fin, g);
        Map<String, Object> orgTs = getOrganismeTimeSeries(debut, fin, g);

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document doc = new Document(PageSize.A4, 36, 36, 36, 36);
            PdfWriter.getInstance(doc, out);
            doc.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
            Font hFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);

            doc.add(new Paragraph("Rapport Statistiques - Cité d'Innovation UCA", titleFont));
            doc.add(new Paragraph("Période: " + debut + "  →  " + fin));
            doc.add(Chunk.NEWLINE);

            doc.add(new Paragraph("Indicateurs", hFont));
            PdfPTable kpiTable = new PdfPTable(2);
            kpiTable.setWidthPercentage(100);
            addCell(kpiTable, "Total réservations", true);
            addCell(kpiTable, String.valueOf(dashboard.getOrDefault("totalReservations", 0)), false);
            addCell(kpiTable, "Total événements", true);
            addCell(kpiTable, String.valueOf(dashboard.getOrDefault("totalEvenements", 0)), false);
            addCell(kpiTable, "Événements publiés", true);
            addCell(kpiTable, String.valueOf(dashboard.getOrDefault("evenementsPublies", 0)), false);
            addCell(kpiTable, "Inscriptions événements", true);
            addCell(kpiTable, String.valueOf(dashboard.getOrDefault("inscriptionsEvenements", 0)), false);
            addCell(kpiTable, "Présences estimées", true);
            addCell(kpiTable, String.valueOf(dashboard.getOrDefault("presencesCite", 0)), false);
            doc.add(kpiTable);
            doc.add(Chunk.NEWLINE);

            doc.add(new Paragraph("Occupation par local (global période)", hFont));
            doc.add(tableFromRows(
                    List.of("localCode", "localNom", "count"),
                    (List<Map<String, Object>>) dashboard.getOrDefault("occupationLocaux", List.of()),
                    15
            ));
            doc.add(Chunk.NEWLINE);

            doc.add(new Paragraph("Participation des organismes (réservations)", hFont));
            doc.add(tableFromRows(
                    List.of("organisme", "reservations", "demandeursDistincts"),
                    (List<Map<String, Object>>) dashboard.getOrDefault("participationOrganismes", List.of()),
                    15
            ));
            doc.add(Chunk.NEWLINE);

            List<Map<String, Object>> pe = (List<Map<String, Object>>) dashboard.getOrDefault("presenceEvenements", List.of());
            if (!pe.isEmpty()) {
                doc.add(new Paragraph("Présence aux événements (par établissement)", hFont));
                doc.add(tableFromRows(
                        List.of("etablissement", "inscriptions"),
                        pe,
                        15
                ));
                doc.add(Chunk.NEWLINE);
            }

            doc.add(new Paragraph("Série temporelle (Locaux) - " + g, hFont));
            doc.add(tableFromRows(
                    "WEEK_ISO".equals(g)
                            ? List.of("period", "weekStart", "weekEnd", "localCode", "count")
                            : List.of("period", "localCode", "count"),
                    (List<Map<String, Object>>) localsTs.getOrDefault("rows", List.of()),
                    20
            ));
            doc.add(Chunk.NEWLINE);

            doc.add(new Paragraph("Série temporelle (Organismes) - " + g, hFont));
            doc.add(tableFromRows(
                    "WEEK_ISO".equals(g)
                            ? List.of("period", "weekStart", "weekEnd", "organisme", "count")
                            : List.of("period", "organisme", "count"),
                    (List<Map<String, Object>>) orgTs.getOrDefault("rows", List.of()),
                    20
            ));

            doc.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Erreur export PDF", e);
        }
    }

    private void addCell(PdfPTable t, String text, boolean header) {
        Font f = header
                ? FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10)
                : FontFactory.getFont(FontFactory.HELVETICA, 10);
        PdfPCell cell = new PdfPCell(new Phrase(text == null ? "" : text, f));
        cell.setPadding(6f);
        if (header) cell.setBackgroundColor(new java.awt.Color(240, 240, 240));
        t.addCell(cell);
    }

    private PdfPTable tableFromRows(List<String> cols, List<Map<String, Object>> rows, int limit) {
        PdfPTable t = new PdfPTable(cols.size());
        t.setWidthPercentage(100);

        for (String c : cols) addCell(t, c, true);

        int count = 0;
        for (Map<String, Object> m : rows) {
            if (count++ >= limit) break;
            for (String c : cols) addCell(t, String.valueOf(m.getOrDefault(c, "")), false);
        }
        return t;
    }
}*/

package ma.cite.service;

import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import ma.cite.model.*;
import ma.cite.repository.EvenementRepository;
import ma.cite.repository.InscriptionEvenementRepository;
import ma.cite.repository.ReservationRepository;
import ma.cite.repository.UtilisateurRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFColor;
import org.apache.poi.xssf.usermodel.XSSFFont;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.time.temporal.IsoFields;
import java.util.*;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatisticsService {

    private final ReservationRepository reservationRepo;
    private final EvenementRepository evenementRepo;
    private final InscriptionEvenementRepository inscriptionRepo;
    private final UtilisateurRepository utilisateurRepo;

    private static final DateTimeFormatter DATE_FR = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter TIME_FR = DateTimeFormatter.ofPattern("HH:mm");
    private static final DateTimeFormatter DATETIME_FR = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    // Couleurs pour PDF et Excel
    private static final Color CORAIL = new Color(224, 122, 95);
    private static final Color CORAIL_LIGHT = new Color(254, 244, 241);
    private static final Color MENTHE = new Color(91, 191, 160);
    private static final Color MENTHE_LIGHT = new Color(232, 245, 239);
    private static final Color LAVANDE = new Color(155, 142, 196);
    private static final Color LAVANDE_LIGHT = new Color(245, 243, 250);
    private static final Color AMBRE = new Color(233, 184, 106);
    private static final Color AMBRE_LIGHT = new Color(254, 248, 230);
    private static final Color STONE_900 = new Color(28, 25, 23);
    private static final Color STONE_600 = new Color(87, 83, 78);
    private static final Color STONE_200 = new Color(231, 229, 228);

    // =======================
    // EXISTANT: dashboard
    // =======================
    public Map<String, Object> getDashboardStats(LocalDateTime debut, LocalDateTime fin) {
        Map<String, Object> stats = new HashMap<>();

        long totalReservations = reservationRepo.countByPeriode(debut, fin);
        stats.put("totalReservations", totalReservations);
        stats.put("reservationsGratuites", true);

        long totalEvenements = evenementRepo.count();
        long evenementsPublies = evenementRepo.countByStatut(StatutPublication.PUBLIE);
        stats.put("totalEvenements", totalEvenements);
        stats.put("evenementsPublies", evenementsPublies);

        long inscriptionsEvenements = inscriptionRepo.countByDateInscriptionBetween(debut, fin);
        stats.put("inscriptionsEvenements", inscriptionsEvenements);
        stats.put("presencesCite", reservationRepo.countDemandeursActifs(debut, fin) + inscriptionsEvenements);

        List<Map<String, Object>> occupationLocaux = reservationRepo.findOccupationByLocalWithNames(debut, fin)
                .stream()
                .map(row -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("localId", row[0]);
                    m.put("localNom", row[1]);
                    m.put("localCode", row[2]);
                    m.put("count", row[3]);
                    return m;
                })
                .collect(Collectors.toList());
        stats.put("occupationLocaux", occupationLocaux);

        if (!occupationLocaux.isEmpty()) {
            stats.put("locauxPlusReserves", occupationLocaux.stream().limit(5).collect(Collectors.toList()));
            List<Map<String, Object>> reversed = occupationLocaux.stream()
                    .sorted((a, b) -> Long.compare(
                            ((Number) a.get("count")).longValue(),
                            ((Number) b.get("count")).longValue()))
                    .limit(5)
                    .collect(Collectors.toList());
            stats.put("locauxMoinsReserves", reversed);
        } else {
            stats.put("locauxPlusReserves", List.of());
            stats.put("locauxMoinsReserves", List.of());
        }

        List<Map<String, Object>> participationOrganismes = reservationRepo
                .findParticipationOrganismesReservations(debut, fin)
                .stream()
                .map(row -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("organisme", row[0]);
                    m.put("reservations", row[1]);
                    m.put("demandeursDistincts", row[2]);
                    return m;
                })
                .collect(Collectors.toList());
        stats.put("participationOrganismes", participationOrganismes);

        List<Map<String, Object>> typesEvenements = reservationRepo.countReservationsByTypeEvenement(debut, fin)
                .stream()
                .map(row -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("type", row[0] == null ? "AUTRE" : String.valueOf(row[0]));
                    m.put("count", row[1]);
                    return m;
                })
                .collect(Collectors.toList());

        stats.put("typesEvenements", typesEvenements);

        List<Map<String, Object>> presenceEvenements = inscriptionRepo.findParticipationByEtablissement(debut, fin)
                .stream()
                .map(row -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("etablissement", row[0]);
                    m.put("inscriptions", row[1]);
                    return m;
                })
                .collect(Collectors.toList());
        stats.put("presenceEvenements", presenceEvenements);

        List<String> partenaires = extractOrganismes(
                utilisateurRepo.findByTypeAndActifTrue(TypeUtilisateur.EXTERNE));
        stats.put("partenaires", partenaires);
        stats.put("nombrePartenaires", partenaires.size());

        List<String> organismesInternes = extractOrganismes(
                utilisateurRepo.findByTypeAndActifTrue(TypeUtilisateur.INTERNE));
        stats.put("organisationsInternes", organismesInternes);

        return stats;
    }

    private List<String> extractOrganismes(List<Utilisateur> users) {
        return users.stream()
                .filter(u -> u.getRole() == Role.DEMANDEUR)
                .map(u -> {
                    String org = u.getOrganisme();
                    if (org != null && !org.isBlank()) return org.trim();
                    return u.getEmail();
                })
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }

    // =======================
    // TIME SERIES
    // =======================
    public Map<String, Object> getLocalTimeSeries(LocalDateTime debut, LocalDateTime fin, String granularity) {
        String g = normalizeGranularity(granularity);

        List<Object[]> rows = reservationRepo.findLocalReservationStarts(debut, fin);

        record Key(Long id, String nom, String code, String period) {}
        Map<Key, Long> grouped = new HashMap<>();

        for (Object[] r : rows) {
            Long localId = (Long) r[0];
            String localNom = (String) r[1];
            String localCode = (String) r[2];
            LocalDateTime dt = (LocalDateTime) r[3];

            String period = toPeriod(dt.toLocalDate(), g);
            Key k = new Key(localId, localNom, localCode, period);
            grouped.merge(k, 1L, Long::sum);
        }

        List<Map<String, Object>> outRows = grouped.entrySet().stream()
                .sorted(Comparator
                        .comparing((Map.Entry<Key, Long> e) -> e.getKey().period())
                        .thenComparing(e -> -e.getValue()))
                .map(e -> {
                    Key k = e.getKey();
                    Map<String, Object> m = new HashMap<>();
                    m.put("localId", k.id());
                    m.put("localNom", k.nom());
                    m.put("localCode", k.code());
                    m.put("period", k.period());
                    m.put("count", e.getValue());
                    if ("WEEK_ISO".equals(g)) {
                        LocalDate start = isoWeekStart(k.period());
                        m.put("weekStart", start.toString());
                        m.put("weekEnd", start.plusDays(6).toString());
                    }
                    return m;
                })
                .toList();

        Map<String, Object> out = new HashMap<>();
        out.put("granularity", g);
        out.put("rows", outRows);
        return out;
    }

    public Map<String, Object> getOrganismeTimeSeries(LocalDateTime debut, LocalDateTime fin, String granularity) {
        String g = normalizeGranularity(granularity);

        List<Object[]> rows = reservationRepo.findOrganismeReservationStarts(debut, fin);

        record Key(String organisme, String period) {}
        Map<Key, Long> grouped = new HashMap<>();

        for (Object[] r : rows) {
            String org = (String) r[0];
            LocalDateTime dt = (LocalDateTime) r[1];
            String period = toPeriod(dt.toLocalDate(), g);

            Key k = new Key(org, period);
            grouped.merge(k, 1L, Long::sum);
        }

        List<Map<String, Object>> outRows = grouped.entrySet().stream()
                .sorted(Comparator
                        .comparing((Map.Entry<Key, Long> e) -> e.getKey().period())
                        .thenComparing(e -> -e.getValue()))
                .map(e -> {
                    Key k = e.getKey();
                    Map<String, Object> m = new HashMap<>();
                    m.put("organisme", k.organisme());
                    m.put("period", k.period());
                    m.put("count", e.getValue());
                    if ("WEEK_ISO".equals(g)) {
                        LocalDate start = isoWeekStart(k.period());
                        m.put("weekStart", start.toString());
                        m.put("weekEnd", start.plusDays(6).toString());
                    }
                    return m;
                })
                .toList();

        Map<String, Object> out = new HashMap<>();
        out.put("granularity", g);
        out.put("rows", outRows);
        return out;
    }

    private String normalizeGranularity(String g) {
        if (g == null) return "MONTH";
        String gg = g.trim().toUpperCase(Locale.ROOT);
        if (gg.equals("WEEK") || gg.equals("WEEK_ISO")) return "WEEK_ISO";
        return "MONTH";
    }

    private String toPeriod(LocalDate date, String granularity) {
        if ("WEEK_ISO".equals(granularity)) {
            int isoWeek = date.get(IsoFields.WEEK_OF_WEEK_BASED_YEAR);
            int isoYear = date.get(IsoFields.WEEK_BASED_YEAR);
            return String.format("%d-W%02d", isoYear, isoWeek);
        }
        return String.format("%d-%02d", date.getYear(), date.getMonthValue());
    }

    private LocalDate isoWeekStart(String period) {
        String[] parts = period.split("-W");
        int year = Integer.parseInt(parts[0]);
        int week = Integer.parseInt(parts[1]);

        return LocalDate.of(year, 1, 4)
                .with(IsoFields.WEEK_OF_WEEK_BASED_YEAR, week)
                .with(DayOfWeek.MONDAY);
    }

    // ═══════════════════════════════════════════════
    //  EXPORT EXCEL — STYLE GOOGLE FORMS PROFESSIONNEL
    // ═══════════════════════════════════════════════
    public byte[] exportExcel(LocalDateTime debut, LocalDateTime fin, String granularity) {
        String g = normalizeGranularity(granularity);

        Map<String, Object> dashboard = getDashboardStats(debut, fin);
        Map<String, Object> localsTs = getLocalTimeSeries(debut, fin, g);
        Map<String, Object> orgTs = getOrganismeTimeSeries(debut, fin, g);

        try (XSSFWorkbook wb = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            // ─── STYLES ───
            CellStyle headerStyle = createHeaderStyle(wb, CORAIL);
            CellStyle subHeaderStyle = createHeaderStyle(wb, MENTHE);
            CellStyle dataStyle = createDataStyle(wb, false);
            CellStyle dataStyleAlt = createDataStyle(wb, true);
            CellStyle titleStyle = createTitleStyle(wb);
            CellStyle labelStyle = createLabelStyle(wb);
            CellStyle valueStyle = createValueStyle(wb);

            // ═══════════════════════════════════════
            // SHEET 1 : TABLEAU DÉTAILLÉ DES RÉSERVATIONS
            // (Style Google Forms - LE PLUS IMPORTANT)
            // ═══════════════════════════════════════
            Sheet sheetDetail = wb.createSheet("Réservations détaillées");
            sheetDetail.setDisplayGridlines(false);

            List<Reservation> reportRows = reservationRepo.findForReport(debut, fin);

            // Titre de la feuille
            Row titleRow = sheetDetail.createRow(0);
            titleRow.setHeightInPoints(28);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("RÉSERVATIONS DE LA CITÉ D'INNOVATION UCA");
            titleCell.setCellStyle(titleStyle);
            sheetDetail.addMergedRegion(new CellRangeAddress(0, 0, 0, 18));

            Row periodRow = sheetDetail.createRow(1);
            periodRow.setHeightInPoints(20);
            Cell periodCell = periodRow.createCell(0);
            periodCell.setCellValue("Période : " + debut.format(DATETIME_FR) + "  →  " + fin.format(DATETIME_FR)
                    + "    |    Total : " + reportRows.size() + " réservation(s)");
            CellStyle periodStyle = wb.createCellStyle();
            XSSFFont periodFont = wb.createFont();
            periodFont.setFontHeightInPoints((short) 11);
            periodFont.setColor(new XSSFColor(STONE_600, null));
            periodFont.setItalic(true);
            periodStyle.setFont(periodFont);
            periodStyle.setAlignment(HorizontalAlignment.CENTER);
            periodCell.setCellStyle(periodStyle);
            sheetDetail.addMergedRegion(new CellRangeAddress(1, 1, 0, 18));

            // En-tête des colonnes Google Forms
            String[] cols = {
                    "Horodateur",                                  // A
                    "Nom et prénom",                               // B
                    "Adresse Email",                               // C
                    "Numéro de Téléphone",                         // D
                    "Organisme",                                   // E
                    "Type d'événement",                            // F
                    "Nombre de participants",                      // G
                    "Date de l'événement",                         // H
                    "Créneau de l'événement",                      // I
                    "Horaire de début de l'activité",              // J
                    "Horaire de fin de l'activité",                // K
                    "Salle souhaitée",                             // L
                    "Public Reçu",                                 // M
                    "Équipement",                                  // N
                    "Mode de règlement",                           // O
                    "Confirmation de réservation",                 // P
                    "Programme / Affiche",                         // Q
                    "Logo de l'Organisme",                         // R
                    "Statut"                                       // S
            };

            Row headerRow = sheetDetail.createRow(3);
            headerRow.setHeightInPoints(38);
            for (int i = 0; i < cols.length; i++) {
                Cell c = headerRow.createCell(i);
                c.setCellValue(cols[i]);
                c.setCellStyle(headerStyle);
            }

            // Données
            int rr = 4;
            for (Reservation res : reportRows) {
                Row row = sheetDetail.createRow(rr);
                row.setHeightInPoints(22);
                CellStyle currentStyle = (rr % 2 == 0) ? dataStyleAlt : dataStyle;

                String nomPrenom = ((res.getDemandeurNom() == null ? "" : res.getDemandeurNom())
                        + " " + (res.getDemandeurPrenom() == null ? "" : res.getDemandeurPrenom())).trim();

                String equipements = "";
                if (res.getEquipementsReserves() != null && !res.getEquipementsReserves().isEmpty()) {
                    equipements = res.getEquipementsReserves().stream()
                            .map(Equipement::getNom)
                            .filter(Objects::nonNull)
                            .distinct()
                            .collect(Collectors.joining(", "));
                }

                String dateEvent = res.getDateDebut() != null ? res.getDateDebut().format(DATE_FR) : "";
                String horaireDebut = res.getDateDebut() != null ? res.getDateDebut().format(TIME_FR) : "";
                String horaireFin = res.getDateFin() != null ? res.getDateFin().format(TIME_FR) : "";
                String creneau = "";
                if (res.getDateDebut() != null && res.getDateFin() != null) {
                    int h = res.getDateDebut().getHour();
                    if (h < 12) creneau = "Matin";
                    else if (h < 17) creneau = "Après-midi";
                    else creneau = "Soir";
                }

                String confirmation = "Non confirmée";
                if (res.getStatut() != null) {
                    switch (res.getStatut()) {
                        case VALIDEE: case CONFIRMEE: confirmation = "Confirmée"; break;
                        case REJETEE: confirmation = "Rejetée : " + (res.getMotifRejet() != null ? res.getMotifRejet() : ""); break;
                        case ANNULEE: confirmation = "Annulée"; break;
                        case EN_ATTENTE: confirmation = "En attente"; break;
                        case TERMINEE: confirmation = "Terminée"; break;
                        case ARCHIVEE: confirmation = "Archivée"; break;
                    }
                }

                // Extraction du programme/affiche et logo depuis le motif (réservations publiques)
                String programmeUrl = extractFromMotif(res.getMotif(), "Fichier", "Lien");
                String logoUrl = extractFromMotif(res.getMotif(), "Logo organisme");

                setCellWithStyle(row, 0, res.getDateDemande() != null ? res.getDateDemande().format(DATETIME_FR) : "", currentStyle);
                setCellWithStyle(row, 1, nomPrenom, currentStyle);
                setCellWithStyle(row, 2, nullSafe(res.getDemandeurEmail()), currentStyle);
                setCellWithStyle(row, 3, nullSafe(res.getDemandeurTelephone()), currentStyle);
                setCellWithStyle(row, 4, nullSafe(res.getDemandeurOrganisme()), currentStyle);
                setCellWithStyle(row, 5, res.getTypeEvenement() != null ? typeEvenementLabel(res.getTypeEvenement()) : "Autre", currentStyle);
                setCellWithStyle(row, 6, res.getNombreParticipants() != null ? String.valueOf(res.getNombreParticipants()) : "", currentStyle);
                setCellWithStyle(row, 7, dateEvent, currentStyle);
                setCellWithStyle(row, 8, creneau, currentStyle);
                setCellWithStyle(row, 9, horaireDebut, currentStyle);
                setCellWithStyle(row, 10, horaireFin, currentStyle);
                setCellWithStyle(row, 11, res.getLocal() != null ? res.getLocal().getNom() + " (" + res.getLocal().getCode() + ")" : "", currentStyle);
                setCellWithStyle(row, 12, nullSafe(res.getPublicRecu()), currentStyle);
                setCellWithStyle(row, 13, equipements, currentStyle);
                setCellWithStyle(row, 14, res.getModeReglement() != null ? res.getModeReglement() : "Gratuit", currentStyle);
                setCellWithStyle(row, 15, confirmation, currentStyle);
                setCellWithStyle(row, 16, programmeUrl, currentStyle);
                setCellWithStyle(row, 17, logoUrl, currentStyle);
                setCellWithStyle(row, 18, res.getStatut() != null ? res.getStatut().name() : "", currentStyle);

                rr++;
            }

            // Largeurs des colonnes optimisées
            int[] widths = {
                    18, 22, 28, 16, 20, 16, 12, 14, 14, 12, 12, 28, 18, 28, 16, 22, 28, 28, 14
            };
            for (int i = 0; i < widths.length; i++) {
                sheetDetail.setColumnWidth(i, widths[i] * 256);
            }

            // Freeze pane (geler la ligne d'en-tête)
            sheetDetail.createFreezePane(0, 4);

            // Filtre automatique
            sheetDetail.setAutoFilter(new CellRangeAddress(3, rr - 1, 0, cols.length - 1));

            // ═══════════════════════════════════════
            // SHEET 2 : KPIs (Indicateurs clés)
            // ═══════════════════════════════════════
            Sheet sKpi = wb.createSheet("Indicateurs clés");
            sKpi.setDisplayGridlines(false);

            Row kpiTitle = sKpi.createRow(0);
            kpiTitle.setHeightInPoints(28);
            Cell kpiTitleCell = kpiTitle.createCell(0);
            kpiTitleCell.setCellValue("INDICATEURS CLÉS DE PERFORMANCE");
            kpiTitleCell.setCellStyle(titleStyle);
            sKpi.addMergedRegion(new CellRangeAddress(0, 0, 0, 1));

            int rk = 2;
            rk = writeKpiRow(sKpi, rk, labelStyle, valueStyle, "Période début", debut.format(DATETIME_FR));
            rk = writeKpiRow(sKpi, rk, labelStyle, valueStyle, "Période fin", fin.format(DATETIME_FR));
            rk++;
            rk = writeKpiRow(sKpi, rk, labelStyle, valueStyle, "Total réservations", String.valueOf(dashboard.getOrDefault("totalReservations", 0)));
            rk = writeKpiRow(sKpi, rk, labelStyle, valueStyle, "Total événements", String.valueOf(dashboard.getOrDefault("totalEvenements", 0)));
            rk = writeKpiRow(sKpi, rk, labelStyle, valueStyle, "Événements publiés", String.valueOf(dashboard.getOrDefault("evenementsPublies", 0)));
            rk = writeKpiRow(sKpi, rk, labelStyle, valueStyle, "Inscriptions événements", String.valueOf(dashboard.getOrDefault("inscriptionsEvenements", 0)));
            rk = writeKpiRow(sKpi, rk, labelStyle, valueStyle, "Présences estimées", String.valueOf(dashboard.getOrDefault("presencesCite", 0)));
            sKpi.setColumnWidth(0, 30 * 256);
            sKpi.setColumnWidth(1, 30 * 256);

            // ═══════════════════════════════════════
            // SHEET 3 : Occupation Locaux
            // ═══════════════════════════════════════
            Sheet sLoc = wb.createSheet("Occupation locaux");
            sLoc.setDisplayGridlines(false);
            writeStyledTable(sLoc, titleStyle, headerStyle, dataStyle, dataStyleAlt,
                    "OCCUPATION DES LOCAUX",
                    List.of("ID Local", "Nom du local", "Code", "Nombre de réservations"),
                    List.of("localId", "localNom", "localCode", "count"),
                    (List<Map<String, Object>>) dashboard.getOrDefault("occupationLocaux", List.of()));

            // ═══════════════════════════════════════
            // SHEET 4 : Organismes
            // ═══════════════════════════════════════
            Sheet sOrg = wb.createSheet("Organismes");
            sOrg.setDisplayGridlines(false);
            writeStyledTable(sOrg, titleStyle, headerStyle, dataStyle, dataStyleAlt,
                    "PARTICIPATION DES ORGANISMES",
                    List.of("Organisme", "Nombre de réservations", "Demandeurs distincts"),
                    List.of("organisme", "reservations", "demandeursDistincts"),
                    (List<Map<String, Object>>) dashboard.getOrDefault("participationOrganismes", List.of()));

            // ═══════════════════════════════════════
            // SHEET 5 : Types d'événements
            // ═══════════════════════════════════════
            Sheet sTypes = wb.createSheet("Types événements");
            sTypes.setDisplayGridlines(false);
            writeStyledTable(sTypes, titleStyle, headerStyle, dataStyle, dataStyleAlt,
                    "RÉPARTITION DES TYPES D'ÉVÉNEMENTS",
                    List.of("Type", "Nombre"),
                    List.of("type", "count"),
                    (List<Map<String, Object>>) dashboard.getOrDefault("typesEvenements", List.of()));

            // ═══════════════════════════════════════
            // SHEET 6 : Établissements
            // ═══════════════════════════════════════
            List<Map<String, Object>> presenceEvts = (List<Map<String, Object>>) dashboard.getOrDefault("presenceEvenements", List.of());
            if (!presenceEvts.isEmpty()) {
                Sheet sEtab = wb.createSheet("Établissements");
                sEtab.setDisplayGridlines(false);
                writeStyledTable(sEtab, titleStyle, headerStyle, dataStyle, dataStyleAlt,
                        "PRÉSENCE AUX ÉVÉNEMENTS PAR ÉTABLISSEMENT",
                        List.of("Établissement", "Inscriptions"),
                        List.of("etablissement", "inscriptions"),
                        presenceEvts);
            }

            // ═══════════════════════════════════════
            // SHEET 7 : TimeSeries locaux
            // ═══════════════════════════════════════
            Sheet sTsLoc = wb.createSheet("Évolution locaux");
            sTsLoc.setDisplayGridlines(false);
            List<String> colsTsLoc = "WEEK_ISO".equals(g)
                    ? List.of("period", "weekStart", "weekEnd", "localId", "localCode", "localNom", "count")
                    : List.of("period", "localId", "localCode", "localNom", "count");
            List<String> labelsTsLoc = "WEEK_ISO".equals(g)
                    ? List.of("Semaine", "Début semaine", "Fin semaine", "ID Local", "Code", "Nom du local", "Réservations")
                    : List.of("Mois", "ID Local", "Code", "Nom du local", "Réservations");
            writeStyledTable(sTsLoc, titleStyle, headerStyle, dataStyle, dataStyleAlt,
                    "ÉVOLUTION DES RÉSERVATIONS PAR LOCAL (" + g + ")",
                    labelsTsLoc, colsTsLoc,
                    (List<Map<String, Object>>) localsTs.getOrDefault("rows", List.of()));

            // ═══════════════════════════════════════
            // SHEET 8 : TimeSeries organismes
            // ═══════════════════════════════════════
            Sheet sTsOrg = wb.createSheet("Évolution organismes");
            sTsOrg.setDisplayGridlines(false);
            List<String> colsTsOrg = "WEEK_ISO".equals(g)
                    ? List.of("period", "weekStart", "weekEnd", "organisme", "count")
                    : List.of("period", "organisme", "count");
            List<String> labelsTsOrg = "WEEK_ISO".equals(g)
                    ? List.of("Semaine", "Début semaine", "Fin semaine", "Organisme", "Réservations")
                    : List.of("Mois", "Organisme", "Réservations");
            writeStyledTable(sTsOrg, titleStyle, headerStyle, dataStyle, dataStyleAlt,
                    "ÉVOLUTION DES RÉSERVATIONS PAR ORGANISME (" + g + ")",
                    labelsTsOrg, colsTsOrg,
                    (List<Map<String, Object>>) orgTs.getOrDefault("rows", List.of()));

            // Réordonner les onglets : Détaillé en premier
            wb.setSheetOrder("Réservations détaillées", 0);
            wb.setActiveSheet(0);

            wb.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Erreur export Excel", e);
        }
    }

    // ─── HELPERS EXCEL ───

    private String typeEvenementLabel(TypeEvenement t) {
        if (t == null) return "Autre";
        switch (t) {
            case REUNION: return "Réunion";
            case FORMATION: return "Formation";
            case CONFERENCE: return "Conférence";
            default: return "Autre";
        }
    }

    private String nullSafe(String s) {
        return s == null ? "" : s;
    }

    private String extractFromMotif(String motif, String... keys) {
        if (motif == null) return "";
        String[] lines = motif.split("\n");
        for (String line : lines) {
            for (String key : keys) {
                if (line.toLowerCase().startsWith(key.toLowerCase() + ":")) {
                    return line.substring(key.length() + 1).trim();
                }
            }
        }
        return "";
    }

    private CellStyle createHeaderStyle(Workbook wb, Color bgColor) {
        CellStyle style = wb.createCellStyle();
        XSSFFont font = ((XSSFWorkbook) wb).createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 11);
        font.setColor(new XSSFColor(Color.WHITE, null));
        style.setFont(font);
        ((org.apache.poi.xssf.usermodel.XSSFCellStyle) style).setFillForegroundColor(new XSSFColor(bgColor, null));
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setWrapText(true);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        return style;
    }

    private CellStyle createDataStyle(Workbook wb, boolean alt) {
        CellStyle style = wb.createCellStyle();
        XSSFFont font = ((XSSFWorkbook) wb).createFont();
        font.setFontHeightInPoints((short) 10);
        font.setColor(new XSSFColor(STONE_900, null));
        style.setFont(font);
        if (alt) {
            ((org.apache.poi.xssf.usermodel.XSSFCellStyle) style).setFillForegroundColor(new XSSFColor(new Color(250, 246, 242), null));
            style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        }
        style.setAlignment(HorizontalAlignment.LEFT);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setWrapText(true);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);

        return style;
    }

    private CellStyle createTitleStyle(Workbook wb) {
        CellStyle style = wb.createCellStyle();
        XSSFFont font = ((XSSFWorkbook) wb).createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 16);
        font.setColor(new XSSFColor(CORAIL, null));
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        return style;
    }

    private CellStyle createLabelStyle(Workbook wb) {
        CellStyle style = wb.createCellStyle();
        XSSFFont font = ((XSSFWorkbook) wb).createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 11);
        font.setColor(new XSSFColor(STONE_600, null));
        style.setFont(font);
        ((org.apache.poi.xssf.usermodel.XSSFCellStyle) style).setFillForegroundColor(new XSSFColor(new Color(245, 245, 244), null));
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        return style;
    }

    private CellStyle createValueStyle(Workbook wb) {
        CellStyle style = wb.createCellStyle();
        XSSFFont font = ((XSSFWorkbook) wb).createFont();
        font.setFontHeightInPoints((short) 11);
        font.setColor(new XSSFColor(STONE_900, null));
        style.setFont(font);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        return style;
    }

    private void setCellWithStyle(Row row, int col, String value, CellStyle style) {
        Cell c = row.createCell(col);
        c.setCellValue(value);
        c.setCellStyle(style);
    }

    private int writeKpiRow(Sheet s, int rowIndex, CellStyle labelStyle, CellStyle valueStyle, String k, String v) {
        Row row = s.createRow(rowIndex);
        row.setHeightInPoints(22);
        Cell c0 = row.createCell(0);
        c0.setCellValue(k);
        c0.setCellStyle(labelStyle);
        Cell c1 = row.createCell(1);
        c1.setCellValue(v);
        c1.setCellStyle(valueStyle);
        return rowIndex + 1;
    }

    private void writeStyledTable(Sheet sheet, CellStyle titleStyle, CellStyle headerStyle,
                                  CellStyle dataStyle, CellStyle dataStyleAlt,
                                  String title, List<String> labels, List<String> columns,
                                  List<Map<String, Object>> rows) {
        // Titre
        Row titleRow = sheet.createRow(0);
        titleRow.setHeightInPoints(28);
        Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue(title);
        titleCell.setCellStyle(titleStyle);
        sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, Math.max(0, columns.size() - 1)));

        int r = 2;
        // Header
        Row header = sheet.createRow(r++);
        header.setHeightInPoints(32);
        for (int i = 0; i < labels.size(); i++) {
            Cell c = header.createCell(i);
            c.setCellValue(labels.get(i));
            c.setCellStyle(headerStyle);
        }

        // Data
        int rowIdx = 0;
        for (Map<String, Object> m : rows) {
            Row row = sheet.createRow(r++);
            row.setHeightInPoints(20);
            CellStyle st = (rowIdx % 2 == 0) ? dataStyleAlt : dataStyle;
            for (int i = 0; i < columns.size(); i++) {
                Object val = m.get(columns.get(i));
                Cell c = row.createCell(i);
                c.setCellValue(val == null ? "" : String.valueOf(val));
                c.setCellStyle(st);
            }
            rowIdx++;
        }

        for (int i = 0; i < columns.size(); i++) {
            sheet.setColumnWidth(i, 22 * 256);
        }

        // Freeze + filter
        sheet.createFreezePane(0, 3);
        if (r > 3) {
            sheet.setAutoFilter(new CellRangeAddress(2, r - 1, 0, columns.size() - 1));
        }
    }

    // ═══════════════════════════════════════════════
    //  EXPORT PDF — STYLE PROFESSIONNEL DÉTAILLÉ
    // ═══════════════════════════════════════════════
    public byte[] exportPdf(LocalDateTime debut, LocalDateTime fin, String granularity) {
        String g = normalizeGranularity(granularity);

        Map<String, Object> dashboard = getDashboardStats(debut, fin);
        Map<String, Object> localsTs = getLocalTimeSeries(debut, fin, g);
        Map<String, Object> orgTs = getOrganismeTimeSeries(debut, fin, g);
        List<Reservation> reportRows = reservationRepo.findForReport(debut, fin);

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document doc = new Document(PageSize.A4.rotate(), 30, 30, 40, 40);
            PdfWriter.getInstance(doc, out);
            doc.open();

            // ─── Polices ───
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, CORAIL);
            Font subtitleFont = FontFactory.getFont(FontFactory.HELVETICA, 11, STONE_600);
            Font sectionFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, Color.WHITE);
            Font kpiLabelFont = FontFactory.getFont(FontFactory.HELVETICA, 10, STONE_600);
            Font kpiValueFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, CORAIL);
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.WHITE);
            Font cellFont = FontFactory.getFont(FontFactory.HELVETICA, 9, STONE_900);
            Font footerFont = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 8, STONE_600);

            // ═══════════════════════════════════════
            // PAGE 1 : COUVERTURE + KPIs
            // ═══════════════════════════════════════
            // Titre principal
            Paragraph p1 = new Paragraph("Rapport Statistiques", titleFont);
            p1.setAlignment(Element.ALIGN_CENTER);
            doc.add(p1);

            Paragraph p2 = new Paragraph("Cité d'Innovation — Université Cadi Ayyad", subtitleFont);
            p2.setAlignment(Element.ALIGN_CENTER);
            p2.setSpacingAfter(15f);
            doc.add(p2);

            // Bandeau période
            PdfPTable periodBand = new PdfPTable(1);
            periodBand.setWidthPercentage(100);
            PdfPCell periodCell = new PdfPCell(new Phrase(
                    "Période : " + debut.format(DATETIME_FR) + "   →   " + fin.format(DATETIME_FR),
                    FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, Color.WHITE)
            ));
            periodCell.setBackgroundColor(CORAIL);
            periodCell.setPadding(10f);
            periodCell.setBorder(0);
            periodCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            periodBand.addCell(periodCell);
            doc.add(periodBand);

            doc.add(Chunk.NEWLINE);

            // Section KPIs
            addSectionTitle(doc, "Indicateurs Clés de Performance", sectionFont, CORAIL);

            PdfPTable kpiGrid = new PdfPTable(5);
            kpiGrid.setWidthPercentage(100);
            kpiGrid.setSpacingBefore(8f);

            addKpiCard(kpiGrid, "Réservations", String.valueOf(dashboard.getOrDefault("totalReservations", 0)), CORAIL, kpiLabelFont, kpiValueFont);
            addKpiCard(kpiGrid, "Événements", String.valueOf(dashboard.getOrDefault("totalEvenements", 0)), LAVANDE, kpiLabelFont, kpiValueFont);
            addKpiCard(kpiGrid, "Publiés", String.valueOf(dashboard.getOrDefault("evenementsPublies", 0)), MENTHE, kpiLabelFont, kpiValueFont);
            addKpiCard(kpiGrid, "Inscriptions", String.valueOf(dashboard.getOrDefault("inscriptionsEvenements", 0)), AMBRE, kpiLabelFont, kpiValueFont);
            addKpiCard(kpiGrid, "Présences", String.valueOf(dashboard.getOrDefault("presencesCite", 0)), CORAIL, kpiLabelFont, kpiValueFont);

            doc.add(kpiGrid);
            doc.add(Chunk.NEWLINE);

            // ─── Occupation locaux ───
            addSectionTitle(doc, "Occupation des Locaux", sectionFont, MENTHE);
            doc.add(buildStyledTable(
                    List.of("Code", "Nom du local", "Nombre de réservations"),
                    List.of("localCode", "localNom", "count"),
                    (List<Map<String, Object>>) dashboard.getOrDefault("occupationLocaux", List.of()),
                    headerFont, cellFont, MENTHE, 30
            ));
            doc.add(Chunk.NEWLINE);

            // ─── Participation organismes ───
            addSectionTitle(doc, "Participation des Organismes", sectionFont, LAVANDE);
            doc.add(buildStyledTable(
                    List.of("Organisme", "Réservations", "Demandeurs distincts"),
                    List.of("organisme", "reservations", "demandeursDistincts"),
                    (List<Map<String, Object>>) dashboard.getOrDefault("participationOrganismes", List.of()),
                    headerFont, cellFont, LAVANDE, 30
            ));
            doc.add(Chunk.NEWLINE);

            // ─── Types d'événements ───
            List<Map<String, Object>> typesEvt = (List<Map<String, Object>>) dashboard.getOrDefault("typesEvenements", List.of());
            if (!typesEvt.isEmpty()) {
                addSectionTitle(doc, "Répartition par Type d'Événement", sectionFont, AMBRE);
                doc.add(buildStyledTable(
                        List.of("Type", "Nombre"),
                        List.of("type", "count"),
                        typesEvt,
                        headerFont, cellFont, AMBRE, 10
                ));
                doc.add(Chunk.NEWLINE);
            }

            // ─── Présence événements ───
            List<Map<String, Object>> pe = (List<Map<String, Object>>) dashboard.getOrDefault("presenceEvenements", List.of());
            if (!pe.isEmpty()) {
                addSectionTitle(doc, "Présence aux Événements (par établissement)", sectionFont, MENTHE);
                doc.add(buildStyledTable(
                        List.of("Établissement", "Inscriptions"),
                        List.of("etablissement", "inscriptions"),
                        pe,
                        headerFont, cellFont, MENTHE, 20
                ));
                doc.add(Chunk.NEWLINE);
            }

            // ─── Évolution temporelle ───
            addSectionTitle(doc, "Évolution des Réservations par Local (" + g + ")", sectionFont, CORAIL);
            doc.add(buildStyledTable(
                    "WEEK_ISO".equals(g)
                            ? List.of("Période", "Début", "Fin", "Code", "Local", "Nombre")
                            : List.of("Période", "Code", "Local", "Nombre"),
                    "WEEK_ISO".equals(g)
                            ? List.of("period", "weekStart", "weekEnd", "localCode", "localNom", "count")
                            : List.of("period", "localCode", "localNom", "count"),
                    (List<Map<String, Object>>) localsTs.getOrDefault("rows", List.of()),
                    headerFont, cellFont, CORAIL, 25
            ));
            doc.add(Chunk.NEWLINE);

            addSectionTitle(doc, "Évolution des Réservations par Organisme (" + g + ")", sectionFont, LAVANDE);
            doc.add(buildStyledTable(
                    "WEEK_ISO".equals(g)
                            ? List.of("Période", "Début", "Fin", "Organisme", "Nombre")
                            : List.of("Période", "Organisme", "Nombre"),
                    "WEEK_ISO".equals(g)
                            ? List.of("period", "weekStart", "weekEnd", "organisme", "count")
                            : List.of("period", "organisme", "count"),
                    (List<Map<String, Object>>) orgTs.getOrDefault("rows", List.of()),
                    headerFont, cellFont, LAVANDE, 25
            ));

            // ═══════════════════════════════════════
            // PAGE 2+ : DÉTAIL COMPLET DES RÉSERVATIONS
            // ═══════════════════════════════════════
            if (!reportRows.isEmpty()) {
                doc.newPage();

                Paragraph titleDetail = new Paragraph("Détail des Réservations", titleFont);
                titleDetail.setAlignment(Element.ALIGN_CENTER);
                doc.add(titleDetail);

                Paragraph subDetail = new Paragraph(reportRows.size() + " réservation(s) — " + debut.format(DATE_FR) + " au " + fin.format(DATE_FR), subtitleFont);
                subDetail.setAlignment(Element.ALIGN_CENTER);
                subDetail.setSpacingAfter(15f);
                doc.add(subDetail);

                // Tableau détaillé condensé
                List<String> headersDetail = List.of(
                        "Date", "Nom", "Organisme", "Type", "Local",
                        "Participants", "Statut"
                );
                PdfPTable detailTable = new PdfPTable(headersDetail.size());
                detailTable.setWidthPercentage(100);
                try {
                    detailTable.setWidths(new float[]{2.2f, 2.5f, 2.5f, 1.5f, 2.5f, 1.5f, 1.8f});
                } catch (Exception ignore) {}

                // Header
                for (String h : headersDetail) {
                    PdfPCell c = new PdfPCell(new Phrase(h, headerFont));
                    c.setBackgroundColor(CORAIL);
                    c.setPadding(8f);
                    c.setBorderColor(Color.WHITE);
                    c.setHorizontalAlignment(Element.ALIGN_CENTER);
                    detailTable.addCell(c);
                }

                // Lignes
                boolean alt = false;
                for (Reservation res : reportRows) {
                    String nomPrenom = ((res.getDemandeurNom() == null ? "" : res.getDemandeurNom())
                            + " " + (res.getDemandeurPrenom() == null ? "" : res.getDemandeurPrenom())).trim();
                    String dateStr = res.getDateDebut() != null ? res.getDateDebut().format(DATETIME_FR) : "";
                    String type = res.getTypeEvenement() != null ? typeEvenementLabel(res.getTypeEvenement()) : "Autre";
                    String local = res.getLocal() != null ? res.getLocal().getNom() : "";
                    String parts = res.getNombreParticipants() != null ? String.valueOf(res.getNombreParticipants()) : "—";
                    String statut = res.getStatut() != null ? res.getStatut().name() : "";

                    Color bgRow = alt ? new Color(250, 246, 242) : Color.WHITE;
                    addDetailCell(detailTable, dateStr, cellFont, bgRow);
                    addDetailCell(detailTable, nomPrenom, cellFont, bgRow);
                    addDetailCell(detailTable, nullSafe(res.getDemandeurOrganisme()), cellFont, bgRow);
                    addDetailCell(detailTable, type, cellFont, bgRow);
                    addDetailCell(detailTable, local, cellFont, bgRow);
                    addDetailCell(detailTable, parts, cellFont, bgRow);
                    addDetailCell(detailTable, statut, cellFont, bgRow);
                    alt = !alt;
                }
                doc.add(detailTable);
            }

            // ─── Footer ───
            doc.add(Chunk.NEWLINE);
            Paragraph footer = new Paragraph(
                    "Rapport généré le " + LocalDateTime.now().format(DATETIME_FR) +
                            " — Cité d'Innovation UCA — Confidentiel",
                    footerFont
            );
            footer.setAlignment(Element.ALIGN_CENTER);
            doc.add(footer);

            doc.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Erreur export PDF", e);
        }
    }

    // ─── HELPERS PDF ───

    private void addSectionTitle(Document doc, String text, Font sectionFont, Color bg) throws DocumentException {
        PdfPTable t = new PdfPTable(1);
        t.setWidthPercentage(100);
        t.setSpacingBefore(10f);
        t.setSpacingAfter(2f);
        PdfPCell c = new PdfPCell(new Phrase(text, sectionFont));
        c.setBackgroundColor(bg);
        c.setPadding(8f);
        c.setBorder(0);
        c.setHorizontalAlignment(Element.ALIGN_LEFT);
        t.addCell(c);
        doc.add(t);
    }

    private void addKpiCard(PdfPTable grid, String label, String value, Color accent, Font labelFont, Font valueFont) {
        PdfPCell card = new PdfPCell();
        card.setPadding(12f);
        card.setBorderColor(accent);
        card.setBorderWidth(1.5f);
        card.setHorizontalAlignment(Element.ALIGN_CENTER);

        Paragraph labelP = new Paragraph(label.toUpperCase(), labelFont);
        labelP.setAlignment(Element.ALIGN_CENTER);
        card.addElement(labelP);

        Font valueColored = new Font(valueFont);
        valueColored.setColor(accent);
        Paragraph valueP = new Paragraph(value, valueColored);
        valueP.setAlignment(Element.ALIGN_CENTER);
        card.addElement(valueP);

        grid.addCell(card);
    }

    private PdfPTable buildStyledTable(List<String> headers, List<String> keys,
                                       List<Map<String, Object>> rows,
                                       Font headerFont, Font cellFont,
                                       Color headerBg, int limit) {
        PdfPTable t = new PdfPTable(headers.size());
        t.setWidthPercentage(100);

        // Headers
        for (String h : headers) {
            PdfPCell c = new PdfPCell(new Phrase(h, headerFont));
            c.setBackgroundColor(headerBg);
            c.setPadding(7f);
            c.setBorderColor(Color.WHITE);
            c.setHorizontalAlignment(Element.ALIGN_CENTER);
            t.addCell(c);
        }

        // Lignes
        boolean alt = false;
        int count = 0;
        if (rows.isEmpty()) {
            PdfPCell empty = new PdfPCell(new Phrase("Aucune donnée", FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 9, STONE_600)));
            empty.setColspan(headers.size());
            empty.setPadding(15f);
            empty.setHorizontalAlignment(Element.ALIGN_CENTER);
            t.addCell(empty);
            return t;
        }

        for (Map<String, Object> m : rows) {
            if (count++ >= limit) {
                PdfPCell more = new PdfPCell(new Phrase("… et " + (rows.size() - limit) + " autre(s) ligne(s)",
                        FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 8, STONE_600)));
                more.setColspan(headers.size());
                more.setPadding(8f);
                more.setHorizontalAlignment(Element.ALIGN_CENTER);
                more.setBackgroundColor(new Color(250, 250, 250));
                t.addCell(more);
                break;
            }
            Color bg = alt ? new Color(250, 246, 242) : Color.WHITE;
            for (String key : keys) {
                Object val = m.getOrDefault(key, "");
                PdfPCell c = new PdfPCell(new Phrase(val == null ? "" : String.valueOf(val), cellFont));
                c.setPadding(6f);
                c.setBackgroundColor(bg);
                c.setBorderColor(STONE_200);
                t.addCell(c);
            }
            alt = !alt;
        }
        return t;
    }

    private void addDetailCell(PdfPTable t, String text, Font font, Color bg) {
        PdfPCell c = new PdfPCell(new Phrase(text == null ? "" : text, font));
        c.setPadding(6f);
        c.setBackgroundColor(bg);
        c.setBorderColor(STONE_200);
        t.addCell(c);
    }
}
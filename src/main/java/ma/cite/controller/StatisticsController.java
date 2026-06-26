package ma.cite.controller;

import lombok.RequiredArgsConstructor;
import ma.cite.service.StatisticsService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
public class StatisticsController {

    private final StatisticsService statisticsService;

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN_RES')")
    public ResponseEntity<Map<String, Object>> getDashboardStats(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime debut,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fin) {
        return ResponseEntity.ok(statisticsService.getDashboardStats(debut, fin));
    }

    // ============================
    // AJOUT: time series locaux
    // ============================
    @GetMapping("/locals/timeseries")
    @PreAuthorize("hasRole('ADMIN_RES')")
    public ResponseEntity<Map<String, Object>> getLocalTimeSeries(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime debut,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fin,
            @RequestParam(defaultValue = "MONTH") String granularity
    ) {
        return ResponseEntity.ok(statisticsService.getLocalTimeSeries(debut, fin, granularity));
    }

    // ================================
    // AJOUT: time series organismes
    // ================================
    @GetMapping("/organismes/timeseries")
    @PreAuthorize("hasRole('ADMIN_RES')")
    public ResponseEntity<Map<String, Object>> getOrganismeTimeSeries(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime debut,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fin,
            @RequestParam(defaultValue = "MONTH") String granularity
    ) {
        return ResponseEntity.ok(statisticsService.getOrganismeTimeSeries(debut, fin, granularity));
    }

    // ============================
    // AJOUT: export EXCEL
    // ============================
    @GetMapping("/export/excel")
    @PreAuthorize("hasRole('ADMIN_RES')")
    public ResponseEntity<byte[]> exportExcel(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime debut,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fin,
            @RequestParam(defaultValue = "MONTH") String granularity
    ) {
        byte[] data = statisticsService.exportExcel(debut, fin, granularity);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        headers.setContentDisposition(ContentDisposition.attachment()
                .filename("rapport-stats.xlsx")
                .build());

        return new ResponseEntity<>(data, headers, HttpStatus.OK);
    }

    // ============================
    // AJOUT: export PDF
    // ============================
    @GetMapping("/export/pdf")
    @PreAuthorize("hasRole('ADMIN_RES')")
    public ResponseEntity<byte[]> exportPdf(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime debut,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fin,
            @RequestParam(defaultValue = "MONTH") String granularity
    ) {
        byte[] data = statisticsService.exportPdf(debut, fin, granularity);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDisposition(ContentDisposition.attachment()
                .filename("rapport-stats.pdf")
                .build());

        return new ResponseEntity<>(data, headers, HttpStatus.OK);
    }
}
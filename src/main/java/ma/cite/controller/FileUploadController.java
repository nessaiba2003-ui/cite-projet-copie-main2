package ma.cite.controller;

import lombok.RequiredArgsConstructor;
import ma.cite.service.FileStorageService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
public class FileUploadController {

    private final FileStorageService fileStorageService;

    @PostMapping("/local")
    @PreAuthorize("hasRole('ADMIN_RES')")
    public ResponseEntity<Map<String, String>> uploadLocalImage(@RequestParam("file") MultipartFile file) {
        String url = fileStorageService.store(file, "locaux");
        return ResponseEntity.ok(Map.of("url", url));
    }

    @PostMapping("/local-video")
    @PreAuthorize("hasRole('ADMIN_RES')")
    public ResponseEntity<Map<String, String>> uploadLocalVideo(@RequestParam("file") MultipartFile file) {
        String url = fileStorageService.store(file, "locaux_videos");
        return ResponseEntity.ok(Map.of("url", url));
    }

    @PostMapping("/evenement")
    @PreAuthorize("hasRole('ADMIN_EVT')")
    public ResponseEntity<Map<String, String>> uploadEvenementImage(@RequestParam("file") MultipartFile file) {
        String url = fileStorageService.store(file, "evenements");
        return ResponseEntity.ok(Map.of("url", url));
    }

    @PostMapping("/annonce")
    @PreAuthorize("hasRole('ADMIN_EVT')")
    public ResponseEntity<Map<String, String>> uploadAnnonceImage(@RequestParam("file") MultipartFile file) {
        String url = fileStorageService.store(file, "annonces");
        return ResponseEntity.ok(Map.of("url", url));
    }
}

package ma.cite.controller;

import lombok.RequiredArgsConstructor;
import ma.cite.exception.BusinessException;
import ma.cite.service.FileStorageService;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/public/uploads")
@RequiredArgsConstructor
public class PublicUploadController {

    private final FileStorageService fileStorageService;

    @PostMapping
    public ResponseEntity<Map<String, String>> upload(@RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("Fichier vide");
        }

        String ct = file.getContentType();
        boolean ok = ct != null && (ct.startsWith("image/") || ct.equalsIgnoreCase("application/pdf"));
        if (!ok) {
            throw new BusinessException("Format non autorisé (image ou PDF uniquement)");
        }

        String original = StringUtils.hasText(file.getOriginalFilename()) ? file.getOriginalFilename() : "fichier";
        String url = fileStorageService.store(file, "reservations");

        return ResponseEntity.ok(Map.of("url", url, "filename", original));
    }
}
package ma.cite.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.cite.dto.AnnonceRequest;
import ma.cite.dto.AnnonceResponse;
import ma.cite.security.CustomUserDetails;
import ma.cite.service.AnnonceService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/annonces")
@RequiredArgsConstructor
public class AnnonceController {

    private final AnnonceService annonceService;

    // Public
    @GetMapping
    public ResponseEntity<Page<AnnonceResponse>> getPublishedAnnonces(Pageable pageable) {
        return ResponseEntity.ok(annonceService.findAllPublished(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AnnonceResponse> getAnnonceById(@PathVariable Long id) {
        return ResponseEntity.ok(annonceService.findById(id));
    }

    // Admin
    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN_EVT')")
    public ResponseEntity<Page<AnnonceResponse>> getAllAnnonces(Pageable pageable) {
        return ResponseEntity.ok(annonceService.findAll(pageable));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN_EVT')")
    public ResponseEntity<AnnonceResponse> createAnnonce(
            @Valid @RequestBody AnnonceRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(annonceService.create(request, userDetails.getUtilisateur()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN_EVT')")
    public ResponseEntity<AnnonceResponse> updateAnnonce(
            @PathVariable Long id,
            @Valid @RequestBody AnnonceRequest request) {
        return ResponseEntity.ok(annonceService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN_EVT')")
    public ResponseEntity<Void> deleteAnnonce(@PathVariable Long id) {
        annonceService.delete(id);
        return ResponseEntity.ok().build();
    }
}

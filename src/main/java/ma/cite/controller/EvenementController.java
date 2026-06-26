package ma.cite.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.cite.dto.EvenementRequest;
import ma.cite.dto.EvenementResponse;
import ma.cite.dto.InscriptionRequest;
import ma.cite.dto.InscriptionResponse;
import ma.cite.security.CustomUserDetails;
import ma.cite.service.EvenementService;
import ma.cite.service.InscriptionEvenementService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/evenements")
@RequiredArgsConstructor
public class EvenementController {

    private final EvenementService evenementService;
    private final InscriptionEvenementService inscriptionService;

    // Public
    @GetMapping
    public ResponseEntity<Page<EvenementResponse>> getPublishedEvenements(Pageable pageable) {
        return ResponseEntity.ok(evenementService.findAllPublished(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EvenementResponse> getEvenementById(@PathVariable Long id) {
        return ResponseEntity.ok(evenementService.findById(id));
    }

    @PostMapping("/{id}/inscrire")
    public ResponseEntity<InscriptionResponse> inscrire(@PathVariable Long id, @Valid @RequestBody InscriptionRequest request) {
        request.setEvenementId(id);
        return ResponseEntity.ok(inscriptionService.inscrireSansCompte(request));
    }

    // Admin
    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN_EVT')")
    public ResponseEntity<Page<EvenementResponse>> getAllEvenements(Pageable pageable) {
        return ResponseEntity.ok(evenementService.findAll(pageable));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN_EVT')")
    public ResponseEntity<EvenementResponse> createEvenement(
            @Valid @RequestBody EvenementRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(evenementService.create(request, userDetails.getUtilisateur()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN_EVT')")
    public ResponseEntity<EvenementResponse> updateEvenement(
            @PathVariable Long id,
            @Valid @RequestBody EvenementRequest request) {
        return ResponseEntity.ok(evenementService.update(id, request));
    }

    @PutMapping("/{id}/restaurer")
    @PreAuthorize("hasAnyRole('ADMIN_EVT')")
    public ResponseEntity<EvenementResponse> restaurerEvenement(@PathVariable Long id) {
        return ResponseEntity.ok(evenementService.restaurer(id));
    }


    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN_EVT')")
    public ResponseEntity<Void> deleteEvenement(@PathVariable Long id) {
        evenementService.delete(id);  // Archive au lieu de supprimer
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/publier")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN_EVT')")
    public ResponseEntity<EvenementResponse> publishEvenement(@PathVariable Long id) {
        return ResponseEntity.ok(evenementService.publish(id));
    }

    @PutMapping("/{id}/archiver")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN_EVT')")
    public ResponseEntity<EvenementResponse> archiveEvenement(@PathVariable Long id) {
        return ResponseEntity.ok(evenementService.archive(id));
    }

    @GetMapping("/{id}/inscrits")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN_EVT')")
    public ResponseEntity<List<InscriptionResponse>> getInscrits(@PathVariable Long id) {
        return ResponseEntity.ok(inscriptionService.getInscrits(id));
    }
}

package ma.cite.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.cite.dto.CreneauOccupeResponse;
import ma.cite.dto.LocalFilterRequest;
import ma.cite.dto.LocalRequest;
import ma.cite.dto.LocalResponse;
import ma.cite.model.Utilisateur;
import ma.cite.security.CustomUserDetails;
import ma.cite.service.LocalService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/locaux")
@RequiredArgsConstructor
public class LocalController {

    private final LocalService localService;

    // Public : locaux disponibles uniquement
    @GetMapping("/disponibles")
    public ResponseEntity<List<LocalResponse>> getLocauxDisponibles() {
        return ResponseEntity.ok(localService.findAllPublic());
    }

    // Authentifié (Admin) : locaux selon droits
    @GetMapping
    public ResponseEntity<List<LocalResponse>> getAllLocaux(@AuthenticationPrincipal CustomUserDetails userDetails) {
        Utilisateur user = userDetails != null ? userDetails.getUtilisateur() : null;
        if (user == null) {
             return ResponseEntity.ok(localService.findAllPublic());
        }
        return ResponseEntity.ok(localService.findAllForUser(user));
    }

    @GetMapping("/search")
    public ResponseEntity<List<LocalResponse>> searchLocaux(
            LocalFilterRequest filter,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Utilisateur user = userDetails != null ? userDetails.getUtilisateur() : null;
        return ResponseEntity.ok(localService.search(filter, user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<LocalResponse> getLocalById(@PathVariable Long id, @AuthenticationPrincipal CustomUserDetails userDetails) {
        Utilisateur user = userDetails != null ? userDetails.getUtilisateur() : null;
        return ResponseEntity.ok(localService.findById(id, user));
    }

    @GetMapping("/{id}/disponibilite")
    public ResponseEntity<Boolean> checkDisponibilite(
            @PathVariable Long id,
            @RequestParam LocalDateTime debut,
            @RequestParam LocalDateTime fin) {
        return ResponseEntity.ok(localService.checkDisponibilite(id, debut, fin));
    }

    @GetMapping("/{id}/calendrier")
    public ResponseEntity<List<CreneauOccupeResponse>> getCalendrier(
            @PathVariable Long id,
            @RequestParam LocalDateTime debut,
            @RequestParam LocalDateTime fin) {
        return ResponseEntity.ok(localService.getCalendrierOccupation(id, debut, fin));
    }

    // Admin
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN_RES')")
    @PostMapping
    public ResponseEntity<LocalResponse> createLocal(@Valid @RequestBody LocalRequest request) {
        return ResponseEntity.ok(localService.create(request));
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN_RES')")
    @PutMapping("/{id}")
    public ResponseEntity<LocalResponse> updateLocal(@PathVariable Long id, @Valid @RequestBody LocalRequest request) {
        return ResponseEntity.ok(localService.update(id, request));
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN_RES')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLocal(@PathVariable Long id) {
        localService.delete(id);
        return ResponseEntity.ok().build();
    }
}

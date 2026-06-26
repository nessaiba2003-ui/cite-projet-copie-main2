/*package ma.cite.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.cite.dto.AdminReservationRequest;
import ma.cite.dto.ReservationResponse;
import ma.cite.security.CustomUserDetails;
import ma.cite.service.ReservationService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN_RES')")
public class ReservationController {

    private final ReservationService reservationService;

    @GetMapping
    public ResponseEntity<Page<ReservationResponse>> getAllReservations(Pageable pageable) {
        return ResponseEntity.ok(reservationService.getAll(pageable));
    }

    @PutMapping("/{id}/valider")
    public ResponseEntity<ReservationResponse> validerReservation(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(reservationService.validate(id, userDetails.getUtilisateur()));
    }

    @PutMapping("/{id}/rejeter")
    public ResponseEntity<ReservationResponse> rejeterReservation(
            @PathVariable Long id,
            @RequestParam String motif,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(reservationService.reject(id, motif, userDetails.getUtilisateur()));
    }

    @PostMapping("/admin")
    public ResponseEntity<ReservationResponse> createByAdmin(
            @Valid @RequestBody AdminReservationRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(reservationService.createByAdmin(request, userDetails.getUtilisateur()));
    }

    @PutMapping("/{id}/annuler-admin")
    public ResponseEntity<ReservationResponse> annulerByAdmin(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(reservationService.cancelByAdmin(id, userDetails.getUtilisateur()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReservation(@PathVariable Long id) {
        reservationService.deleteByAdmin(id);
        return ResponseEntity.noContent().build();
    }
}*/

package ma.cite.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.cite.dto.AdminReservationRequest;
import ma.cite.dto.ReservationResponse;
import ma.cite.security.CustomUserDetails;
import ma.cite.service.ReservationService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN_RES')")
public class ReservationController {

    private final ReservationService reservationService;

    @GetMapping
    public ResponseEntity<Page<ReservationResponse>> getAllReservations(Pageable pageable) {
        return ResponseEntity.ok(reservationService.getAll(pageable));
    }

    @PutMapping("/{id}/valider")
    public ResponseEntity<ReservationResponse> validerReservation(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(reservationService.validate(id, userDetails.getUtilisateur()));
    }

    @PutMapping("/{id}/rejeter")
    public ResponseEntity<ReservationResponse> rejeterReservation(
            @PathVariable Long id,
            @RequestParam String motif,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(reservationService.reject(id, motif, userDetails.getUtilisateur()));
    }

    @PostMapping("/admin")
    public ResponseEntity<ReservationResponse> createByAdmin(
            @Valid @RequestBody AdminReservationRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(reservationService.createByAdmin(request, userDetails.getUtilisateur()));
    }

    @PutMapping("/{id}/annuler-admin")
    public ResponseEntity<ReservationResponse> annulerByAdmin(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(reservationService.cancelByAdmin(id, userDetails.getUtilisateur()));
    }

    // ✅ NOUVEAU : Archiver au lieu de supprimer
    @PutMapping("/{id}/archiver")
    public ResponseEntity<ReservationResponse> archiverReservation(@PathVariable Long id) {
        return ResponseEntity.ok(reservationService.archiver(id));
    }

    // ✅ NOUVEAU : Restaurer une réservation archivée
    @PutMapping("/{id}/restaurer")
    public ResponseEntity<ReservationResponse> restaurerReservation(@PathVariable Long id) {
        return ResponseEntity.ok(reservationService.restaurer(id));
    }

    @PutMapping("/{id}/restaurer-apres-annulation")
    public ResponseEntity<ReservationResponse> restaurerApresAnnulation(@PathVariable Long id) {
        return ResponseEntity.ok(reservationService.restaurerApresAnnulation(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ReservationResponse> updateReservation(
            @PathVariable Long id,
            @Valid @RequestBody AdminReservationRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(reservationService.update(id, request, userDetails.getUtilisateur()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReservation(@PathVariable Long id) {
        reservationService.deleteByAdmin(id);
        return ResponseEntity.noContent().build();
    }
}
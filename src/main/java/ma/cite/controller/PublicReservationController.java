package ma.cite.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.cite.dto.PublicReservationRequest;
import ma.cite.dto.ReservationResponse;
import ma.cite.service.ReservationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public/reservations")
@RequiredArgsConstructor
public class PublicReservationController {

    private final ReservationService reservationService;

    @PostMapping
    public ResponseEntity<ReservationResponse> createPublic(@Valid @RequestBody PublicReservationRequest request) {
        return ResponseEntity.ok(reservationService.createPublic(request));
    }
}

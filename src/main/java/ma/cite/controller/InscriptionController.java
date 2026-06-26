package ma.cite.controller;

import lombok.RequiredArgsConstructor;
import ma.cite.dto.InscriptionRequest;
import ma.cite.dto.InscriptionResponse;
import ma.cite.service.InscriptionEvenementService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inscriptions")
@RequiredArgsConstructor
public class InscriptionController {

    private final InscriptionEvenementService inscriptionService;

    @PostMapping("/public/events/sinscrire")
    public ResponseEntity<InscriptionResponse> create(@RequestBody InscriptionRequest dto) {
        return ResponseEntity.ok(inscriptionService.inscrireSansCompte(dto));
    }

    @GetMapping("/admin/events/{eventId}")
    public ResponseEntity<List<InscriptionResponse>> listByEvent(@PathVariable Long eventId) {
        return ResponseEntity.ok(inscriptionService.getInscrits(eventId));
    }

    @PatchMapping("/admin/validate")
    public ResponseEntity<Void> validate(@RequestParam String token) {
        inscriptionService.confirmerInscription(token);
        return ResponseEntity.ok().build();
    }
}

package ma.cite.controller;

import lombok.RequiredArgsConstructor;
import ma.cite.dto.InscriptionRequest;
import ma.cite.dto.InscriptionResponse;
import ma.cite.service.InscriptionEvenementService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicController {

    private final InscriptionEvenementService inscriptionService;

    @PostMapping("/inscription-evenement")
    public ResponseEntity<InscriptionResponse> sinscrire(@RequestBody InscriptionRequest dto) {
        return ResponseEntity.ok(inscriptionService.inscrireSansCompte(dto));
    }

    @GetMapping("/inscriptions/confirm/{token}")
    public ResponseEntity<InscriptionResponse> confirmer(@PathVariable String token) {
        return ResponseEntity.ok(inscriptionService.confirmerInscription(token));
    }
}

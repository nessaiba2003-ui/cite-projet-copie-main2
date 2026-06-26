package ma.cite.controller;

import lombok.RequiredArgsConstructor;
import ma.cite.dto.UtilisateurDTO;
import ma.cite.service.UtilisateurService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN_RES')")
public class UtilisateurController {

    private final UtilisateurService utilisateurService;

    @GetMapping
    public ResponseEntity<List<UtilisateurDTO>> list() {
        return ResponseEntity.ok(utilisateurService.findAll());
    }

    @PatchMapping("/{id}/actif")
    public ResponseEntity<UtilisateurDTO> toggleActif(@PathVariable Long id, @RequestParam boolean actif) {
        return ResponseEntity.ok(utilisateurService.setActif(id, actif));
    }
}

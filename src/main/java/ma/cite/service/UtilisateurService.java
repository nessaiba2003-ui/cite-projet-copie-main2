package ma.cite.service;

import lombok.RequiredArgsConstructor;
import ma.cite.dto.UtilisateurDTO;
import ma.cite.exception.ResourceNotFoundException;
import ma.cite.model.Utilisateur;
import ma.cite.repository.UtilisateurRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class UtilisateurService {

    private final UtilisateurRepository utilisateurRepository;

    public List<UtilisateurDTO> findAll() {
        return utilisateurRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    public UtilisateurDTO setActif(Long id, boolean actif) {
        Utilisateur u = utilisateurRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", id));
        u.setActif(actif);
        return toDto(utilisateurRepository.save(u));
    }

    public Utilisateur modifierProfil(UtilisateurDTO dto) {
        Utilisateur u = utilisateurRepository.findById(dto.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", dto.getId()));
        u.setNom(dto.getNom());
        u.setPrenom(dto.getPrenom());
        u.setEmail(dto.getEmail());
        return utilisateurRepository.save(u);
    }

    private UtilisateurDTO toDto(Utilisateur u) {
        UtilisateurDTO dto = new UtilisateurDTO();
        dto.setId(u.getId());
        dto.setNom(u.getNom());
        dto.setPrenom(u.getPrenom());
        dto.setEmail(u.getEmail());
        dto.setRole(u.getRole() != null ? u.getRole().name() : null);
        dto.setType(u.getType() != null ? u.getType().name() : null);
        dto.setOrganisme(u.getOrganisme());
        return dto;
    }
}

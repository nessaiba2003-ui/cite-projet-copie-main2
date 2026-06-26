package ma.cite.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.cite.dto.InscriptionRequest;
import ma.cite.dto.InscriptionResponse;
import ma.cite.exception.BusinessException;
import ma.cite.exception.ResourceNotFoundException;
import ma.cite.model.Evenement;
import ma.cite.model.InscriptionEvenement;
import ma.cite.model.StatutPublication;
import ma.cite.repository.EvenementRepository;
import ma.cite.repository.InscriptionEvenementRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class InscriptionEvenementService {

    private final InscriptionEvenementRepository inscriptionRepo;
    private final EvenementRepository evenementRepo;
    private final EmailService emailService;

    @Transactional
    public InscriptionResponse inscrireSansCompte(InscriptionRequest req) {
        Evenement evt = evenementRepo.findById(req.getEvenementId())
                .orElseThrow(() -> new ResourceNotFoundException("Événement", req.getEvenementId()));

        if (evt.getStatut() != StatutPublication.PUBLIE) {
            throw new BusinessException("Cet événement n'est pas ouvert aux inscriptions");
        }

        if (inscriptionRepo.existsByEvenementIdAndEmail(evt.getId(), req.getEmail())) {
            throw new BusinessException("Cet email est déjà inscrit à cet événement.");
        }

        if (Boolean.TRUE.equals(evt.getNombrePlacesLimitee())) {
            long count = inscriptionRepo.countByEvenementId(evt.getId());
            if (evt.getNombrePlacesMax() != null && count >= evt.getNombrePlacesMax()) {
                throw new BusinessException("Désolé, il n'y a plus de places disponibles pour cet événement.");
            }
        }

        String numeroInsc = genererNumeroInscription();
        String tokenConfirm = UUID.randomUUID().toString();

        InscriptionEvenement inscription = InscriptionEvenement.builder()
                .evenement(evt)
                .nom(req.getNom())
                .prenom(req.getPrenom())
                .email(req.getEmail())
                .telephone(req.getTelephone())
                .filiere(req.getFiliere() != null ? req.getFiliere() : req.getEtablissement())
                .niveau(req.getNiveau() != null ? req.getNiveau() : req.getNiveauEtudes())
                .niveauEtudes(req.getNiveauEtudes())
                .etablissement(req.getEtablissement())
                .dateInscription(LocalDateTime.now())
                .numeroInscription(numeroInsc)
                .source(req.getSource() != null ? req.getSource() : "web")
                .statut("INSCRIT")
                .tokenConfirmation(tokenConfirm)
                .confirmePresence(false)
                .build();

        inscription = inscriptionRepo.save(inscription);
        emailService.sendInscriptionConfirmation(inscription);

        return toResponse(inscription);
    }

    @Transactional
    public InscriptionResponse confirmerInscription(String token) {
        InscriptionEvenement inscription = inscriptionRepo.findByTokenConfirmation(token)
                .orElseThrow(() -> new BusinessException("Lien de confirmation invalide ou expiré"));

        if (Boolean.TRUE.equals(inscription.getConfirmePresence())) {
            throw new BusinessException("Cette inscription a déjà été confirmée");
        }

        inscription.setConfirmePresence(true);
        inscription.setStatut("CONFIRME");
        inscriptionRepo.save(inscription);
        log.info("Inscription {} confirmée", inscription.getNumeroInscription());
        return toResponse(inscription);
    }

    public List<InscriptionResponse> getInscrits(Long eventId) {
        if (!evenementRepo.existsById(eventId)) {
            throw new ResourceNotFoundException("Événement", eventId);
        }
        return inscriptionRepo.findByEvenementId(eventId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private String genererNumeroInscription() {
        int year = LocalDateTime.now().getYear();
        String prefix = "EVT-" + year + "-";
        long seq = inscriptionRepo.countByNumeroInscriptionStartingWith(prefix) + 1;
        return prefix + String.format("%04d", seq);
    }

    private InscriptionResponse toResponse(InscriptionEvenement i) {
        return InscriptionResponse.builder()
                .id(i.getId())
                .numeroInscription(i.getNumeroInscription())
                .evenementId(i.getEvenement() != null ? i.getEvenement().getId() : null)
                .evenementTitre(i.getEvenement() != null ? i.getEvenement().getTitre() : null)
                .nom(i.getNom())
                .prenom(i.getPrenom())
                .email(i.getEmail())
                .telephone(i.getTelephone())
                .niveauEtudes(i.getNiveau() != null ? i.getNiveau() : i.getNiveauEtudes())
                .etablissement(i.getFiliere() != null ? i.getFiliere() : i.getEtablissement())
                .dateInscription(i.getDateInscription())
                .confirmePresence(i.getConfirmePresence())
                .source(i.getSource())
                .build();
    }
}

/*package ma.cite.service;

import lombok.RequiredArgsConstructor;
import ma.cite.dto.EvenementRequest;
import ma.cite.dto.EvenementResponse;
import ma.cite.exception.BusinessException;
import ma.cite.exception.ResourceNotFoundException;
import ma.cite.model.*;
import ma.cite.repository.EvenementRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EvenementService {

    private final EvenementRepository evenementRepo;

    public Page<EvenementResponse> findAllPublished(Pageable pageable) {
        return evenementRepo.findByStatut(StatutPublication.PUBLIE, pageable).map(this::toResponse);
    }

    public Page<EvenementResponse> findAll(Pageable pageable) {
        return evenementRepo.findAll(pageable).map(this::toResponse);
    }

    public EvenementResponse findById(Long id) {
        return toResponse(getOrThrow(id));
    }

    @Transactional
    public EvenementResponse create(EvenementRequest req, Utilisateur admin) {
        Evenement e = Evenement.builder()
                .titre(req.getTitre())
                .description(req.getDescription())
                .contenu(req.getContenu())
                .dateDebut(req.getDateDebut())
                .dateFin(req.getDateFin())
                .lieu(req.getLieu())
                .imagePrincipale(req.getImagePrincipale())
                .galerieImages(req.getGalerieImages() != null ? req.getGalerieImages() : new ArrayList<>())
                .nombrePlacesLimitee(req.getNombrePlacesLimitee() != null ? req.getNombrePlacesLimitee() : false)
                .nombrePlacesMax(req.getNombrePlacesMax())
                .dateExpiration(req.getDateExpiration())
                .statut(req.getStatut() != null ? ma.cite.model.StatutPublication.valueOf(req.getStatut()) : ma.cite.model.StatutPublication.BROUILLON)
                .adminCreateur(admin)
                .build();
        if (StatutPublication.PUBLIE.equals(e.getStatut())) {
            e.setDatePublication(LocalDateTime.now());
        }
        return toResponse(evenementRepo.save(e));
    }

    @Transactional
    public EvenementResponse update(Long id, EvenementRequest req) {
        Evenement e = getOrThrow(id);
        e.setTitre(req.getTitre());
        e.setDescription(req.getDescription());
        e.setContenu(req.getContenu());
        e.setDateDebut(req.getDateDebut());
        e.setDateFin(req.getDateFin());
        e.setLieu(req.getLieu());
        if (req.getImagePrincipale() != null) e.setImagePrincipale(req.getImagePrincipale());
        if (req.getGalerieImages() != null) e.setGalerieImages(req.getGalerieImages());
        e.setNombrePlacesLimitee(req.getNombrePlacesLimitee());
        e.setNombrePlacesMax(req.getNombrePlacesMax());
        e.setDateExpiration(req.getDateExpiration());
        if (req.getStatut() != null) e.setStatut(ma.cite.model.StatutPublication.valueOf(req.getStatut()));
        return toResponse(evenementRepo.save(e));
    }

    @Transactional
    public EvenementResponse publish(Long id) {
        Evenement e = getOrThrow(id);
        e.setStatut(StatutPublication.PUBLIE);
        e.setDatePublication(LocalDateTime.now());
        return toResponse(evenementRepo.save(e));
    }

    @Transactional
    public EvenementResponse archive(Long id) {
        Evenement e = getOrThrow(id);
        e.setStatut(StatutPublication.ARCHIVEE);  // ✅ CORRIGÉ : ARCHIVEE au lieu de ARCHIVE
        return toResponse(evenementRepo.save(e));
    }

    @Transactional
    public EvenementResponse restaurer(Long id) {
        Evenement e = getOrThrow(id);
        if (e.getStatut() != StatutPublication.ARCHIVEE) {
            throw new BusinessException("Seuls les événements archivés peuvent être restaurés");
        }
        e.setStatut(StatutPublication.BROUILLON);
        return toResponse(evenementRepo.save(e));
    }

    @Transactional
    public void delete(Long id) {
        Evenement e = getOrThrow(id);
        e.setStatut(StatutPublication.ARCHIVEE);
        evenementRepo.save(e);
    }

    @Scheduled(fixedDelay = 3600000)
    @Transactional
    public void archiveExpired() {
        evenementRepo.findByStatutAndDateExpirationBefore(StatutPublication.PUBLIE, LocalDateTime.now())
                .forEach(e -> {
                    e.setStatut(StatutPublication.ARCHIVEE);  // ✅ CORRIGÉ
                    evenementRepo.save(e);
                });
    }

    private Evenement getOrThrow(Long id) {
        return evenementRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Événement", id));
    }

    public EvenementResponse toResponse(Evenement e) {
        int inscrits = e.getInscriptions() != null ? e.getInscriptions().size() : 0;
        Integer restantes = (e.getNombrePlacesLimitee() != null && e.getNombrePlacesLimitee() && e.getNombrePlacesMax() != null)
                ? e.getNombrePlacesMax() - inscrits : null;
        return EvenementResponse.builder()
                .id(e.getId())
                .titre(e.getTitre())
                .description(e.getDescription())
                .contenu(e.getContenu())
                .dateDebut(e.getDateDebut())
                .dateFin(e.getDateFin())
                .lieu(e.getLieu())
                .imagePrincipale(e.getImagePrincipale())
                .galerieImages(e.getGalerieImages())
                .nombrePlacesLimitee(e.getNombrePlacesLimitee())
                .nombrePlacesMax(e.getNombrePlacesMax())
                .placesRestantes(restantes)
                .datePublication(e.getDatePublication())
                .dateExpiration(e.getDateExpiration())
                .statut(e.getStatut() != null ? e.getStatut() : StatutPublication.BROUILLON)
                .createurNom(e.getAdminCreateur() != null ? e.getAdminCreateur().getNom() + " " + e.getAdminCreateur().getPrenom() : null)
                .createurId(e.getAdminCreateur() != null ? e.getAdminCreateur().getId() : null)
                .build();
    }
}*/

package ma.cite.service;

import lombok.RequiredArgsConstructor;
import ma.cite.dto.EvenementRequest;
import ma.cite.dto.EvenementResponse;
import ma.cite.exception.BusinessException;
import ma.cite.exception.ResourceNotFoundException;
import ma.cite.model.*;
import ma.cite.repository.EvenementRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class EvenementService {

    private final EvenementRepository evenementRepo;

    public Page<EvenementResponse> findAllPublished(Pageable pageable) {
        return evenementRepo.findByStatut(StatutPublication.PUBLIE, pageable).map(this::toResponse);
    }

    public Page<EvenementResponse> findAll(Pageable pageable) {
        return evenementRepo.findAll(pageable).map(this::toResponse);
    }

    public EvenementResponse findById(Long id) {
        return toResponse(getOrThrow(id));
    }

    private TypeEvenement parseTypeEvenement(String raw) {
        if (raw == null || raw.isBlank()) return TypeEvenement.AUTRE;
        try {
            return TypeEvenement.valueOf(raw.trim().toUpperCase());
        } catch (Exception e) {
            return TypeEvenement.AUTRE;
        }
    }

    @Transactional
    public EvenementResponse create(EvenementRequest req, Utilisateur admin) {
        Evenement e = Evenement.builder()
                .titre(req.getTitre())
                .description(req.getDescription())
                .contenu(req.getContenu())
                .dateDebut(req.getDateDebut())
                .dateFin(req.getDateFin())
                .lieu(req.getLieu())

                // ✅ NOUVEAU
                .typeEvenement(parseTypeEvenement(req.getTypeEvenement()))

                .imagePrincipale(req.getImagePrincipale())
                .galerieImages(req.getGalerieImages() != null ? req.getGalerieImages() : new ArrayList<>())
                .nombrePlacesLimitee(req.getNombrePlacesLimitee() != null ? req.getNombrePlacesLimitee() : false)
                .nombrePlacesMax(req.getNombrePlacesMax())
                .dateExpiration(req.getDateExpiration())
                .statut(req.getStatut() != null ? StatutPublication.valueOf(req.getStatut()) : StatutPublication.BROUILLON)
                .adminCreateur(admin)
                .build();

        if (StatutPublication.PUBLIE.equals(e.getStatut())) {
            e.setDatePublication(LocalDateTime.now());
        }
        return toResponse(evenementRepo.save(e));
    }

    @Transactional
    public EvenementResponse update(Long id, EvenementRequest req) {
        Evenement e = getOrThrow(id);

        e.setTitre(req.getTitre());
        e.setDescription(req.getDescription());
        e.setContenu(req.getContenu());
        e.setDateDebut(req.getDateDebut());
        e.setDateFin(req.getDateFin());
        e.setLieu(req.getLieu());

        // ✅ NOUVEAU
        if (req.getTypeEvenement() != null) {
            e.setTypeEvenement(parseTypeEvenement(req.getTypeEvenement()));
        }

        if (req.getImagePrincipale() != null) e.setImagePrincipale(req.getImagePrincipale());
        if (req.getGalerieImages() != null) e.setGalerieImages(req.getGalerieImages());

        e.setNombrePlacesLimitee(req.getNombrePlacesLimitee());
        e.setNombrePlacesMax(req.getNombrePlacesMax());
        e.setDateExpiration(req.getDateExpiration());

        if (req.getStatut() != null) e.setStatut(StatutPublication.valueOf(req.getStatut()));

        return toResponse(evenementRepo.save(e));
    }

    @Transactional
    public EvenementResponse publish(Long id) {
        Evenement e = getOrThrow(id);
        e.setStatut(StatutPublication.PUBLIE);
        e.setDatePublication(LocalDateTime.now());
        return toResponse(evenementRepo.save(e));
    }

    @Transactional
    public EvenementResponse archive(Long id) {
        Evenement e = getOrThrow(id);
        e.setStatut(StatutPublication.ARCHIVEE);
        return toResponse(evenementRepo.save(e));
    }

    @Transactional
    public EvenementResponse restaurer(Long id) {
        Evenement e = getOrThrow(id);
        if (e.getStatut() != StatutPublication.ARCHIVEE) {
            throw new BusinessException("Seuls les événements archivés peuvent être restaurés");
        }
        e.setStatut(StatutPublication.BROUILLON);
        return toResponse(evenementRepo.save(e));
    }

    @Transactional
    public void delete(Long id) {
        Evenement e = getOrThrow(id);
        e.setStatut(StatutPublication.ARCHIVEE);
        evenementRepo.save(e);
    }

    /** Archive automatiquement les événements expirés toutes les heures */
    @Scheduled(fixedDelay = 3600000)
    @Transactional
    public void archiveExpired() {
        evenementRepo.findByStatutAndDateExpirationBefore(StatutPublication.PUBLIE, LocalDateTime.now())
                .forEach(e -> {
                    e.setStatut(StatutPublication.ARCHIVEE);
                    evenementRepo.save(e);
                });
    }

    private Evenement getOrThrow(Long id) {
        return evenementRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Événement", id));
    }

    public EvenementResponse toResponse(Evenement e) {
        int inscrits = e.getInscriptions() != null ? e.getInscriptions().size() : 0;
        Integer restantes = (e.getNombrePlacesLimitee() != null && e.getNombrePlacesLimitee() && e.getNombrePlacesMax() != null)
                ? e.getNombrePlacesMax() - inscrits : null;

        return EvenementResponse.builder()
                .id(e.getId())
                .titre(e.getTitre())
                .description(e.getDescription())
                .contenu(e.getContenu())
                .dateDebut(e.getDateDebut())
                .dateFin(e.getDateFin())
                .lieu(e.getLieu())

                // ✅ NOUVEAU
                .typeEvenement(e.getTypeEvenement() != null ? e.getTypeEvenement().name() : TypeEvenement.AUTRE.name())

                .imagePrincipale(e.getImagePrincipale())
                .galerieImages(e.getGalerieImages())
                .nombrePlacesLimitee(e.getNombrePlacesLimitee())
                .nombrePlacesMax(e.getNombrePlacesMax())
                .placesRestantes(restantes)
                .datePublication(e.getDatePublication())
                .dateExpiration(e.getDateExpiration())
                .statut(e.getStatut() != null ? e.getStatut() : StatutPublication.BROUILLON)
                .createurNom(e.getAdminCreateur() != null ? e.getAdminCreateur().getNom() + " " + e.getAdminCreateur().getPrenom() : null)
                .createurId(e.getAdminCreateur() != null ? e.getAdminCreateur().getId() : null)
                .build();
    }
}
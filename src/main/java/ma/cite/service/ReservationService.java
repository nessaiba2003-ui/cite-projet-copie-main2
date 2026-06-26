/*package ma.cite.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.cite.dto.AdminReservationRequest;
import ma.cite.dto.PublicReservationRequest;
import ma.cite.dto.ReservationRequest;
import ma.cite.dto.ReservationResponse;
import ma.cite.exception.BusinessException;
import ma.cite.exception.ConflitReservationException;
import ma.cite.exception.ResourceNotFoundException;
import ma.cite.model.*;
import ma.cite.repository.LocalRepository;
import ma.cite.repository.ReservationRepository;
import ma.cite.repository.UtilisateurRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReservationService {

    private final ReservationRepository reservationRepo;
    private final LocalRepository localRepo;
    private final UtilisateurRepository utilisateurRepo;
    private final EmailService emailService;
    private final NotificationService notifService;
    private final AcademicHolidayService academicHolidayService;
    private final AcademicHolidayService academicHolidayService;

    /**
     * Ancien mode: réservation avec compte demandeur (conservé pour compat/legacy).
     * IMPORTANT: on remplit AUSSI les champs demandeurXxx dans Reservation (stats/emails/compat).

    @Transactional
    public ReservationResponse create(ReservationRequest req, Utilisateur demandeur) {
        validateDates(req.getDateDebut(), req.getDateFin());
        validateNotHoliday(req.getDateDebut(), req.getDateFin());
        validateNotHoliday(req.getDateDebut(), req.getDateFin());
        validateNotHoliday(req.getDateDebut(), req.getDateFin());

        Local local = localRepo.findById(req.getLocalId())
                .orElseThrow(() -> new ResourceNotFoundException("Local", req.getLocalId()));

        if (local.getStatut() == StatutLocal.HORS_SERVICE) {
            throw new BusinessException("Ce local est hors service");
        }

        if (verifierConflit(local.getId(), req.getDateDebut(), req.getDateFin())) {
            throw new ConflitReservationException("Ce local est déjà réservé sur ce créneau");
        }

        Reservation r = Reservation.builder()
                .demandeur(demandeur)

                // duplication demandeur => utile même si on garde la relation demandeur_id
                .demandeurNom(demandeur != null ? demandeur.getNom() : null)
                .demandeurPrenom(demandeur != null ? demandeur.getPrenom() : null)
                .demandeurEmail(demandeur != null ? demandeur.getEmail() : null)
                .demandeurTelephone(demandeur != null ? demandeur.getTelephone() : null)
                .demandeurType(demandeur != null ? demandeur.getType() : null)
                .demandeurMatricule(demandeur != null ? demandeur.getMatricule() : null)
                .demandeurOrganisme(demandeur != null ? demandeur.getOrganisme() : null)

                .local(local)
                .dateDebut(req.getDateDebut())
                .dateFin(req.getDateFin())
                .dateDemande(LocalDateTime.now())
                .motif(req.getMotif())
                .nombreParticipants(req.getNombreParticipants())
                .prixTotal(null)
                .statut(StatutReservation.EN_ATTENTE)
                .equipementsReserves(new ArrayList<>())
                .build();

        reservationRepo.save(r);

        // notifier admins réservation
        utilisateurRepo.findByRole(Role.ADMIN_RES).forEach(adminRes -> {
            notifService.create(
                    adminRes,
                    "Nouvelle demande de réservation",
                    safeNomPrenom(r.getDemandeurNom(), r.getDemandeurPrenom()) + " a demandé : " + local.getNom(),
                    "ADMIN",
                    "/admin/reservations"
            );
        });

        // notifier demandeur (interne) uniquement si compte existe
        if (demandeur != null) {
            notifService.create(demandeur, "Réservation soumise",
                    "Votre réservation du local " + local.getNom() + " est en attente de validation.",
                    "RESERVATION", "/demandeur/mes-reservations");
        }

        return toResponse(r);
    }

    /**
     * Nouveau mode: réservation publique sans compte.

    @Transactional
    public ReservationResponse createPublic(PublicReservationRequest req) {
        validateDates(req.getDateDebut(), req.getDateFin());

        Local local = localRepo.findById(req.getLocalId())
                .orElseThrow(() -> new ResourceNotFoundException("Local", req.getLocalId()));

        if (local.getStatut() == StatutLocal.HORS_SERVICE) {
            throw new BusinessException("Ce local est hors service");
        }

        if (verifierConflit(local.getId(), req.getDateDebut(), req.getDateFin())) {
            throw new ConflitReservationException("Ce local est déjà réservé sur ce créneau");
        }

        Reservation r = Reservation.builder()
                .demandeur(null)
                .demandeurNom(req.getNom())
                .demandeurPrenom(req.getPrenom())
                .demandeurEmail(req.getEmail())
                .demandeurTelephone(req.getTelephone())
                .demandeurType(req.getType())
                .demandeurMatricule(req.getMatricule())
                .demandeurOrganisme(req.getOrganisme())
                .local(local)
                .dateDebut(req.getDateDebut())
                .dateFin(req.getDateFin())
                .dateDemande(LocalDateTime.now())
                .motif(req.getMotif())
                .nombreParticipants(req.getNombreParticipants())
                .prixTotal(null)
                .statut(StatutReservation.EN_ATTENTE)
                .equipementsReserves(new ArrayList<>())
                .build();

        reservationRepo.save(r);

        // notifier admins réservation (notifications internes)
        utilisateurRepo.findByRole(Role.ADMIN_RES).forEach(adminRes -> {
            notifService.create(
                    adminRes,
                    "Nouvelle demande de réservation",
                    safeNomPrenom(req.getNom(), req.getPrenom()) + " a demandé : " + local.getNom(),
                    "ADMIN",
                    "/admin/reservations"
            );
        });

        return toResponse(r);
    }

    @Transactional
    public ReservationResponse validate(Long id, Utilisateur admin) {
        Reservation r = getOrThrow(id);

        if (r.getStatut() != StatutReservation.EN_ATTENTE) {
            throw new BusinessException("Seules les réservations EN_ATTENTE peuvent être validées");
        }

        r.setStatut(StatutReservation.VALIDEE);
        r.setDateValidation(LocalDateTime.now());
        r.setValidePar(admin.getEmail());
        reservationRepo.save(r);

        // init lazy local before async email
        r.getLocal().getNom();
        emailService.sendReservationConfirmation(r);

        // notification interne seulement si compte demandeur existe
        if (r.getDemandeur() != null) {
            notifService.create(r.getDemandeur(), "Réservation validée",
                    "Votre réservation du local " + r.getLocal().getNom() + " a été validée.",
                    "RESERVATION", "/demandeur/mes-reservations");
        }

        return toResponse(r);
    }

    @Transactional
    public ReservationResponse reject(Long id, String motif, Utilisateur admin) {
        Reservation r = getOrThrow(id);

        if (r.getStatut() != StatutReservation.EN_ATTENTE) {
            throw new BusinessException("Seules les réservations EN_ATTENTE peuvent être rejetées");
        }

        r.setStatut(StatutReservation.REJETEE);
        r.setDateRejet(LocalDateTime.now());
        r.setRejetPar(admin.getEmail());
        r.setMotifRejet(motif);
        reservationRepo.save(r);

        r.getLocal().getNom();
        emailService.sendReservationRejection(r);

        if (r.getDemandeur() != null) {
            notifService.create(r.getDemandeur(), "Réservation refusée",
                    "Votre réservation du local " + r.getLocal().getNom() + " a été refusée. Motif : " + motif,
                    "RESERVATION", "/demandeur/mes-reservations");
        }

        return toResponse(r);
    }

    /**
     * Legacy (annulation par demandeur connecté). Conservé mais plus utilisé si public.

    @Transactional
    public ReservationResponse cancel(Long id, Utilisateur user) {
        Reservation r = getOrThrow(id);

        if (r.getDemandeur() == null) {
            throw new BusinessException("Annulation demandeur indisponible (réservation publique)");
        }

        if (!r.getDemandeur().getId().equals(user.getId())) {
            throw new BusinessException("Vous ne pouvez annuler que vos propres réservations");
        }

        if (r.getStatut() == StatutReservation.VALIDEE || r.getStatut() == StatutReservation.EN_ATTENTE) {
            long heuresAvant = ChronoUnit.HOURS.between(LocalDateTime.now(), r.getDateDebut());
            if (heuresAvant < 48) {
                throw new BusinessException("Annulation impossible moins de 48h avant la réservation");
            }
        }

        if (r.getStatut() == StatutReservation.ANNULEE || r.getStatut() == StatutReservation.REJETEE
                || r.getStatut() == StatutReservation.TERMINEE) {
            throw new BusinessException("Cette réservation ne peut plus être annulée");
        }

        r.setStatut(StatutReservation.ANNULEE);
        reservationRepo.save(r);

        r.getLocal().getNom();
        emailService.sendReservationCancellation(r);

        return toResponse(r);
    }

    public List<ReservationResponse> getMesReservations(Long userId) {
        return reservationRepo.findByDemandeurIdOrderByDateDemandeDesc(userId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public Page<ReservationResponse> getAll(Pageable pageable) {
        return reservationRepo.findAll(pageable).map(this::toResponse);
    }

    public boolean verifierConflit(Long localId, LocalDateTime debut, LocalDateTime fin) {
        return !reservationRepo.findConflicts(localId, debut, fin).isEmpty();
    }

    /**
     * Admin: créer réservation (public OU legacy si demandeurId fourni).

    @Transactional
    public ReservationResponse createByAdmin(AdminReservationRequest req, Utilisateur admin) {
        validateDates(req.getDateDebut(), req.getDateFin());

        Local local = localRepo.findById(req.getLocalId())
                .orElseThrow(() -> new ResourceNotFoundException("Local", req.getLocalId()));

        if (local.getStatut() == StatutLocal.HORS_SERVICE) {
            throw new BusinessException("Ce local est hors service");
        }

        if (verifierConflit(local.getId(), req.getDateDebut(), req.getDateFin())) {
            throw new ConflitReservationException("Ce local est déjà réservé sur ce créneau");
        }

        // legacy path: demandeurId présent
        if (req.getDemandeurId() != null) {
            Utilisateur demandeur = utilisateurRepo.findById(req.getDemandeurId())
                    .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", req.getDemandeurId()));

            ReservationRequest base = new ReservationRequest();
            base.setLocalId(req.getLocalId());
            base.setDateDebut(req.getDateDebut());
            base.setDateFin(req.getDateFin());
            base.setNombreParticipants(req.getNombreParticipants());
            base.setMotif(req.getMotif());

            ReservationResponse created = create(base, demandeur);
            if (req.isValiderImmediatement()) {
                return validate(created.getId(), admin);
            }
            return created;
        }

        // public/admin path (sans compte)
        Reservation r = Reservation.builder()
                .demandeur(null)
                .demandeurNom(req.getDemandeurNom())
                .demandeurPrenom(req.getDemandeurPrenom())
                .demandeurEmail(req.getDemandeurEmail())
                .demandeurTelephone(req.getDemandeurTelephone())
                .demandeurType(req.getDemandeurType())
                .demandeurMatricule(req.getDemandeurMatricule())
                .demandeurOrganisme(req.getDemandeurOrganisme())
                .local(local)
                .dateDebut(req.getDateDebut())
                .dateFin(req.getDateFin())
                .dateDemande(LocalDateTime.now())
                .motif(req.getMotif())
                .nombreParticipants(req.getNombreParticipants())
                .prixTotal(null)
                .statut(StatutReservation.EN_ATTENTE)
                .equipementsReserves(new ArrayList<>())
                .build();

        reservationRepo.save(r);

        if (req.isValiderImmediatement()) {
            return validate(r.getId(), admin);
        }
        return toResponse(r);
    }

    @Transactional
    public ReservationResponse cancelByAdmin(Long id, Utilisateur admin) {
        Reservation r = getOrThrow(id);

        if (r.getStatut() == StatutReservation.ANNULEE || r.getStatut() == StatutReservation.TERMINEE) {
            throw new BusinessException("Cette réservation ne peut plus être annulée");
        }

        r.setStatut(StatutReservation.ANNULEE);
        reservationRepo.save(r);

        r.getLocal().getNom();
        emailService.sendReservationCancellation(r);

        if (r.getDemandeur() != null) {
            notifService.create(r.getDemandeur(), "Réservation annulée",
                    "Votre réservation du local " + r.getLocal().getNom() + " a été annulée par l'administration.",
                    "RESERVATION", "/demandeur/mes-reservations");
        }

        return toResponse(r);
    }

    @Transactional
    public void deleteByAdmin(Long id) {
        if (!reservationRepo.existsById(id)) {
            throw new ResourceNotFoundException("Réservation", id);
        }
        reservationRepo.deleteById(id);
    }

    private Reservation getOrThrow(Long id) {
        return reservationRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Réservation", id));
    }

    private void validateDates(LocalDateTime debut, LocalDateTime fin) {
        if (debut == null || fin == null) throw new BusinessException("Dates obligatoires");
        academicHolidayService.findHoliday(debut, fin).ifPresent(holiday -> {
            throw new BusinessException("Reservation impossible pendant un jour ferie : " + holiday);
        });
        academicHolidayService.findHoliday(debut, fin).ifPresent(holiday -> {
            throw new BusinessException("Reservation impossible pendant un jour ferie : " + holiday);
        });
        if (fin.isBefore(debut) || fin.equals(debut)) {
            throw new BusinessException("La date de fin doit être après la date de début");
        }
        academicHolidayService.findHoliday(debut, fin).ifPresent(holiday -> {
            throw new BusinessException("Reservation impossible pendant un jour ferie : " + holiday);
        });
    }

    private void validateNotHoliday(LocalDateTime debut, LocalDateTime fin) {
        academicHolidayService.findHoliday(debut, fin).ifPresent(holiday -> {
            throw new BusinessException("Reservation impossible pendant un jour ferie : " + holiday);
        });
    }

    private void validateNotHoliday(LocalDateTime debut, LocalDateTime fin) {
        academicHolidayService.findHoliday(debut, fin).ifPresent(holiday -> {
            throw new BusinessException("Reservation impossible pendant un jour ferie : " + holiday);
        });
    }

    private String safeNomPrenom(String nom, String prenom) {
        String n = (nom == null) ? "" : nom.trim();
        String p = (prenom == null) ? "" : prenom.trim();
        String full = (n + " " + p).trim();
        return full.isBlank() ? "Un demandeur" : full;
    }

    public ReservationResponse toResponse(Reservation r) {
        // demandeur = compte ou public
        String nom = (r.getDemandeur() != null) ? r.getDemandeur().getNom() : r.getDemandeurNom();
        String prenom = (r.getDemandeur() != null) ? r.getDemandeur().getPrenom() : r.getDemandeurPrenom();
        String email = (r.getDemandeur() != null) ? r.getDemandeur().getEmail() : r.getDemandeurEmail();

        return ReservationResponse.builder()
                .id(r.getId())
                .dateDemande(r.getDateDemande())
                .dateDebut(r.getDateDebut())
                .dateFin(r.getDateFin())
                .motif(r.getMotif())
                .nombreParticipants(r.getNombreParticipants())
                .prixTotal(r.getPrixTotal())
                .statut(r.getStatut() != null ? r.getStatut().name() : null)
                .motifRejet(r.getMotifRejet())
                .localId(r.getLocal() != null ? r.getLocal().getId() : null)
                .localNom(r.getLocal() != null ? r.getLocal().getNom() : null)
                .localCode(r.getLocal() != null ? r.getLocal().getCode() : null)

                .demandeurNom(nom)
                .demandeurPrenom(prenom)
                .demandeurEmail(email)
                .demandeurTelephone(r.getDemandeur() != null ? r.getDemandeur().getTelephone() : r.getDemandeurTelephone())
                .demandeurType(
                        (r.getDemandeur() != null && r.getDemandeur().getType() != null)
                                ? r.getDemandeur().getType().name()
                                : (r.getDemandeurType() != null ? r.getDemandeurType().name() : null)
                )
                .demandeurMatricule(r.getDemandeur() != null ? r.getDemandeur().getMatricule() : r.getDemandeurMatricule())
                .demandeurOrganisme(r.getDemandeur() != null ? r.getDemandeur().getOrganisme() : r.getDemandeurOrganisme())
                .build();
    }
}*/

package ma.cite.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.cite.dto.AdminReservationRequest;
import ma.cite.dto.PublicReservationRequest;
import ma.cite.dto.ReservationRequest;
import ma.cite.dto.ReservationResponse;
import ma.cite.exception.BusinessException;
import ma.cite.exception.ConflitReservationException;
import ma.cite.exception.ResourceNotFoundException;
import ma.cite.model.*;
import ma.cite.repository.LocalRepository;
import ma.cite.repository.ReservationRepository;
import ma.cite.repository.UtilisateurRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReservationService {

    private final ReservationRepository reservationRepo;
    private final LocalRepository localRepo;
    private final UtilisateurRepository utilisateurRepo;
    private final EmailService emailService;
    private final NotificationService notifService;
    private final AcademicHolidayService academicHolidayService;

    /**
     * Ancien mode: réservation avec compte demandeur (conservé pour compat/legacy).
     */
    @Transactional
    public ReservationResponse create(ReservationRequest req, Utilisateur demandeur) {
        validateDates(req.getDateDebut(), req.getDateFin());

        Local local = localRepo.findById(req.getLocalId())
                .orElseThrow(() -> new ResourceNotFoundException("Local", req.getLocalId()));

        if (local.getStatut() == StatutLocal.HORS_SERVICE) {
            throw new BusinessException("Ce local est hors service");
        }

        if (verifierConflit(local.getId(), req.getDateDebut(), req.getDateFin())) {
            throw new ConflitReservationException(
                    "Ce local est déjà réservé pour cette période. " +
                            "Veuillez choisir un autre créneau ou un autre local."
            );
        }

        Reservation r = Reservation.builder()
                .demandeur(demandeur)
                .demandeurNom(demandeur != null ? demandeur.getNom() : null)
                .demandeurPrenom(demandeur != null ? demandeur.getPrenom() : null)
                .demandeurEmail(demandeur != null ? demandeur.getEmail() : null)
                .demandeurTelephone(demandeur != null ? demandeur.getTelephone() : null)
                .demandeurType(demandeur != null ? demandeur.getType() : null)
                .demandeurMatricule(demandeur != null ? demandeur.getMatricule() : null)
                .demandeurOrganisme(demandeur != null ? demandeur.getOrganisme() : null)
                .local(local)
                .dateDebut(req.getDateDebut())
                .dateFin(req.getDateFin())
                .dateDemande(LocalDateTime.now())
                .motif(req.getMotif())
                .nombreParticipants(req.getNombreParticipants())
                .statut(StatutReservation.EN_ATTENTE)
                .equipementsReserves(new ArrayList<>())
                .build();

        reservationRepo.save(r);

        utilisateurRepo.findByRole(Role.ADMIN_RES).forEach(adminRes -> {
            notifService.create(
                    adminRes,
                    "Nouvelle demande de réservation",
                    safeNomPrenom(r.getDemandeurNom(), r.getDemandeurPrenom()) + " a demandé : " + local.getNom(),
                    "ADMIN",
                    "/admin/reservations"
            );
        });

        if (demandeur != null) {
            notifService.create(demandeur, "Réservation soumise",
                    "Votre réservation du local " + local.getNom() + " est en attente de validation.",
                    "RESERVATION", "/demandeur/mes-reservations");
        }

        return toResponse(r);
    }

    /**
     * Nouveau mode: réservation publique sans compte.
     */
    @Transactional
    public ReservationResponse createPublic(PublicReservationRequest req) {
        validateDates(req.getDateDebut(), req.getDateFin());

        Local local = localRepo.findById(req.getLocalId())
                .orElseThrow(() -> new ResourceNotFoundException("Local", req.getLocalId()));

        if (local.getStatut() == StatutLocal.HORS_SERVICE) {
            throw new BusinessException("Ce local est hors service");
        }

        if (verifierConflit(local.getId(), req.getDateDebut(), req.getDateFin())) {
            throw new ConflitReservationException(
                    "Ce local est déjà réservé pour cette période. " +
                            "Veuillez choisir un autre créneau ou un autre local."
            );
        }

        Reservation r = Reservation.builder()
                .demandeur(null)
                .demandeurNom(req.getNom())
                .demandeurPrenom(req.getPrenom())
                .demandeurEmail(req.getEmail())
                .demandeurTelephone(req.getTelephone())
                .demandeurType(req.getType())
                .demandeurMatricule(req.getMatricule())
                .demandeurOrganisme(req.getOrganisme())
                .local(local)
                .dateDebut(req.getDateDebut())
                .dateFin(req.getDateFin())
                .dateDemande(LocalDateTime.now())
                .motif(req.getMotif())
                .nombreParticipants(req.getNombreParticipants())
                .statut(StatutReservation.EN_ATTENTE)
                .equipementsReserves(new ArrayList<>())
                .build();

        reservationRepo.save(r);

        utilisateurRepo.findByRole(Role.ADMIN_RES).forEach(adminRes -> {
            notifService.create(
                    adminRes,
                    "Nouvelle demande de réservation",
                    safeNomPrenom(req.getNom(), req.getPrenom()) + " a demandé : " + local.getNom(),
                    "ADMIN",
                    "/admin/reservations"
            );
        });

        return toResponse(r);
    }

    @Transactional
    public ReservationResponse validate(Long id, Utilisateur admin) {
        Reservation r = getOrThrow(id);

        if (r.getStatut() != StatutReservation.EN_ATTENTE) {
            throw new BusinessException("Seules les réservations EN_ATTENTE peuvent être validées");
        }

        // ✅ Vérifier chevauchement avant validation
        if (verifierConflit(r.getLocal().getId(), r.getDateDebut(), r.getDateFin(), r.getId())) {
            throw new ConflitReservationException(
                    "Ce local est déjà réservé pour cette période. " +
                            "Impossible de valider cette réservation."
            );
        }

        r.setStatut(StatutReservation.VALIDEE);
        r.setDateValidation(LocalDateTime.now());
        r.setValidePar(admin.getEmail());
        reservationRepo.save(r);

        r.getLocal().getNom();
        emailService.sendReservationConfirmation(r);

        if (r.getDemandeur() != null) {
            notifService.create(r.getDemandeur(), "Réservation validée",
                    "Votre réservation du local " + r.getLocal().getNom() + " a été validée.",
                    "RESERVATION", "/demandeur/mes-reservations");
        }

        return toResponse(r);
    }

    @Transactional
    public ReservationResponse reject(Long id, String motif, Utilisateur admin) {
        Reservation r = getOrThrow(id);

        if (r.getStatut() != StatutReservation.EN_ATTENTE) {
            throw new BusinessException("Seules les réservations EN_ATTENTE peuvent être rejetées");
        }

        r.setStatut(StatutReservation.REJETEE);
        r.setDateRejet(LocalDateTime.now());
        r.setRejetPar(admin.getEmail());
        r.setMotifRejet(motif);
        reservationRepo.save(r);

        r.getLocal().getNom();
        emailService.sendReservationRejection(r);

        if (r.getDemandeur() != null) {
            notifService.create(r.getDemandeur(), "Réservation refusée",
                    "Votre réservation du local " + r.getLocal().getNom() + " a été refusée. Motif : " + motif,
                    "RESERVATION", "/demandeur/mes-reservations");
        }

        return toResponse(r);
    }

    @Transactional
    public ReservationResponse cancel(Long id, Utilisateur user) {
        Reservation r = getOrThrow(id);

        if (r.getDemandeur() == null) {
            throw new BusinessException("Annulation demandeur indisponible (réservation publique)");
        }

        if (!r.getDemandeur().getId().equals(user.getId())) {
            throw new BusinessException("Vous ne pouvez annuler que vos propres réservations");
        }

        if (r.getStatut() == StatutReservation.VALIDEE || r.getStatut() == StatutReservation.EN_ATTENTE) {
            long heuresAvant = ChronoUnit.HOURS.between(LocalDateTime.now(), r.getDateDebut());
            if (heuresAvant < 48) {
                throw new BusinessException("Annulation impossible moins de 48h avant la réservation");
            }
        }

        if (r.getStatut() == StatutReservation.ANNULEE || r.getStatut() == StatutReservation.REJETEE
                || r.getStatut() == StatutReservation.TERMINEE) {
            throw new BusinessException("Cette réservation ne peut plus être annulée");
        }

        r.setStatut(StatutReservation.ANNULEE);
        reservationRepo.save(r);

        r.getLocal().getNom();
        emailService.sendReservationCancellation(r);

        return toResponse(r);
    }

    public List<ReservationResponse> getMesReservations(Long userId) {
        return reservationRepo.findByDemandeurIdOrderByDateDemandeDesc(userId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public Page<ReservationResponse> getAll(Pageable pageable) {
        return reservationRepo.findAll(pageable).map(this::toResponse);
    }

    public boolean verifierConflit(Long localId, LocalDateTime debut, LocalDateTime fin) {
        return verifierConflit(localId, debut, fin, null);
    }

    // ✅ NOUVEAU : Vérifier chevauchement en excluant une réservation (pour modification)
    public boolean verifierConflit(Long localId, LocalDateTime debut, LocalDateTime fin, Long excludeId) {
        List<Reservation> conflicts = reservationRepo.findConflicts(localId, debut, fin);
        if (excludeId != null) {
            conflicts = conflicts.stream()
                    .filter(r -> !r.getId().equals(excludeId))
                    .collect(Collectors.toList());
        }
        return !conflicts.isEmpty();
    }

    /**
     * Admin: créer réservation (public OU legacy si demandeurId fourni).
     */
    @Transactional
    public ReservationResponse createByAdmin(AdminReservationRequest req, Utilisateur admin) {
        validateDates(req.getDateDebut(), req.getDateFin());

        Local local = localRepo.findById(req.getLocalId())
                .orElseThrow(() -> new ResourceNotFoundException("Local", req.getLocalId()));

        if (local.getStatut() == StatutLocal.HORS_SERVICE) {
            throw new BusinessException("Ce local est hors service");
        }

        if (verifierConflit(local.getId(), req.getDateDebut(), req.getDateFin())) {
            throw new ConflitReservationException(
                    "Ce local est déjà réservé pour cette période. " +
                            "Veuillez choisir un autre créneau ou un autre local."
            );
        }

        if (req.getDemandeurId() != null) {
            Utilisateur demandeur = utilisateurRepo.findById(req.getDemandeurId())
                    .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", req.getDemandeurId()));

            ReservationRequest base = new ReservationRequest();
            base.setLocalId(req.getLocalId());
            base.setDateDebut(req.getDateDebut());
            base.setDateFin(req.getDateFin());
            base.setNombreParticipants(req.getNombreParticipants());
            base.setMotif(req.getMotif());

            ReservationResponse created = create(base, demandeur);
            if (req.isValiderImmediatement()) {
                return validate(created.getId(), admin);
            }
            return created;
        }

        Reservation r = Reservation.builder()
                .demandeur(null)
                .demandeurNom(req.getDemandeurNom())
                .demandeurPrenom(req.getDemandeurPrenom())
                .demandeurEmail(req.getDemandeurEmail())
                .demandeurTelephone(req.getDemandeurTelephone())
                .demandeurType(req.getDemandeurType())
                .demandeurMatricule(req.getDemandeurMatricule())
                .demandeurOrganisme(req.getDemandeurOrganisme())
                .local(local)
                .dateDebut(req.getDateDebut())
                .dateFin(req.getDateFin())
                .dateDemande(LocalDateTime.now())
                .motif(req.getMotif())
                .nombreParticipants(req.getNombreParticipants())
                .statut(StatutReservation.EN_ATTENTE)
                .equipementsReserves(new ArrayList<>())
                .typeEvenement(req.getTypeEvenement() != null ? TypeEvenement.valueOf(req.getTypeEvenement()) : TypeEvenement.AUTRE)
                .publicRecu(req.getPublicRecu())
                .modeReglement(req.getModeReglement())
                .build();

        reservationRepo.save(r);

        if (req.isValiderImmediatement()) {
            return validate(r.getId(), admin);
        }
        return toResponse(r);
    }

    @Transactional
    public ReservationResponse cancelByAdmin(Long id, Utilisateur admin) {
        Reservation r = getOrThrow(id);

        if (r.getStatut() == StatutReservation.ANNULEE || r.getStatut() == StatutReservation.TERMINEE
                || r.getStatut() == StatutReservation.ARCHIVEE) {
            throw new BusinessException("Cette réservation ne peut plus être annulée");
        }

        r.setStatut(StatutReservation.ANNULEE);
        reservationRepo.save(r);

        r.getLocal().getNom();
        emailService.sendReservationCancellation(r);

        if (r.getDemandeur() != null) {
            notifService.create(r.getDemandeur(), "Réservation annulée",
                    "Votre réservation du local " + r.getLocal().getNom() + " a été annulée par l'administration.",
                    "RESERVATION", "/demandeur/mes-reservations");
        }

        return toResponse(r);
    }

    // ✅ NOUVEAU : Archiver au lieu de supprimer
    @Transactional
    public ReservationResponse archiver(Long id) {
        Reservation r = getOrThrow(id);
        r.setStatut(StatutReservation.ARCHIVEE);
        reservationRepo.save(r);
        return toResponse(r);
    }

    // ✅ NOUVEAU : Restaurer une réservation archivée
    @Transactional
    public ReservationResponse restaurer(Long id) {
        Reservation r = getOrThrow(id);

        if (r.getStatut() != StatutReservation.ARCHIVEE) {
            throw new BusinessException("Seules les réservations archivées peuvent être restaurées");
        }

        // ✅ Vérifier chevauchement avant restauration
        if (verifierConflit(r.getLocal().getId(), r.getDateDebut(), r.getDateFin(), r.getId())) {
            throw new ConflitReservationException(
                    "Impossible de restaurer : ce local est déjà réservé pour cette période."
            );
        }

        r.setStatut(StatutReservation.EN_ATTENTE);
        reservationRepo.save(r);
        return toResponse(r);
    }

    // ✅ NOUVEAU : Restaurer après annulation
    @Transactional
    public ReservationResponse restaurerApresAnnulation(Long id) {
        Reservation r = getOrThrow(id);

        if (r.getStatut() != StatutReservation.ANNULEE) {
            throw new BusinessException("Seules les réservations annulées peuvent être restaurées");
        }

        // ✅ Vérifier chevauchement avant restauration
        if (verifierConflit(r.getLocal().getId(), r.getDateDebut(), r.getDateFin(), r.getId())) {
            throw new ConflitReservationException(
                    "Impossible de restaurer : ce local est déjà réservé pour cette période."
            );
        }

        r.setStatut(StatutReservation.VALIDEE);
        reservationRepo.save(r);
        return toResponse(r);
    }

    // ✅ NOUVEAU : Modifier une réservation existante
    @Transactional
    public ReservationResponse update(Long id, AdminReservationRequest req, Utilisateur admin) {
        Reservation r = getOrThrow(id);

        if (r.getStatut() == StatutReservation.ARCHIVEE || r.getStatut() == StatutReservation.TERMINEE) {
            throw new BusinessException("Cette réservation ne peut plus être modifiée");
        }

        validateDates(req.getDateDebut(), req.getDateFin());

        Local local = localRepo.findById(req.getLocalId())
                .orElseThrow(() -> new ResourceNotFoundException("Local", req.getLocalId()));

        if (local.getStatut() == StatutLocal.HORS_SERVICE) {
            throw new BusinessException("Ce local est hors service");
        }

        // ✅ Vérifier chevauchement en excluant la réservation en cours de modification
        if (verifierConflit(local.getId(), req.getDateDebut(), req.getDateFin(), id)) {
            throw new ConflitReservationException(
                    "Ce local est déjà réservé pour cette période. " +
                            "Veuillez choisir un autre créneau."
            );
        }

        if (req.getTypeEvenement() != null && !req.getTypeEvenement().isBlank()) {
            r.setTypeEvenement(TypeEvenement.valueOf(req.getTypeEvenement()));
        }
        r.setPublicRecu(req.getPublicRecu());
        r.setModeReglement(req.getModeReglement());



        // Mettre à jour les champs
        r.setDemandeurNom(req.getDemandeurNom());
        r.setDemandeurPrenom(req.getDemandeurPrenom());
        r.setDemandeurEmail(req.getDemandeurEmail());
        r.setDemandeurTelephone(req.getDemandeurTelephone());
        r.setDemandeurOrganisme(req.getDemandeurOrganisme());
        r.setLocal(local);
        r.setDateDebut(req.getDateDebut());
        r.setDateFin(req.getDateFin());
        r.setNombreParticipants(req.getNombreParticipants());
        r.setMotif(req.getMotif());

        if (req.isValiderImmediatement() && r.getStatut() == StatutReservation.EN_ATTENTE) {
            r.setStatut(StatutReservation.VALIDEE);
            r.setDateValidation(LocalDateTime.now());
            r.setValidePar(admin.getEmail());
        }

        reservationRepo.save(r);
        return toResponse(r);
    }

    // ✅ ANCIEN : À déprécier (garder pour compatibilité si besoin)
    @Transactional
    public void deleteByAdmin(Long id) {
        if (!reservationRepo.existsById(id)) {
            throw new ResourceNotFoundException("Réservation", id);
        }
        // ✅ Au lieu de supprimer, on archive
        archiver(id);
    }

    private Reservation getOrThrow(Long id) {
        return reservationRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Réservation", id));
    }

    private void validateDates(LocalDateTime debut, LocalDateTime fin) {
        if (debut == null || fin == null) throw new BusinessException("Dates obligatoires");
        academicHolidayService.findHoliday(debut, fin).ifPresent(holiday -> {
            throw new BusinessException("Reservation impossible pendant un jour ferie : " + holiday);
        });
        if (fin.isBefore(debut) || fin.equals(debut)) {
            throw new BusinessException("La date de fin doit être après la date de début");
        }
    }

    private String safeNomPrenom(String nom, String prenom) {
        String n = (nom == null) ? "" : nom.trim();
        String p = (prenom == null) ? "" : prenom.trim();
        String full = (n + " " + p).trim();
        return full.isBlank() ? "Un demandeur" : full;
    }

    public ReservationResponse toResponse(Reservation r) {
        String nom = (r.getDemandeur() != null) ? r.getDemandeur().getNom() : r.getDemandeurNom();
        String prenom = (r.getDemandeur() != null) ? r.getDemandeur().getPrenom() : r.getDemandeurPrenom();
        String email = (r.getDemandeur() != null) ? r.getDemandeur().getEmail() : r.getDemandeurEmail();
        String typeEvt = (r.getTypeEvenement() != null) ? r.getTypeEvenement().name() : null;

        String eq = (r.getEquipementsReserves() == null || r.getEquipementsReserves().isEmpty())
                ? ""
                : r.getEquipementsReserves().stream()
                .map(e -> e.getNom()) // adapte si ton champ s'appelle autrement
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.joining(", "));

        return ReservationResponse.builder()
                .id(r.getId())
                .dateDemande(r.getDateDemande())
                .dateDebut(r.getDateDebut())
                .dateFin(r.getDateFin())
                .motif(r.getMotif())
                .nombreParticipants(r.getNombreParticipants())
                .statut(r.getStatut() != null ? r.getStatut().name() : null)
                .motifRejet(r.getMotifRejet())
                .localId(r.getLocal() != null ? r.getLocal().getId() : null)
                .localNom(r.getLocal() != null ? r.getLocal().getNom() : null)
                .localCode(r.getLocal() != null ? r.getLocal().getCode() : null)
                .demandeurNom(nom)
                .demandeurPrenom(prenom)
                .demandeurEmail(email)
                .demandeurTelephone(r.getDemandeur() != null ? r.getDemandeur().getTelephone() : r.getDemandeurTelephone())
                .demandeurType(
                        (r.getDemandeur() != null && r.getDemandeur().getType() != null)
                                ? r.getDemandeur().getType().name()
                                : (r.getDemandeurType() != null ? r.getDemandeurType().name() : null)
                )
                .demandeurMatricule(r.getDemandeur() != null ? r.getDemandeur().getMatricule() : r.getDemandeurMatricule())
                .demandeurOrganisme(r.getDemandeur() != null ? r.getDemandeur().getOrganisme() : r.getDemandeurOrganisme())
                .typeEvenement(typeEvt)
                .publicRecu(r.getPublicRecu())
                .modeReglement(r.getModeReglement())
                .equipements(eq)
                .programmeAfficheUrl(r.getProgrammeAfficheUrl())
                .logoOrganismeUrl(r.getLogoOrganismeUrl())
                .build();
    }
}

package ma.cite.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import ma.cite.model.TypeUtilisateur;

import java.time.LocalDateTime;

/**
 * Admin peut:
 * - créer une réservation pour un ancien demandeur (demandeurId)
 * - OU créer une réservation "publique" sans compte (demandeurNom, demandeurEmail, ...)
 */
@Data
public class AdminReservationRequest {

    // réservation
    @NotNull
    private Long localId;

    @NotNull
    private LocalDateTime dateDebut;

    @NotNull
    private LocalDateTime dateFin;

    private Integer nombreParticipants;
    private String motif;

    private boolean validerImmediatement;

    // legacy (si tu veux garder l'ancien mode)
    private Long demandeurId;

    // public (sans compte)
    private String demandeurNom;
    private String demandeurPrenom;
    private String demandeurEmail;
    private String demandeurTelephone;

    private TypeUtilisateur demandeurType; // INTERNE / EXTERNE
    private String demandeurMatricule;
    private String demandeurOrganisme;

    private String typeEvenement;
    private String publicRecu;
    private String modeReglement;
    private String programmeAfficheUrl;
    private String logoOrganismeUrl;
    private String equipements; // string joinée "Video-projecteur, Micro..." (pour l’Excel)
}

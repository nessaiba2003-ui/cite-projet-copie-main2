package ma.cite.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReservationResponse {
    private Long id;

    private String demandeurNom;
    private String demandeurPrenom;
    private String demandeurEmail;
    private String demandeurTelephone;
    private String demandeurType;
    private String demandeurMatricule;
    private String demandeurOrganisme;

    private String localNom;
    private String localCode;
    private Long localId;

    private LocalDateTime dateDemande;
    private LocalDateTime dateDebut;
    private LocalDateTime dateFin;

    private String motif;
    private Integer nombreParticipants;
    private Double prixTotal;

    private String statut;
    private String motifRejet;
    private String typeEvenement;
    private String publicRecu;
    private String modeReglement;
    private String programmeAfficheUrl;
    private String logoOrganismeUrl;
    private String equipements; // string joinée "Video-projecteur, Micro..." (pour l’Excel)
}

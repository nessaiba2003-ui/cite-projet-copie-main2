package ma.cite.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Réservation d'un local.
 * Workflow : EN_ATTENTE → VALIDEE ou REJETEE.
 *
 * Nouveau : réservation publique (sans compte) => infos demandeur stockées directement dans Reservation.
 */
@Entity
@Table(name = "reservations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime dateDemande;
    private LocalDateTime dateDebut;
    private LocalDateTime dateFin;

    @Column(columnDefinition = "TEXT")
    private String motif;

    private Integer nombreParticipants;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private StatutReservation statut = StatutReservation.EN_ATTENTE;

    @Enumerated(EnumType.STRING)
    private TypeEvenement typeEvenement; // Réunion / Formation / Conférence / Autre

    // Colonnes Excel complémentaires
    private String publicRecu;      // ex: "Interne", "Externe", "Mixte" ou "Oui/Non"
    private String modeReglement;   // ex: "Gratuit" / "Convention" / "Autre"

    // Validation
    private LocalDateTime dateValidation;
    private String validePar; // email de l'admin

    // Rejet
    private LocalDateTime dateRejet;
    private String rejetPar;
    private String motifRejet;

    /**
     * Ancien mode (compte demandeur) - optionnel désormais.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "demandeur_id", nullable = true)
    private Utilisateur demandeur;

    /**
     * Nouveau mode (public, sans compte)
     */
    @Column(name = "demandeur_nom")
    private String demandeurNom;

    @Column(name = "demandeur_prenom")
    private String demandeurPrenom;

    @Column(name = "demandeur_email")
    private String demandeurEmail;

    @Column(name = "demandeur_telephone")
    private String demandeurTelephone;

    @Enumerated(EnumType.STRING)
    @Column(name = "demandeur_type")
    private TypeUtilisateur demandeurType; // INTERNE / EXTERNE

    @Column(name = "demandeur_matricule")
    private String demandeurMatricule;

    @Column(name = "demandeur_organisme")
    private String demandeurOrganisme;

    private String programmeAfficheUrl;
    private String logoOrganismeUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "local_id")
    private Local local;

    @ManyToMany
    @JoinTable(
            name = "reservation_equipements",
            joinColumns = @JoinColumn(name = "reservation_id"),
            inverseJoinColumns = @JoinColumn(name = "equipement_id")
    )
    @Builder.Default
    private List<Equipement> equipementsReserves = new ArrayList<>();
}

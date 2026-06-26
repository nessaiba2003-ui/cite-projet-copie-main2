package ma.cite.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "inscriptions_evenements")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InscriptionEvenement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "evenement_id", nullable = false)
    private Evenement evenement;

    @Column(nullable = false)
    private String nom;

    @Column(nullable = false)
    private String prenom;

    @Column(nullable = false)
    private String email;

    private String telephone;
    private String filiere;
    private String niveau;
    private String niveauEtudes;
    private String etablissement;

    private LocalDateTime dateInscription;
    private String numeroInscription;
    private String source;
    private String statut;

    private String tokenConfirmation;
    private Boolean confirmePresence;
}

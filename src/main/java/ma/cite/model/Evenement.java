package ma.cite.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "evenements")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Evenement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titre;

    private String description;

    @Column(columnDefinition = "TEXT")
    private String contenu;

    private String lieu;

    private LocalDateTime dateDebut;
    private LocalDateTime dateFin;

    private Boolean nombrePlacesLimitee;
    private Integer nombrePlacesMax;

    private String imagePrincipale;

    @ElementCollection
    @Builder.Default
    private List<String> galerieImages = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private TypeEvenement typeEvenement = TypeEvenement.AUTRE;

    private LocalDateTime datePublication;
    private LocalDateTime dateExpiration;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private StatutPublication statut = StatutPublication.BROUILLON;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id")
    private Utilisateur adminCreateur;

    @OneToMany(mappedBy = "evenement", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<InscriptionEvenement> inscriptions = new ArrayList<>();
}
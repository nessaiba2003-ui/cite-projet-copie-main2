package ma.cite.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "locaux")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Local {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String code;

    @Column(nullable = false)
    private String nom;

    private Integer capacite;
    
    private String localisation;

    /** Étage virtuel pour la navigation immersive (0 = RDC, négatif = sous-sol). */
    private Integer etage;

    private String videoUrl;

    private String panoramaUrl;

    @Column(columnDefinition = "TEXT")
    private String description;

    private Double tarifInterne;
    private Double tarifExterne;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private StatutLocal statut = StatutLocal.DISPONIBLE;

    private String raisonIndisponibilite;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pole_id")
    private Pole pole;

    @Enumerated(EnumType.STRING)
    private TypeLocal typeLocal;

    @Enumerated(EnumType.STRING)
    private DispositionLocale disposition;

    @ElementCollection
    @CollectionTable(name = "local_equipements", joinColumns = @JoinColumn(name = "local_id"))
    @Column(name = "equipement")
    private List<String> equipements;

    @ElementCollection
    @CollectionTable(name = "local_images", joinColumns = @JoinColumn(name = "local_id"))
    @Column(name = "image_url")
    private List<String> images;
}

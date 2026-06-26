package ma.cite.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "annonces")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Annonce {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titre;

    @Column(columnDefinition = "TEXT")
    private String contenu;

    private String image;
    private String pieceJointe;

    private LocalDateTime datePublication;
    private LocalDateTime dateExpiration;

    private String priorite;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private StatutPublication statut = StatutPublication.BROUILLON;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id")
    private Utilisateur adminCreateur;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pole_id")
    private Pole pole;
}

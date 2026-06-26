package ma.cite.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "poles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Pole {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String code;

    @Column(nullable = false)
    private String nom;

    @Column(columnDefinition = "TEXT")
    private String description;

    /** Couleur officielle du pôle (hex). */
    private String couleur;

    private Integer ordre;

    @OneToMany(mappedBy = "pole", cascade = CascadeType.ALL)
    @Builder.Default
    private List<Annonce> annonces = new ArrayList<>();
}

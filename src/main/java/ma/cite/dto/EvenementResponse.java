package ma.cite.dto;
import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EvenementResponse {
    private Long id;
    private String titre;
    private String description;
    private String contenu;
    private String lieu;
    private LocalDateTime dateDebut;
    private LocalDateTime dateFin;
    private Boolean nombrePlacesLimitee;
    private Integer nombrePlacesMax;
    private Integer placesRestantes;
    private String imagePrincipale;
    private List<String> galerieImages;
    private ma.cite.model.StatutPublication statut;
    private LocalDateTime datePublication;
    private LocalDateTime dateExpiration;
    private String createurNom;
    private Long createurId;
    private String typeEvenement;
}

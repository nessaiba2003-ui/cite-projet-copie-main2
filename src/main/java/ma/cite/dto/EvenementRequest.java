package ma.cite.dto;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class EvenementRequest {
    private String titre;
    private String description;
    private String contenu;
    private String lieu;
    private String typeEvenement; // "REUNION"|"FORMATION"|"CONFERENCE"|"AUTRE"
    private LocalDateTime dateDebut;
    private LocalDateTime dateFin;
    private Boolean nombrePlacesLimitee;
    private Integer nombrePlacesMax;
    private String imagePrincipale;
    private String statut;
    private List<String> galerieImages;
    private LocalDateTime dateExpiration;
}

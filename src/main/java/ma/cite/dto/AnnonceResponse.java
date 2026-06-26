package ma.cite.dto;
import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnnonceResponse {
    private Long id;
    private String titre;
    private String contenu;
    private String image;
    private String pieceJointe;
    private String priorite;
    private ma.cite.model.StatutPublication statut;
    private LocalDateTime datePublication;
    private LocalDateTime dateExpiration;
    private String createurNom;
}

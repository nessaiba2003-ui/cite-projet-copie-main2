package ma.cite.dto;
import lombok.Data;
import java.time.LocalDateTime;
@Data
public class AnnonceRequest {
    private String titre;
    private String contenu;
    private String image;
    private String pieceJointe;
    private LocalDateTime dateExpiration;
    private String priorite;
    private String statut;
    private Long poleId;
}

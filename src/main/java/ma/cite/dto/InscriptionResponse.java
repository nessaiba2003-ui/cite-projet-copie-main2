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
public class InscriptionResponse {
    private Long id;
    private String numeroInscription;
    private Long evenementId;
    private String evenementTitre;
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private String niveauEtudes;
    private String etablissement;
    private LocalDateTime dateInscription;
    private Boolean confirmePresence;
    private String source;
}

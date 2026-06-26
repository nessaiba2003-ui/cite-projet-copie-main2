package ma.cite.dto;
import lombok.Data;
@Data
public class InscriptionRequest {
    private Long evenementId;
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private String etablissement;
    private String niveauEtudes;
    private String filiere;
    private String niveau;
    private String source;
}

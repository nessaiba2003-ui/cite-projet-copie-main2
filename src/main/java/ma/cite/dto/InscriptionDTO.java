package ma.cite.dto;
import lombok.Data;
@Data
public class InscriptionDTO {
    private Long id;
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
}

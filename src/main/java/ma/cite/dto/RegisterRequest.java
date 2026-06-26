package ma.cite.dto;
import lombok.Data;
@Data
public class RegisterRequest {
    private String email;
    private String password;
    private String nom;
    private String prenom;
    private String telephone;
    private String type; // INTERNE ou EXTERNE
    private String matricule;
    private String organisme;
}

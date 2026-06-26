package ma.cite.dto;
import lombok.Data;
import java.util.List;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LocalResponse {
    private Long id;
    private String code;
    private String nom;
    private Integer capacite;
    private String localisation;
    private Integer etage;
    private String videoUrl;
    private String panoramaUrl;
    private String description;
    private Double tarifInterne;
    private Double tarifExterne;
    private String statut;
    private String raisonIndisponibilite;
    private Long poleId;
    private String poleCode;
    private String poleNom;
    private String poleCouleur;
    private String typeLocal;
    private String disposition;
    private List<String> equipements;
    private List<String> images;
}

package ma.cite.dto;
import lombok.Data;
import java.util.List;
@Data
public class LocalRequest {
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
    private String typeLocal;
    private String disposition;
    private List<String> equipements;
    private List<String> images;
}

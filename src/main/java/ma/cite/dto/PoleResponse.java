package ma.cite.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PoleResponse {
    private Long id;
    private String code;
    private String nom;
    private String description;
    private String couleur;
    private Integer ordre;
}

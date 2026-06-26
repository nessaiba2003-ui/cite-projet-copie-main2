package ma.cite.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class LocalFilterRequest {
    private Long poleId;
    private String typeLocal;
    private String disposition;
    private List<String> equipements;
    private LocalDateTime disponibleDebut;
    private LocalDateTime disponibleFin;
    private String search;
    private Boolean disponibleOnly;
}

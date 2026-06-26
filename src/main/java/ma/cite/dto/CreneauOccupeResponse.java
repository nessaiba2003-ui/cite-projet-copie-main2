package ma.cite.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreneauOccupeResponse {
    private LocalDateTime dateDebut;
    private LocalDateTime dateFin;
    private String statut;
}

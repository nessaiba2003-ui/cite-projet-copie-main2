package ma.cite.dto;
import lombok.Data;
import java.time.LocalDateTime;
@Data
public class ReservationRequest {
    private Long localId;
    private LocalDateTime dateDebut;
    private LocalDateTime dateFin;
    private Integer nombreParticipants;
    private String motif;


}

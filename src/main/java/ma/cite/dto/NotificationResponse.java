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
public class NotificationResponse {
    private Long id;
    private String titre;
    private String message;
    private String type;
    private String lienAction;
    private Boolean lue;
    private LocalDateTime dateEnvoi;
}

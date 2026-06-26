package ma.cite.dto;
import lombok.Data;
import java.time.LocalDateTime;
@Data
public class NotificationDTO {
    private Long id;
    private String titre;
    private String message;
    private Boolean lue;
    private LocalDateTime dateCreation;
}

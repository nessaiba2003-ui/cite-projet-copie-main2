package ma.cite.dto;
import lombok.Data;
import lombok.Builder;
@Data
@Builder
public class AuthResponse {
    private String token;
    private String role;
    private String nomComplet;
}

package ma.cite.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "equipements")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Equipement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nom;
    private String description;
    
    @Builder.Default
    private Boolean disponible = true;
}

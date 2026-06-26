package ma.cite.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import ma.cite.model.TypeUtilisateur;

import java.time.LocalDateTime;

@Data
public class PublicReservationRequest {

    // réservation
    @NotNull
    private Long localId;

    @NotNull
    private LocalDateTime dateDebut;

    @NotNull
    private LocalDateTime dateFin;

    private Integer nombreParticipants;
    private String motif;

    // infos demandeur (public)
    @NotBlank
    private String nom;

    @NotBlank
    private String prenom;

    @NotBlank
    @Email
    private String email;

    private String telephone;
    private TypeUtilisateur type; // INTERNE / EXTERNE
    private String matricule;
    private String organisme;
}

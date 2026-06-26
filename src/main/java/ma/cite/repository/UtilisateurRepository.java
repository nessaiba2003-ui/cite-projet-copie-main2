package ma.cite.repository;

import ma.cite.model.Role;
import ma.cite.model.TypeUtilisateur;
import ma.cite.model.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UtilisateurRepository extends JpaRepository<Utilisateur, Long> {
    Optional<Utilisateur> findByEmail(String email);

    Boolean existsByEmail(String email);

    List<Utilisateur> findByTypeAndActifTrue(TypeUtilisateur type);

    List<Utilisateur> findByRole(Role role);

}

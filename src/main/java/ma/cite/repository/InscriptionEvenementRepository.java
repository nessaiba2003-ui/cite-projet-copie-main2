package ma.cite.repository;

import ma.cite.model.InscriptionEvenement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface InscriptionEvenementRepository extends JpaRepository<InscriptionEvenement, Long> {

    List<InscriptionEvenement> findByEvenementId(Long evenementId);

    long countByEvenementId(Long evenementId);

    long countByNumeroInscriptionStartingWith(String prefix);

    boolean existsByEvenementIdAndEmail(Long evenementId, String email);

    Optional<InscriptionEvenement> findByTokenConfirmation(String tokenConfirmation);

    long countByDateInscriptionBetween(LocalDateTime debut, LocalDateTime fin);

    @org.springframework.data.jpa.repository.Query(
            "SELECT COALESCE(NULLIF(TRIM(i.etablissement), ''), 'Non renseigné'), COUNT(i) " +
            "FROM InscriptionEvenement i WHERE i.dateInscription >= :debut AND i.dateInscription <= :fin " +
            "GROUP BY COALESCE(NULLIF(TRIM(i.etablissement), ''), 'Non renseigné') ORDER BY COUNT(i) DESC")
    java.util.List<Object[]> findParticipationByEtablissement(
            @org.springframework.data.repository.query.Param("debut") LocalDateTime debut,
            @org.springframework.data.repository.query.Param("fin") LocalDateTime fin);
}

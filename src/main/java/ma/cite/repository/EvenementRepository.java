package ma.cite.repository;

import ma.cite.model.Evenement;
import ma.cite.model.StatutPublication;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EvenementRepository extends JpaRepository<Evenement, Long> {

    Page<Evenement> findByStatut(StatutPublication statut, Pageable pageable);

    List<Evenement> findByStatutAndDateExpirationBefore(StatutPublication statut, LocalDateTime date);

    List<Evenement> findByDateFinBefore(LocalDate date);

    long countByStatut(StatutPublication statut);
}

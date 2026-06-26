package ma.cite.repository;

import ma.cite.model.Annonce;
import ma.cite.model.StatutPublication;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AnnonceRepository extends JpaRepository<Annonce, Long> {

    Page<Annonce> findByStatutOrderByDatePublicationDesc(StatutPublication statut, Pageable pageable);

    List<Annonce> findByStatutAndDateExpirationBefore(StatutPublication statut, LocalDateTime date);

    List<Annonce> findByStatutAndDateExpirationAfter(StatutPublication statut, LocalDateTime date);

    List<Annonce> findByDateExpirationBeforeAndStatutNot(LocalDateTime date, StatutPublication statut);
}

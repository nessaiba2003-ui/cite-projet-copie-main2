package ma.cite.repository;

import ma.cite.model.Local;
import ma.cite.model.StatutLocal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LocalRepository extends JpaRepository<Local, Long>, JpaSpecificationExecutor<Local> {
    List<Local> findByStatut(StatutLocal statut);
    List<Local> findByPoleId(Long poleId);
}

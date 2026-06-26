package ma.cite.repository;

import jakarta.persistence.criteria.Predicate;
import ma.cite.dto.LocalFilterRequest;
import ma.cite.model.Local;
import ma.cite.model.StatutLocal;
import ma.cite.model.TypeLocal;
import ma.cite.model.DispositionLocale;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public final class LocalSpecification {

    private LocalSpecification() {}

    public static Specification<Local> fromFilter(LocalFilterRequest filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (filter == null) {
                return cb.conjunction();
            }

            if (filter.getPoleId() != null) {
                predicates.add(cb.equal(root.get("pole").get("id"), filter.getPoleId()));
            }
            if (filter.getTypeLocal() != null && !filter.getTypeLocal().isBlank()) {
                predicates.add(cb.equal(root.get("typeLocal"), TypeLocal.valueOf(filter.getTypeLocal())));
            }
            if (filter.getDisposition() != null && !filter.getDisposition().isBlank()) {
                predicates.add(cb.equal(root.get("disposition"), DispositionLocale.valueOf(filter.getDisposition())));
            }
            if (filter.getSearch() != null && !filter.getSearch().isBlank()) {
                String pattern = "%" + filter.getSearch().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("nom")), pattern),
                        cb.like(cb.lower(root.get("code")), pattern),
                        cb.like(cb.lower(root.get("localisation")), pattern)
                ));
            }
            if (Boolean.TRUE.equals(filter.getDisponibleOnly())) {
                predicates.add(cb.equal(root.get("statut"), StatutLocal.DISPONIBLE));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}

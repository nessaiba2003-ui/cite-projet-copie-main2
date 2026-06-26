package ma.cite.service;

import lombok.RequiredArgsConstructor;
import ma.cite.dto.PoleResponse;
import ma.cite.repository.PoleRepository;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PoleService {

    private final PoleRepository poleRepo;

    public List<PoleResponse> findAll() {
        return poleRepo.findAll().stream()
                .sorted(Comparator.comparing(p -> p.getOrdre() != null ? p.getOrdre() : 99))
                .map(p -> PoleResponse.builder()
                        .id(p.getId())
                        .code(p.getCode())
                        .nom(p.getNom())
                        .description(p.getDescription())
                        .couleur(p.getCouleur())
                        .ordre(p.getOrdre())
                        .build())
                .collect(Collectors.toList());
    }
}

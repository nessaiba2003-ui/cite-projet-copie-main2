package ma.cite.service;

import lombok.RequiredArgsConstructor;
import ma.cite.dto.CreneauOccupeResponse;
import ma.cite.dto.LocalFilterRequest;
import ma.cite.dto.LocalRequest;
import ma.cite.dto.LocalResponse;
import ma.cite.exception.BusinessException;
import ma.cite.exception.ResourceNotFoundException;
import ma.cite.model.*;
import ma.cite.repository.LocalRepository;
import ma.cite.repository.PoleRepository;
import ma.cite.repository.LocalSpecification;
import ma.cite.repository.ReservationRepository;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LocalService {

    private final LocalRepository localRepo;
    private final PoleRepository poleRepo;
    private final ReservationRepository reservationRepo;
    private final AcademicHolidayService academicHolidayService;

    public List<LocalResponse> findAllPublic() {
        return localRepo.findByStatut(StatutLocal.DISPONIBLE)
                .stream().map(l -> toResponse(l, false)).collect(Collectors.toList());
    }

    public List<LocalResponse> findAllForUser(Utilisateur user) {
        boolean isInterne = user != null && (TypeUtilisateur.INTERNE.equals(user.getType())
                || user.getRole() != Role.DEMANDEUR);
        List<Local> locaux = isInterne ? localRepo.findAll()
                : localRepo.findByStatut(StatutLocal.DISPONIBLE);
        return locaux.stream().map(l -> toResponse(l, isInterne)).collect(Collectors.toList());
    }

    public List<LocalResponse> search(LocalFilterRequest filter, Utilisateur user) {
        boolean isInterne = user != null && (TypeUtilisateur.INTERNE.equals(user.getType())
                || (user.getRole() != null && user.getRole() != Role.DEMANDEUR));
        LocalFilterRequest f = filter != null ? filter : new LocalFilterRequest();
        if (!isInterne) {
            f.setDisponibleOnly(true);
        }
        Specification<Local> spec = LocalSpecification.fromFilter(f);
        List<Local> locaux = localRepo.findAll(spec);

        if (f.getEquipements() != null && !f.getEquipements().isEmpty()) {
            locaux = locaux.stream()
                    .filter(l -> l.getEquipements() != null
                            && l.getEquipements().containsAll(f.getEquipements()))
                    .collect(Collectors.toList());
        }

        if (f.getDisponibleDebut() != null && f.getDisponibleFin() != null) {
            locaux = locaux.stream()
                    .filter(l -> checkDisponibilite(l.getId(), f.getDisponibleDebut(), f.getDisponibleFin()))
                    .collect(Collectors.toList());
        }

        return locaux.stream().map(l -> toResponse(l, isInterne)).collect(Collectors.toList());
    }

    public LocalResponse findById(Long id, Utilisateur user) {
        Local local = localRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Local", id));
        boolean isInterne = user != null && (TypeUtilisateur.INTERNE.equals(user.getType())
                || user.getRole() != Role.DEMANDEUR);
        return toResponse(local, isInterne);
    }

    public boolean checkDisponibilite(Long localId, LocalDateTime debut, LocalDateTime fin) {
        Local local = localRepo.findById(localId).orElse(null);
        if (local == null || local.getStatut() != StatutLocal.DISPONIBLE) {
            return false;
        }
        if (academicHolidayService.overlapsHoliday(debut, fin)) {
            return false;
        }
        return reservationRepo.findConflicts(localId, debut, fin).isEmpty();
    }

    public List<CreneauOccupeResponse> getCalendrierOccupation(Long localId, LocalDateTime debut, LocalDateTime fin) {
        if (!localRepo.existsById(localId)) {
            throw new ResourceNotFoundException("Local", localId);
        }
        return reservationRepo.findOccupiedSlots(localId, debut, fin).stream()
                .map(this::toCreneauOccupe)
                .collect(Collectors.toList());
    }

    private CreneauOccupeResponse toCreneauOccupe(Reservation r) {
        return CreneauOccupeResponse.builder()
                .dateDebut(r.getDateDebut())
                .dateFin(r.getDateFin())
                .statut(r.getStatut() != null ? r.getStatut().name() : null)
                .build();
    }

    @Transactional
    public LocalResponse create(LocalRequest req) {
        Local local = mapRequestToEntity(new Local(), req);
        local.setCode(req.getCode());
        return toResponse(localRepo.save(local), true);
    }

    @Transactional
    public LocalResponse update(Long id, LocalRequest req) {
        Local local = localRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Local", id));
        mapRequestToEntity(local, req);
        return toResponse(localRepo.save(local), true);
    }

    @Transactional
    public void delete(Long id) {
        if (!localRepo.existsById(id)) throw new ResourceNotFoundException("Local", id);
        localRepo.deleteById(id);
    }

    private Local mapRequestToEntity(Local local, LocalRequest req) {
        local.setNom(req.getNom());
        local.setCapacite(req.getCapacite());
        local.setDescription(req.getDescription());
        local.setLocalisation(req.getLocalisation());
        if (req.getEtage() != null) local.setEtage(req.getEtage());
        if (req.getVideoUrl() != null) local.setVideoUrl(req.getVideoUrl());
        if (req.getPanoramaUrl() != null) local.setPanoramaUrl(req.getPanoramaUrl());
        local.setRaisonIndisponibilite(req.getRaisonIndisponibilite());
        if (req.getImages() != null) local.setImages(req.getImages());
        if (req.getEquipements() != null) local.setEquipements(req.getEquipements());
        local.setTarifInterne(req.getTarifInterne());
        local.setTarifExterne(req.getTarifExterne());
        if (req.getStatut() != null) local.setStatut(StatutLocal.valueOf(req.getStatut()));
        if (req.getTypeLocal() != null && !req.getTypeLocal().isBlank()) {
            local.setTypeLocal(TypeLocal.valueOf(req.getTypeLocal()));
        }
        if (req.getDisposition() != null && !req.getDisposition().isBlank()) {
            local.setDisposition(DispositionLocale.valueOf(req.getDisposition()));
        }
        if (req.getPoleId() != null) {
            Pole pole = poleRepo.findById(req.getPoleId())
                    .orElseThrow(() -> new BusinessException("Pôle introuvable"));
            local.setPole(pole);
        }
        return local;
    }

    public LocalResponse toResponse(Local l, boolean showSensitive) {
        LocalResponse.LocalResponseBuilder b = LocalResponse.builder()
                .id(l.getId())
                .code(l.getCode())
                .nom(l.getNom())
                .capacite(l.getCapacite())
                .description(l.getDescription())
                .localisation(l.getLocalisation())
                .etage(l.getEtage())
                .videoUrl(l.getVideoUrl())
                .panoramaUrl(l.getPanoramaUrl())
                .statut(l.getStatut() != null ? l.getStatut().name() : null)
                .images(l.getImages())
                .equipements(l.getEquipements())
                .tarifInterne(l.getTarifInterne())
                .tarifExterne(l.getTarifExterne())
                .raisonIndisponibilite(showSensitive ? l.getRaisonIndisponibilite() : null)
                .typeLocal(l.getTypeLocal() != null ? l.getTypeLocal().name() : null)
                .disposition(l.getDisposition() != null ? l.getDisposition().name() : null);
        if (l.getPole() != null) {
            b.poleId(l.getPole().getId())
                    .poleCode(l.getPole().getCode())
                    .poleNom(l.getPole().getNom())
                    .poleCouleur(l.getPole().getCouleur());
        }
        return b.build();
    }
}

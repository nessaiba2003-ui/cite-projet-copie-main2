package ma.cite.service;

import lombok.RequiredArgsConstructor;
import ma.cite.dto.AnnonceRequest;
import ma.cite.dto.AnnonceResponse;
import ma.cite.exception.ResourceNotFoundException;
import ma.cite.model.Annonce;
import ma.cite.model.StatutPublication;
import ma.cite.model.Utilisateur;
import ma.cite.repository.AnnonceRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AnnonceService {

    private final AnnonceRepository annonceRepo;

    public Page<AnnonceResponse> findAllPublished(Pageable pageable) {
        return annonceRepo.findByStatutOrderByDatePublicationDesc(StatutPublication.PUBLIE, pageable)
                .map(this::toResponse);
    }

    public Page<AnnonceResponse> findAll(Pageable pageable) {
        return annonceRepo.findAll(pageable).map(this::toResponse);
    }

    public AnnonceResponse findById(Long id) {
        return toResponse(getOrThrow(id));
    }

    @Transactional
    public AnnonceResponse create(AnnonceRequest req, Utilisateur admin) {
        Annonce a = Annonce.builder()
                .titre(req.getTitre())
                .contenu(req.getContenu())
                .image(req.getImage())
                .pieceJointe(req.getPieceJointe())
                .dateExpiration(req.getDateExpiration())
                .statut(req.getStatut() != null ? ma.cite.model.StatutPublication.valueOf(req.getStatut()) : StatutPublication.BROUILLON)
                .priorite(req.getPriorite())
                .adminCreateur(admin)
                .build();

        if (StatutPublication.PUBLIE.equals(a.getStatut())) {
            a.setDatePublication(LocalDateTime.now());
        }

        return toResponse(annonceRepo.save(a));
    }

    @Transactional
    public AnnonceResponse update(Long id, AnnonceRequest req) {
        Annonce a = getOrThrow(id);
        a.setTitre(req.getTitre());
        a.setContenu(req.getContenu());
        a.setImage(req.getImage());
        a.setPieceJointe(req.getPieceJointe());
        a.setDateExpiration(req.getDateExpiration());
        a.setPriorite(req.getPriorite());
        if (req.getStatut() != null) {
            StatutPublication reqStatut = StatutPublication.valueOf(req.getStatut());
            if (a.getStatut() != StatutPublication.PUBLIE && reqStatut == StatutPublication.PUBLIE) {
                a.setDatePublication(LocalDateTime.now());
            }
            a.setStatut(reqStatut);
        }
        return toResponse(annonceRepo.save(a));
    }

    @Transactional
    public void delete(Long id) {
        if (!annonceRepo.existsById(id)) throw new ResourceNotFoundException("Annonce", id);
        annonceRepo.deleteById(id);
    }

    @Scheduled(fixedDelay = 3600000)
    @Transactional
    public void archiveExpired() {
        annonceRepo.findByStatutAndDateExpirationBefore(StatutPublication.PUBLIE, LocalDateTime.now())
                .forEach(a -> {
                    a.setStatut(StatutPublication.ARCHIVEE);
                    annonceRepo.save(a);
                });
    }

    private Annonce getOrThrow(Long id) {
        return annonceRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Annonce", id));
    }

    private AnnonceResponse toResponse(Annonce a) {
        return AnnonceResponse.builder()
                .id(a.getId())
                .titre(a.getTitre())
                .contenu(a.getContenu())
                .datePublication(a.getDatePublication())
                .dateExpiration(a.getDateExpiration())
                .image(a.getImage())
                .pieceJointe(a.getPieceJointe())
                .statut(a.getStatut())
                .priorite(a.getPriorite())
                .createurNom(a.getAdminCreateur() != null ? a.getAdminCreateur().getNom() + " " + a.getAdminCreateur().getPrenom() : null)
                .build();
    }
}

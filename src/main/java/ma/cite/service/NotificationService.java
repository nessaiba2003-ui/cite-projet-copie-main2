/*package ma.cite.service;

import lombok.RequiredArgsConstructor;
import ma.cite.dto.NotificationResponse;
import ma.cite.exception.ResourceNotFoundException;
import ma.cite.model.Notification;
import ma.cite.model.Utilisateur;
import ma.cite.repository.NotificationRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notifRepo;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public void create(Utilisateur user, String titre, String message, String type, String lienAction) {
        Notification n = Notification.builder()
                .utilisateur(user)
                .titre(titre)
                .message(message)
                .type(type)
                .lienAction(lienAction)
                .dateEnvoi(LocalDateTime.now())
                .lue(false)
                .build();
        notifRepo.save(n);
    }

    public List<NotificationResponse> getForUser(Long userId) {
        return notifRepo.findByUtilisateurIdOrderByDateEnvoiDesc(userId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public long countUnread(Long userId) {
        return notifRepo.countByUtilisateurIdAndLueFalse(userId);
    }

    @Transactional
    public void markAsRead(Long id, Long userId) {
        Notification n = notifRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", id));
        if (n.getUtilisateur().getId().equals(userId)) {
            n.setLue(true);
            n.setDateLecture(LocalDateTime.now());
            notifRepo.save(n);
        }
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        notifRepo.findByUtilisateurIdOrderByDateEnvoiDesc(userId)
                .stream().filter(n -> !n.getLue()).forEach(n -> {
                    n.setLue(true);
                    n.setDateLecture(LocalDateTime.now());
                    notifRepo.save(n);
                });
    }

    private NotificationResponse toResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .titre(n.getTitre())
                .message(n.getMessage())
                .type(n.getType())
                .dateEnvoi(n.getDateEnvoi())
                .lue(n.getLue())
                .lienAction(n.getLienAction())
                .build();
    }
}*/
package ma.cite.service;

import lombok.RequiredArgsConstructor;
import ma.cite.dto.NotificationResponse;
import ma.cite.exception.ResourceNotFoundException;
import ma.cite.model.Notification;
import ma.cite.model.Utilisateur;
import ma.cite.repository.NotificationRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notifRepo;
    private final SimpMessagingTemplate messagingTemplate; // ✅

    /** Crée une notification + PUSH temps réel au user via /topic/notifications/{userId} */
    @Transactional
    public NotificationResponse create(Utilisateur user, String titre, String message, String type, String lienAction) {
        Notification n = Notification.builder()
                .utilisateur(user)
                .titre(titre)
                .message(message)
                .type(type)
                .lienAction(lienAction)
                .dateEnvoi(LocalDateTime.now())
                .lue(false)
                .build();

        notifRepo.save(n);

        NotificationResponse payload = toResponse(n);

        // ✅ PUSH temps réel
        messagingTemplate.convertAndSend("/topic/notifications/" + user.getId(), payload);

        return payload;
    }

    public List<NotificationResponse> getForUser(Long userId) {
        return notifRepo.findByUtilisateurIdOrderByDateEnvoiDesc(userId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public long countUnread(Long userId) {
        return notifRepo.countByUtilisateurIdAndLueFalse(userId);
    }

    @Transactional
    public void markAsRead(Long id, Long userId) {
        Notification n = notifRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", id));
        if (n.getUtilisateur().getId().equals(userId)) {
            n.setLue(true);
            n.setDateLecture(LocalDateTime.now());
            notifRepo.save(n);
        }
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        notifRepo.findByUtilisateurIdOrderByDateEnvoiDesc(userId)
                .stream().filter(n -> !n.getLue())
                .forEach(n -> {
                    n.setLue(true);
                    n.setDateLecture(LocalDateTime.now());
                    notifRepo.save(n);
                });
    }

    private NotificationResponse toResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .titre(n.getTitre())
                .message(n.getMessage())
                .type(n.getType())
                .dateEnvoi(n.getDateEnvoi())
                .lue(n.getLue())
                .lienAction(n.getLienAction())
                .build();
    }
}
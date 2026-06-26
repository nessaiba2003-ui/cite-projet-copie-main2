/*package ma.cite.controller;

import lombok.RequiredArgsConstructor;
import ma.cite.dto.NotificationResponse;
import ma.cite.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/user/{idUser}")
    public ResponseEntity<List<NotificationResponse>> getMyNotifications(@PathVariable Long idUser) {
        return ResponseEntity.ok(notificationService.getForUser(idUser));
    }

    @PutMapping("/{id}/lire")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id, @RequestParam Long idUser) {
        notificationService.markAsRead(id, idUser);
        return ResponseEntity.ok().build();
    }
}*/

package ma.cite.controller;

import lombok.RequiredArgsConstructor;
import ma.cite.dto.NotificationResponse;
import ma.cite.security.CustomUserDetails;
import ma.cite.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    /**  Notifications du user connecté */
    @GetMapping("/me")
    public ResponseEntity<List<NotificationResponse>> getMyNotifications(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long userId = userDetails.getUtilisateur().getId();
        return ResponseEntity.ok(notificationService.getForUser(userId));
    }

    /** Nombre non lues */
    @GetMapping("/me/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long userId = userDetails.getUtilisateur().getId();
        return ResponseEntity.ok(Map.of("count", notificationService.countUnread(userId)));
    }

    /**  Marquer une notification comme lue */
    @PutMapping("/{id}/lire")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long userId = userDetails.getUtilisateur().getId();
        notificationService.markAsRead(id, userId);
        return ResponseEntity.ok().build();
    }

    /**  Marquer tout comme lu */
    @PutMapping("/me/lire-tout")
    public ResponseEntity<Void> markAllAsRead(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long userId = userDetails.getUtilisateur().getId();
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }
}

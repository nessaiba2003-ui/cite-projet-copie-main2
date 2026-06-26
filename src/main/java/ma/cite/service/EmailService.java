package ma.cite.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.cite.model.InscriptionEvenement;
import ma.cite.model.Reservation;
import ma.cite.model.Utilisateur;
import ma.cite.util.QrCodeUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.url:http://localhost:8080}")
    private String appUrl;

    private String getReservationToEmail(Reservation r) {
        if (r.getDemandeur() != null && r.getDemandeur().getEmail() != null) return r.getDemandeur().getEmail();
        return r.getDemandeurEmail();
    }

    private String getReservationPrenom(Reservation r) {
        if (r.getDemandeur() != null && r.getDemandeur().getPrenom() != null) return r.getDemandeur().getPrenom();
        return (r.getDemandeurPrenom() != null && !r.getDemandeurPrenom().isBlank()) ? r.getDemandeurPrenom() : "";
    }

    @Async
    public void sendReservationConfirmation(Reservation r) {
        String to = getReservationToEmail(r);
        if (to == null || to.isBlank()) return;

        String subject = "✅ Confirmation de votre réservation #" + r.getId();
        String prenom = getReservationPrenom(r);
        String body = buildHtml(
                "Réservation confirmée",
                "Bonjour " + (prenom.isBlank() ? "" : prenom) + ",",
                "Votre réservation du local <b>" + r.getLocal().getNom() + "</b> a été <b>validée</b>.",
                "Du " + r.getDateDebut() + " au " + r.getDateFin(),
                "#1e3a8a"
        );
        sendHtml(to, subject, body);
    }

    @Async
    public void sendReservationRejection(Reservation r) {
        String to = getReservationToEmail(r);
        if (to == null || to.isBlank()) return;

        String subject = "❌ Réservation #" + r.getId() + " refusée";
        String prenom = getReservationPrenom(r);
        String body = buildHtml(
                "Réservation refusée",
                "Bonjour " + (prenom.isBlank() ? "" : prenom) + ",",
                "Votre réservation du local <b>" + r.getLocal().getNom() + "</b> a été <b>refusée</b>.",
                "Motif : " + r.getMotifRejet(),
                "#dc2626"
        );
        sendHtml(to, subject, body);
    }

    @Async
    public void sendReservationCancellation(Reservation r) {
        String to = getReservationToEmail(r);
        if (to == null || to.isBlank()) return;

        String subject = "🚫 Réservation #" + r.getId() + " annulée";
        String prenom = getReservationPrenom(r);
        String body = buildHtml(
                "Réservation annulée",
                "Bonjour " + (prenom.isBlank() ? "" : prenom) + ",",
                "Votre réservation du local <b>" + r.getLocal().getNom() + "</b> a été annulée.",
                "Date : " + r.getDateDebut(),
                "#f97316"
        );
        sendHtml(to, subject, body);
    }

    @Async
    public void sendInscriptionConfirmation(InscriptionEvenement i) {
        String subject = "Inscription confirmée - " + i.getEvenement().getTitre();
        String confirmUrl = appUrl + "/inscriptions/confirm/" + i.getTokenConfirmation();
        String qrContent = "EVT:" + i.getNumeroInscription() + "|" + i.getEmail();
        String qrBase64 = QrCodeUtil.generateBase64Png(qrContent, 200);
        String qrImg = qrBase64 != null
                ? "<p><img src='data:image/png;base64," + qrBase64 + "' alt='QR Code' style='width:180px;height:180px'/></p>"
                : "";
        String body = buildHtml(
                "Inscription à l'événement",
                "Bonjour " + i.getPrenom() + " " + i.getNom() + ",",
                "Votre inscription à l'événement <b>" + i.getEvenement().getTitre() + "</b> est enregistrée.",
                "N° inscription : <b>" + i.getNumeroInscription() + "</b><br>" +
                        qrImg +
                        "<a href='" + confirmUrl + "'>Confirmer ma présence</a>",
                "#1e3a8a"
        );
        sendHtml(i.getEmail(), subject, body);
    }

    @Async
    public void sendPasswordReset(Utilisateur user, String token) {
        String resetUrl = appUrl + "/reset-password?token=" + token;
        String body = buildHtml(
                "Réinitialisation du mot de passe",
                "Bonjour " + user.getPrenom() + ",",
                "Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe.",
                "<a href='" + resetUrl + "'>Réinitialiser mon mot de passe</a>",
                "#1e3a8a"
        );
        sendHtml(user.getEmail(), "🔑 Réinitialisation mot de passe - CIM UCA", body);
    }

    /*private void sendHtml(String to, String subject, String htmlBody) {
        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(msg);
            log.info("Email envoyé à {}", to);
        } catch (MessagingException e) {
            log.error("Erreur envoi email à {}: {}", to, e.getMessage());
        }
    }*/

    private void sendHtml(String to, String subject, String htmlBody) {
        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(msg);
            log.info("Email envoyé à {}", to);
        } catch (MailException | MessagingException e) {
            log.error("Erreur envoi email à {}: {}", to, e.getMessage(), e);
        }
    }



    private String buildHtml(String title, String greeting, String message, String detail, String color) {
        return "<!DOCTYPE html><html><body style='font-family:Poppins,sans-serif;background:#f8fafc;padding:20px'>" +
                "<div style='max-width:600px;margin:auto;background:#fff;border-radius:8px;overflow:hidden'>" +
                "<div style='background:" + color + ";padding:20px;text-align:center'>" +
                "<h2 style='color:#fff;margin:0'>Cité d'Innovation UCA</h2></div>" +
                "<div style='padding:30px'><h3 style='color:" + color + "'>" + title + "</h3>" +
                "<p>" + greeting + "</p><p>" + message + "</p><p>" + detail + "</p></div>" +
                "<div style='background:#f1f5f9;padding:15px;text-align:center;font-size:12px;color:#64748b'>" +
                "© 2026 Cité d'Innovation UCA | <a href='" + appUrl + "'>Visiter le site</a></div></div>" +
                "</body></html>";
    }
}
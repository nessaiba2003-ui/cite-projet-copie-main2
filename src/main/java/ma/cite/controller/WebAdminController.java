package ma.cite.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/admin")
@PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN_RES', 'ADMIN_EVT')")
public class WebAdminController {

    @GetMapping("/dashboard")
    public String dashboard(Model model) {
        model.addAttribute("title", "Dashboard Admin");
        return "dashboard-admin";
    }

    @GetMapping("/locaux")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN_RES')")
    public String locaux(Model model) {
        model.addAttribute("title", "Gestion des Locaux");
        return "admin-locaux";
    }

    @GetMapping("/reservations")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN_RES')")
    public String reservations(Model model) {
        model.addAttribute("title", "Gestion des Réservations");
        return "admin-reservations";
    }

    @GetMapping("/evenements")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN_EVT')")
    public String evenements(Model model) {
        model.addAttribute("title", "Gestion des Événements");
        return "admin-evenements";
    }

    @GetMapping("/annonces")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN_EVT')")
    public String annonces(Model model) {
        model.addAttribute("title", "Gestion des Annonces");
        return "admin-annonces";
    }

    @GetMapping("/demandeurs")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN_RES')")
    public String demandeurs(Model model) {
        model.addAttribute("title", "Gestion des Demandeurs");
        return "admin-demandeurs";
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN_RES')")
    public String stats(Model model) {
        model.addAttribute("title", "Statistiques");
        return "admin-stats";
    }
}

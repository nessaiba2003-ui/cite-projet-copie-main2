package ma.cite.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/demandeur")
@PreAuthorize("hasRole('DEMANDEUR')")
public class WebDemandeurController {

    @GetMapping("/dashboard")
    public String dashboard(Model model) {
        model.addAttribute("title", "Mon Espace");
        return "dashboard-demandeur";
    }

    @GetMapping("/locaux")
    public String locaux(Model model) {
        model.addAttribute("title", "Les Locaux");
        return "locaux";
    }

    @GetMapping("/locaux/{id}")
    public String localDetail(@PathVariable Long id, Model model) {
        model.addAttribute("localId", id);
        return "local-detail";
    }

    @GetMapping("/reservations/nouvelle")
    public String nouvelleReservation(Model model) {
        model.addAttribute("title", "Nouvelle Réservation");
        return "reservation-form";
    }

    @GetMapping("/mes-reservations")
    public String mesReservations(Model model) {
        model.addAttribute("title", "Mes Réservations");
        return "mes-reservations";
    }
}

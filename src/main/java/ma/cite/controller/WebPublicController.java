package ma.cite.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class WebPublicController {

    @GetMapping("/")
    public String index(Model model) {
        model.addAttribute("title", "Accueil - Cité d'Innovation UCA");
        return "index";
    }

    @GetMapping("/annonces")
    public String annonces(Model model) {
        model.addAttribute("title", "Annonces");
        return "annonces";
    }

    @GetMapping("/evenements")
    public String evenements(Model model) {
        model.addAttribute("title", "Événements");
        return "evenements";
    }

    @GetMapping("/evenements/{id}")
    public String evenementDetail(@PathVariable Long id, Model model) {
        model.addAttribute("eventId", id);
        return "evenement-detail";
    }

    @GetMapping("/evenements/{id}/inscription")
    public String inscriptionEvenement(@PathVariable Long id, Model model) {
        model.addAttribute("eventId", id);
        return "inscription-evenement";
    }

    @GetMapping("/inscriptions/confirm/{token}")
    public String confirmInscription(@PathVariable String token, Model model) {
        model.addAttribute("token", token);
        return "confirmation-inscription";
    }

    @GetMapping("/login")
    public String login(@RequestParam(value = "error", required = false) String error,
                        @RequestParam(value = "logout", required = false) String logout,
                        Model model) {
        if (error != null) {
            model.addAttribute("errorMessage", "Email ou mot de passe incorrect.");
        }
        if (logout != null) {
            model.addAttribute("successMessage", "Vous avez été déconnecté avec succès.");
        }
        return "login";
    }

    @GetMapping("/register")
    public String register() {
        return "register";
    }

    @GetMapping("/access-denied")
    public String accessDenied() {
        return "access-denied";
    }
}

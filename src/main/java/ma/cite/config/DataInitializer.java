package ma.cite.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.cite.model.*;
import ma.cite.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UtilisateurRepository userRepo;
    private final LocalRepository localRepo;
    private final EquipementRepository equipementRepo;
    private final EvenementRepository evtRepo;
    private final AnnonceRepository annonceRepo;
    private final PoleRepository poleRepo;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepo.count() > 0) {
            log.info("Base de données déjà initialisée.");
            return;
        }

        log.info("Initialisation des données...");

        Utilisateur adminRes = createUser("Réservation", "Admin", "reservation@uca.ma", "res123", Role.ADMIN_RES, null);
        Utilisateur adminEvt = createUser("Événements", "Admin", "evenement@uca.ma", "evt123", Role.ADMIN_EVT, null);

        // Equipements
        equipementRepo.save(Equipement.builder().nom("Vidéoprojecteur").description("Projecteur HD").disponible(true).build());
        equipementRepo.save(Equipement.builder().nom("Wifi Haut Débit").description("Routeur fibre").disponible(true).build());
        equipementRepo.save(Equipement.builder().nom("Tableau Interactif").description("Écran tactile").disponible(true).build());
        equipementRepo.save(Equipement.builder().nom("Chromatographe").description("Analyse chromatographique").disponible(true).build());
        equipementRepo.save(Equipement.builder().nom("Spectroscope").description("Spectroscopie").disponible(true).build());

        // Poles
        Pole poleValorisation = poleRepo.save(Pole.builder()
                .code("VALORISATION").ordre(1).couleur("#00A3E0")
                .nom("Valorisation & Transfert de Technologies")
                .description("Propriété intellectuelle et maturation technologique").build());
        Pole poleIncubation = poleRepo.save(Pole.builder()
                .code("INCUBATION").ordre(2).couleur("#78B82A")
                .nom("Incubation & Entrepreneuriat")
                .description("Accompagnement startups et compétences entrepreneuriales").build());
        Pole poleRd = poleRepo.save(Pole.builder()
                .code("RD").ordre(3).couleur("#C5005E")
                .nom("Plateformes d'Appui à la R&D et Prototypage")
                .description("Laboratoires, imagerie et prototypage").build());
        Pole poleTransverse = poleRepo.save(Pole.builder()
                .code("TRANSVERSE").ordre(4).couleur("#EAAA00")
                .nom("Services Transverses")
                .description("Administration, communication et partenariats").build());

        // Locaux (inchangé)
        localRepo.save(Local.builder().code("CONF-01").nom("Salle de Conférence Principale").capacite(200)
                .description("Grande salle polyvalente").localisation("RDC").etage(0)
                .tarifInterne(500.0).tarifExterne(1500.0).statut(StatutLocal.DISPONIBLE)
                .images(List.of("https://images.unsplash.com/photo-1497366216548-37526070297c?w=800"))
                .videoUrl("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4")
                .panoramaUrl("https://pannellum.org/images/alma.jpg")
                .pole(poleTransverse).typeLocal(TypeLocal.SALLE_CONFERENCE).disposition(DispositionLocale.THEATRE)
                .equipements(List.of("Vidéoprojecteur", "Wifi Haut Débit", "Tableau Interactif"))
                .build());

        localRepo.save(Local.builder().code("MEET-01").nom("Salle de Réunion A").capacite(20)
                .description("Réunion moderne").localisation("1er Étage").etage(1)
                .tarifInterne(100.0).tarifExterne(300.0).statut(StatutLocal.DISPONIBLE)
                .images(List.of("https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800"))
                .videoUrl("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4")
                .panoramaUrl("https://pannellum.org/images/cerro-toco-0.jpg")
                .pole(poleIncubation).typeLocal(TypeLocal.SALLE_REUNION).disposition(DispositionLocale.U)
                .equipements(List.of("Vidéoprojecteur", "Wifi Haut Débit"))
                .build());

        localRepo.save(Local.builder().code("COW-01").nom("Espace Coworking").capacite(50)
                .description("Espace collaboratif").localisation("2ème Étage").etage(2)
                .tarifInterne(50.0).tarifExterne(100.0).statut(StatutLocal.DISPONIBLE)
                .images(List.of("https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800"))
                .videoUrl("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4")
                .panoramaUrl("https://pannellum.org/images/alma.jpg")
                .pole(poleIncubation).typeLocal(TypeLocal.COWORKING).disposition(DispositionLocale.LIBRE)
                .equipements(List.of("Wifi Haut Débit"))
                .build());

        localRepo.save(Local.builder().code("LAB-01").nom("Laboratoire Innovation").capacite(30)
                .description("Labo équipé").localisation("Sous-sol").etage(-1)
                .tarifInterne(200.0).tarifExterne(600.0).statut(StatutLocal.MAINTENANCE)
                .raisonIndisponibilite("Maintenance équipements")
                .images(List.of("https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800"))
                .pole(poleRd).typeLocal(TypeLocal.LABORATOIRE).disposition(DispositionLocale.CLASSE)
                .equipements(List.of("Chromatographe", "Spectroscope", "Wifi Haut Débit"))
                .build());

        localRepo.save(Local.builder().code("AMPH-01").nom("Amphithéâtre").capacite(350)
                .description("Grand amphithéâtre").localisation("R+2").etage(3)
                .tarifInterne(800.0).tarifExterne(2500.0).statut(StatutLocal.DISPONIBLE)
                .images(List.of("https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800"))
                .videoUrl("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4")
                .panoramaUrl("https://pannellum.org/images/cerro-toco-0.jpg")
                .pole(poleValorisation).typeLocal(TypeLocal.AMPHITHEATRE).disposition(DispositionLocale.THEATRE)
                .equipements(List.of("Vidéoprojecteur", "Wifi Haut Débit"))
                .build());

        localRepo.save(Local.builder().code("ATEL-01").nom("Atelier Makerspace").capacite(25)
                .description("Atelier fermé temporairement").localisation("Annexe").etage(4)
                .tarifInterne(150.0).tarifExterne(400.0).statut(StatutLocal.HORS_SERVICE)
                .raisonIndisponibilite("Rénovation en cours")
                .images(List.of("https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800"))
                .pole(poleRd).typeLocal(TypeLocal.ATELIER).disposition(DispositionLocale.LIBRE)
                .equipements(List.of("Wifi Haut Débit"))
                .build());

        // Events (inchangé, adminEvt)
        evtRepo.save(Evenement.builder()
                .titre("Hackathon Innovation 2026")
                .description("Hackathon IA et innovation")
                .contenu("<p>Participez au hackathon UCA</p>")
                .dateDebut(LocalDateTime.now().plusDays(10)).dateFin(LocalDateTime.now().plusDays(12))
                .lieu("Cité d'Innovation - Salle de Conférence")
                .nombrePlacesLimitee(true).nombrePlacesMax(100)
                .statut(StatutPublication.PUBLIE).datePublication(LocalDateTime.now())
                .dateExpiration(LocalDateTime.now().plusDays(12))
                .adminCreateur(adminEvt).build());

        annonceRepo.save(Annonce.builder()
                .titre("Fermeture exceptionnelle pour maintenance")
                .contenu("<p>Fermeture ce week-end pour maintenance réseau.</p>")
                .statut(StatutPublication.PUBLIE).datePublication(LocalDateTime.now())
                .dateExpiration(LocalDateTime.now().plusDays(2))
                .priorite("IMPORTANT").adminCreateur(adminEvt).pole(poleRd).build());

        log.info("Initialisation terminée — comptes admins: reservation@uca.ma / res123  |  evenement@uca.ma / evt123");
    }

    private Utilisateur createUser(String prenom, String nom, String email, String password, Role role, TypeUtilisateur type) {
        return userRepo.save(Utilisateur.builder()
                .prenom(prenom).nom(nom).email(email)
                .password(passwordEncoder.encode(password))
                .role(role).type(type).actif(true)
                .dateCreation(LocalDateTime.now()).build());
    }
}
package ma.cite.security;

import lombok.RequiredArgsConstructor;
import ma.cite.model.Utilisateur;
import ma.cite.repository.UtilisateurRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UtilisateurRepository utilisateurRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // On cherche l'utilisateur par email dans la base
        Utilisateur utilisateur = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé avec l'email : " + email));

        // On l'enveloppe dans notre CustomUserDetails pour que Spring Security le
        // comprenne
        return new CustomUserDetails(utilisateur);
    }
}

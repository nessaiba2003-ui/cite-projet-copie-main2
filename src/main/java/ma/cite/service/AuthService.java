package ma.cite.service;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.cite.dto.AuthResponse;
import ma.cite.dto.LoginRequest;
import ma.cite.dto.RegisterRequest;
import ma.cite.exception.BusinessException;
import ma.cite.model.Role;
import ma.cite.model.TypeUtilisateur;
import ma.cite.model.Utilisateur;
import ma.cite.repository.UtilisateurRepository;
import ma.cite.security.CustomUserDetails;
import ma.cite.util.JwtUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UtilisateurRepository userRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authManager;

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (userRepo.existsByEmail(req.getEmail())) {
            throw new BusinessException("Un compte avec cet email existe déjà");
        }
        Utilisateur user = Utilisateur.builder()
                .email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))
                .nom(req.getNom())
                .prenom(req.getPrenom())
                .telephone(req.getTelephone())
                .role(Role.DEMANDEUR)
                .type(req.getType() != null ? TypeUtilisateur.valueOf(req.getType()) : null)
                .matricule(req.getMatricule())
                .organisme(req.getOrganisme())
                .actif(true)
                .dateCreation(LocalDateTime.now())
                .build();
        userRepo.save(user);
        log.info("Nouveau demandeur enregistré: {}", user.getEmail());

        var details = new CustomUserDetails(user);
        return buildResponse(user, jwtUtil.generateToken(details));
    }

    @Transactional
    public AuthResponse login(LoginRequest req, HttpServletResponse response) {
        authManager.authenticate(new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword()));
        Utilisateur user = userRepo.findByEmail(req.getEmail()).orElseThrow();
        user.setDerniereConnexion(LocalDateTime.now());
        userRepo.save(user);

        var details = new CustomUserDetails(user);
        String accessToken = jwtUtil.generateToken(details);

        Cookie cookie = new Cookie("access_token", accessToken);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(86400);
        response.addCookie(cookie);

        return buildResponse(user, accessToken);
    }

    public void logout(HttpServletResponse response) {
        Cookie cookie = new Cookie("access_token", "");
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
    }

    public AuthResponse refreshToken(String refreshToken) {
        String email = jwtUtil.extractUsername(refreshToken);
        Utilisateur user = userRepo.findByEmail(email)
                .orElseThrow(() -> new BusinessException("Token invalide"));
        var details = new CustomUserDetails(user);
        if (!jwtUtil.isTokenValid(refreshToken, details)) {
            throw new BusinessException("Refresh token expiré");
        }
        return buildResponse(user, jwtUtil.generateToken(details));
    }

    private AuthResponse buildResponse(Utilisateur user, String access) {
        return AuthResponse.builder()
                .token(access)
                .role(user.getRole() != null ? user.getRole().name() : null)
                .nomComplet(user.getNom() + " " + user.getPrenom())
                .build();
    }
}

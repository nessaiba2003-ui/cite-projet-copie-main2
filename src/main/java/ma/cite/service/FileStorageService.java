package ma.cite.service;

import ma.cite.exception.BusinessException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.Set;
import java.util.UUID;

@Service
public class FileStorageService {

    private static final Set<String> ALLOWED_IMAGES =
            Set.of("image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif", "image/pjpeg");

    private static final Set<String> ALLOWED_VIDEOS =
            Set.of("video/mp4", "video/webm", "video/ogg");

    private static final Set<String> ALLOWED_RESERVATIONS =
            Set.of("image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif", "application/pdf");

    private final Path uploadRoot;

    public FileStorageService(@Value("${app.upload.dir:uploads}") String uploadDir) throws IOException {
        this.uploadRoot = Paths.get(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(uploadRoot);
    }

    public String store(MultipartFile file, String subfolder) {
        if (file == null || file.isEmpty()) throw new BusinessException("Fichier vide");

        String contentType = file.getContentType(); // peut être null ou octet-stream
        String original = (file.getOriginalFilename() != null) ? file.getOriginalFilename().toLowerCase() : "";

        Set<String> allowed;
        if ("reservations".equalsIgnoreCase(subfolder)) allowed = ALLOWED_RESERVATIONS;
        else if ("locaux_videos".equalsIgnoreCase(subfolder)) allowed = ALLOWED_VIDEOS;
        else allowed = ALLOWED_IMAGES;

        boolean typeOk = contentType != null && allowed.contains(contentType);

        if (!typeOk) {
            boolean extOk = switch (subfolder.toLowerCase()) {
                case "locaux_videos" -> original.endsWith(".mp4") || original.endsWith(".webm") || original.endsWith(".ogg");
                case "reservations" -> original.endsWith(".pdf") || original.endsWith(".png") || original.endsWith(".jpg")
                        || original.endsWith(".jpeg") || original.endsWith(".webp") || original.endsWith(".gif");
                default -> original.endsWith(".png") || original.endsWith(".jpg") || original.endsWith(".jpeg")
                        || original.endsWith(".webp") || original.endsWith(".gif") || original.endsWith(".jfif");
            };
            if (!extOk) {
                throw new BusinessException("Type de fichier non autorisé");
            }
        }

        try {
            Path folder = uploadRoot.resolve(subfolder);
            Files.createDirectories(folder);

            String ext;
            if (original.endsWith(".pdf")) ext = ".pdf";
            else if (original.endsWith(".png")) ext = ".png";
            else if (original.endsWith(".webp")) ext = ".webp";
            else if (original.endsWith(".gif")) ext = ".gif";
            else if (original.endsWith(".mp4")) ext = ".mp4";
            else if (original.endsWith(".webm")) ext = ".webm";
            else if (original.endsWith(".ogg")) ext = ".ogg";
            else ext = ".jpg"; // jpg/jpeg/jfif

            String filename = UUID.randomUUID() + ext;
            Path target = folder.resolve(filename);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

            return "/uploads/" + subfolder + "/" + filename;

        } catch (IOException e) {
            throw new BusinessException("Échec de l'upload: " + e.getMessage());
        }
    }
}
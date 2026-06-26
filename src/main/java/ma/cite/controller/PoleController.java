package ma.cite.controller;

import lombok.RequiredArgsConstructor;
import ma.cite.dto.PoleResponse;
import ma.cite.service.PoleService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/poles")
@RequiredArgsConstructor
public class PoleController {

    private final PoleService poleService;

    @GetMapping
    public ResponseEntity<List<PoleResponse>> getAll() {
        return ResponseEntity.ok(poleService.findAll());
    }
}

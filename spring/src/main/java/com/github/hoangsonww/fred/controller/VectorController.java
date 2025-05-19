package com.github.hoangsonww.fred.controller;

import com.github.hoangsonww.fred.model.VectorEntry;
import com.github.hoangsonww.fred.service.VectorService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/vector")
public class VectorController {
    private final VectorService service;
    public VectorController(VectorService service) { this.service = service; }

    @GetMapping("/all")
    public List<VectorEntry> all() { return service.all(); }

    @PostMapping("/upsert")
    public VectorEntry upsert(@RequestParam String seriesId,
                              @RequestBody List<Double> vector) {
        return service.upsert(seriesId, vector);
    }
}

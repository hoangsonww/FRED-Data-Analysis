package com.github.hoangsonww.fred.controller;

import com.github.hoangsonww.fred.model.FredSeries;
import com.github.hoangsonww.fred.service.FredService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/fred")
public class FredController {
    private final FredService service;
    public FredController(FredService service) { this.service = service; }

    @GetMapping("/all")
    public List<FredSeries> all() { return service.all(); }

    @PostMapping("/fetch/{seriesId}")
    public FredSeries fetch(@PathVariable String seriesId) {
        return service.fetchSeries(seriesId);
    }
}

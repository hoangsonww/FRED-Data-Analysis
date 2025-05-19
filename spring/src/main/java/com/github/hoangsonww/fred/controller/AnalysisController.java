package com.github.hoangsonww.fred.controller;

import com.github.hoangsonww.fred.model.AnalysisReport;
import com.github.hoangsonww.fred.service.AnalysisService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analysis")
public class AnalysisController {
    private final AnalysisService service;
    public AnalysisController(AnalysisService service) { this.service = service; }

    @PostMapping("/{seriesId}/{type}")
    public AnalysisReport analyze(@PathVariable String seriesId,
                                  @PathVariable String type) {
        return service.analyze(seriesId, type);
    }
}

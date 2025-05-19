package com.github.hoangsonww.fred.service;

import com.github.hoangsonww.fred.model.AnalysisReport;
import com.github.hoangsonww.fred.repository.AnalysisReportRepository;
import org.springframework.stereotype.Service;
import java.util.Date;

@Service
public class AnalysisService {
    private final AnalysisReportRepository repo;
    public AnalysisService(AnalysisReportRepository repo) { this.repo = repo; }

    public AnalysisReport analyze(String seriesId, String type) {
        // TODO: perform regression, create plots
        String content = "Analysis for " + seriesId + " (" + type + ")";
        AnalysisReport r = AnalysisReport.builder()
            .seriesId(seriesId)
            .reportType(type)
            .reportContent(content)
            .createdAt(new Date())
            .build();
        return repo.save(r);
    }
}

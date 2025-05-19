package com.github.hoangsonww.fred.service;

import com.github.hoangsonww.fred.model.FredSeries;
import com.github.hoangsonww.fred.repository.FredSeriesRepository;
import org.springframework.stereotype.Service;
import java.util.Date;
import java.util.List;

@Service
public class FredService {
    private final FredSeriesRepository repo;
    public FredService(FredSeriesRepository repo) { this.repo = repo; }

    public FredSeries fetchSeries(String seriesId) {
        // TODO: call FRED API, parse data
        FredSeries s = FredSeries.builder()
            .seriesId(seriesId)
            .values(List.of())
            .fetchedAt(new Date())
            .build();
        return repo.save(s);
    }
    public List<FredSeries> all() { return repo.findAll(); }
}

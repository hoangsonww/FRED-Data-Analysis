package com.github.hoangsonww.fred.service;

import com.github.hoangsonww.fred.model.VectorEntry;
import com.github.hoangsonww.fred.repository.VectorEntryRepository;
import org.springframework.stereotype.Service;
import java.util.Date;
import java.util.List;

@Service
public class VectorService {
    private final VectorEntryRepository repo;
    public VectorService(VectorEntryRepository repo) { this.repo = repo; }

    public VectorEntry upsert(String seriesId, List<Double> vector) {
        VectorEntry e = VectorEntry.builder()
            .seriesId(seriesId)
            .vector(vector)
            .upsertedAt(new Date())
            .build();
        return repo.save(e);
    }
    public List<VectorEntry> all() { return repo.findAll(); }
}

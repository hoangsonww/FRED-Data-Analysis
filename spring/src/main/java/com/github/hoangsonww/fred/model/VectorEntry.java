package com.github.hoangsonww.fred.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;
import java.util.List;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
@Document(collection="vector_entries")
public class VectorEntry {
    @Id
    private String id;
    private String seriesId;
    private List<Double> vector;
    private Date upsertedAt;
}

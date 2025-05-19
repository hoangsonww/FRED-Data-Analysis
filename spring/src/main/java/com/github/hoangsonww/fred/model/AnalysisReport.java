package com.github.hoangsonww.fred.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
@Document(collection="analysis_reports")
public class AnalysisReport {
    @Id
    private String id;
    private String seriesId;
    private String reportType;
    private String reportContent;
    private Date createdAt;
}

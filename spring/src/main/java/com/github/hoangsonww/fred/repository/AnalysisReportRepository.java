package com.github.hoangsonww.fred.repository;

import com.github.hoangsonww.fred.model.AnalysisReport;
import org.springframework.data.mongodb.repository.MongoRepository;
public interface AnalysisReportRepository extends MongoRepository<AnalysisReport, String> {}

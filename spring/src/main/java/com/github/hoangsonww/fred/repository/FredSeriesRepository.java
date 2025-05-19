package com.github.hoangsonww.fred.repository;

import com.github.hoangsonww.fred.model.FredSeries;
import org.springframework.data.mongodb.repository.MongoRepository;
public interface FredSeriesRepository extends MongoRepository<FredSeries, String> {}

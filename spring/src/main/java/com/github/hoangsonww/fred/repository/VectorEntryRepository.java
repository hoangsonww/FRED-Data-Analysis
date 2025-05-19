package com.github.hoangsonww.fred.repository;

import com.github.hoangsonww.fred.model.VectorEntry;
import org.springframework.data.mongodb.repository.MongoRepository;
public interface VectorEntryRepository extends MongoRepository<VectorEntry, String> {}

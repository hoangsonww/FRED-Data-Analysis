package com.github.hoangsonww.fred.repository;

import com.github.hoangsonww.fred.model.ChatMessage;
import org.springframework.data.mongodb.repository.MongoRepository;
public interface ChatMessageRepository extends MongoRepository<ChatMessage, String> {}

package com.github.hoangsonww.fred.service;

import com.github.hoangsonww.fred.model.ChatMessage;
import com.github.hoangsonww.fred.repository.ChatMessageRepository;
import org.springframework.stereotype.Service;
import java.util.Date;

@Service
public class ChatService {
    private final ChatMessageRepository repo;
    public ChatService(ChatMessageRepository repo) { this.repo = repo; }

    public ChatMessage chat(String sessionId, String userInput) {
        // TODO: call vector DB + AI
        String bot = "This is a placeholder response.";
        ChatMessage m = ChatMessage.builder()
            .sessionId(sessionId)
            .userInput(userInput)
            .botResponse(bot)
            .timestamp(new Date())
            .build();
        return repo.save(m);
    }
}

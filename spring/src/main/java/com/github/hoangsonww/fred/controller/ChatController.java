package com.github.hoangsonww.fred.controller;

import com.github.hoangsonww.fred.model.ChatMessage;
import com.github.hoangsonww.fred.service.ChatService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
public class ChatController {
    private final ChatService service;
    public ChatController(ChatService service) { this.service = service; }

    @PostMapping
    public ChatMessage chat(@RequestParam String sessionId,
                            @RequestBody String userInput) {
        return service.chat(sessionId, userInput);
    }
}

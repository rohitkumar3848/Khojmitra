package com.khojmitra.controller;

import com.khojmitra.dto.ApiResponse;
import com.khojmitra.model.ChatMessage;
import com.khojmitra.model.User;
import com.khojmitra.service.AuthService;
import com.khojmitra.service.ChatService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final AuthService authService;

    @GetMapping("/{claimId}")
    public ResponseEntity<ApiResponse<List<ChatMessage>>> getMessages(@PathVariable String claimId) {
        User currentUser = authService.getCurrentUser();
        List<ChatMessage> messages = chatService.getMessages(claimId, currentUser);
        return ResponseEntity.ok(ApiResponse.ok("Chat messages retrieved", messages));
    }

    @PostMapping("/{claimId}")
    public ResponseEntity<ApiResponse<ChatMessage>> sendMessage(
            @PathVariable String claimId,
            @RequestBody SendMessageRequest request
    ) {
        User currentUser = authService.getCurrentUser();
        ChatMessage msg = chatService.sendMessage(claimId, request.getContent(), currentUser);
        return ResponseEntity.ok(ApiResponse.ok("Message sent", msg));
    }

    @MessageMapping("/chat.send")
    public void handleWebSocketMessage(@Payload WsChatMessageDto payload) {
        // Handled through WebSocket client if needed, or via REST + STOMP broadcast
    }

    @Data
    public static class SendMessageRequest {
        private String content;
    }

    @Data
    public static class WsChatMessageDto {
        private String claimId;
        private String content;
        private String senderId;
    }
}

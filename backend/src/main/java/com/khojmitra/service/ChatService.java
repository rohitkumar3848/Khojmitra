package com.khojmitra.service;

import com.khojmitra.model.ChatMessage;
import com.khojmitra.model.Claim;
import com.khojmitra.model.Role;
import com.khojmitra.model.User;
import com.khojmitra.repository.ChatMessageRepository;
import com.khojmitra.repository.ClaimRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final ClaimRepository claimRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public List<ChatMessage> getMessages(String claimId, User user) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new IllegalArgumentException("Claim not found"));

        boolean isAllowed = claim.getClaimantId().equals(user.getId())
                || claim.getFinderId().equals(user.getId())
                || user.getRoles().contains(Role.ROLE_ADMIN);

        if (!isAllowed) {
            throw new SecurityException("Not authorized to view messages for this claim.");
        }

        return chatMessageRepository.findByClaimIdOrderByTimestampAsc(claimId);
    }

    public ChatMessage sendMessage(String claimId, String content, User sender) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new IllegalArgumentException("Claim not found"));

        boolean isAllowed = claim.getClaimantId().equals(sender.getId())
                || claim.getFinderId().equals(sender.getId())
                || sender.getRoles().contains(Role.ROLE_ADMIN);

        if (!isAllowed) {
            throw new SecurityException("Not authorized to send messages for this claim.");
        }

        String receiverId = claim.getClaimantId().equals(sender.getId())
                ? claim.getFinderId()
                : claim.getClaimantId();

        ChatMessage message = ChatMessage.builder()
                .claimId(claimId)
                .senderId(sender.getId())
                .senderName(sender.getName())
                .receiverId(receiverId)
                .content(content.trim())
                .timestamp(LocalDateTime.now())
                .isSystemMessage(false)
                .build();

        ChatMessage saved = chatMessageRepository.save(message);

        // Broadcast to WebSocket topic: /topic/claim/{claimId}
        try {
            messagingTemplate.convertAndSend("/topic/claim/" + claimId, saved);
        } catch (Exception e) {
            // log error if websocket broadcast encounters issue
        }

        return saved;
    }
}

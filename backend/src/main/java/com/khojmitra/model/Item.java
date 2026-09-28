package com.khojmitra.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "items")
public class Item {

    @Id
    private String id;

    private String title;
    private String description;
    private String category; // Electronics, Wallet & Bags, Keys, Cards & IDs, Accessories, Documents, Other

    private ItemType type; // LOST or FOUND

    private Location location;

    private String imageUrl; // Base64 data URL or external URL

    private LocalDate date; // Date when lost or found

    @Builder.Default
    private ItemStatus status = ItemStatus.PENDING_APPROVAL;

    private String centralDropLocation; // e.g. "Tower B - Ground Floor Security Desk"

    private String userId; // User who posted the item
    private String posterName;
    private String posterEmail;

    private String claimedByUserId; // User who successfully claimed it
    private String activeClaimId; // Active claim record ID

    @Builder.Default
    private List<VerificationQuestion> verificationQuestions = new ArrayList<>(); // 5 security questions (for FOUND items)

    private String rewardNote; // Optional reward note by lost item owner (e.g. "₹500 Reward for returning")

    private String foundByUserId; // Set if someone reported finding this lost item
    private String foundByName;
    private String foundByEmail;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt;
}

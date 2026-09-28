package com.khojmitra.dto;

import com.khojmitra.model.ItemStatus;
import com.khojmitra.model.ItemType;
import com.khojmitra.model.Location;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItemResponse {
    private String id;
    private String title;
    private String description;
    private String category;
    private ItemType type;
    private Location location;
    private String imageUrl;
    private LocalDate date;
    private ItemStatus status;
    private String centralDropLocation;
    private String userId;
    private String posterName;
    private String posterEmail;
    private String claimedByUserId;
    private String activeClaimId;
    private String rewardNote;
    private String foundByUserId;
    private String foundByName;
    private String foundByEmail;
    private List<QuizQuestionDto> questions; // Masked questions for claimants
    private LocalDateTime createdAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuizQuestionDto {
        private Integer id;
        private String question;
    }
}

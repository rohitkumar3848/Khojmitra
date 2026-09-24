package com.khojmitra.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "claims")
public class Claim {

    @Id
    private String id;

    private String itemId;
    private String itemTitle;
    private String itemImageUrl;

    private String claimantId;
    private String claimantName;
    private String claimantEmail;

    private String finderId;
    private String finderName;
    private String finderEmail;

    private Integer score; // e.g. 4 (out of 5)
    private Integer totalQuestions; // 5

    @Builder.Default
    private List<SubmittedAnswer> answers = new ArrayList<>();

    @Builder.Default
    private ClaimStatus status = ClaimStatus.QUIZ_PASSED;

    private String finderNotes;
    private String centralDeskNotes;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt;
}

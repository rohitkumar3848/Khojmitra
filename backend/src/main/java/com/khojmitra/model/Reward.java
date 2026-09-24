package com.khojmitra.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "rewards")
public class Reward {

    @Id
    private String id;

    private String claimId;
    private String itemId;

    private String claimantId;
    private String claimantName;

    private String finderId;
    private String finderName;

    private Double totalTip;        // Amount provided by claimant (e.g. 100)
    private Double finderAmount;    // 50% (e.g. 50)
    private Double platformAmount;  // 50% (e.g. 50)
    private Boolean isGoodwillBonus;// True if claimant gave 0 and platform auto-awarded bonus
    private Integer bonusPoints;    // e.g. 10 points

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}

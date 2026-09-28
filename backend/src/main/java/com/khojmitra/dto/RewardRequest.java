package com.khojmitra.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RewardRequest {

    @NotBlank(message = "Claim ID is required")
    private String claimId;

    @Min(value = 0, message = "Tip amount cannot be negative")
    private Double tipAmount; // Can be 0 or more (e.g. 0, 50, 100, 200)

    // Explicit Getters and Setters
    public String getClaimId() {
        return claimId;
    }

    public void setClaimId(String claimId) {
        this.claimId = claimId;
    }

    public Double getTipAmount() {
        return tipAmount != null ? tipAmount : 0.0;
    }

    public void setTipAmount(Double tipAmount) {
        this.tipAmount = tipAmount;
    }

    // Business helper: check if reward is eligible for platform goodwill karma bonus
    public boolean isZeroTipGoodwill() {
        return tipAmount == null || tipAmount <= 0.0;
    }
}

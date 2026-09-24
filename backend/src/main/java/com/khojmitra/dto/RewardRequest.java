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
    private Double tipAmount; // Can be 0 or more
}

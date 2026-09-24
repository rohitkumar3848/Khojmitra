package com.khojmitra.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VerificationQuestion {
    private Integer id; // 1 to 5
    private String question;
    private String expectedAnswer; // kept private, never exposed to claimants directly
}

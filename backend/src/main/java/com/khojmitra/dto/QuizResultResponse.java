package com.khojmitra.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizResultResponse {
    private boolean passed;
    private int score;
    private int totalQuestions;
    private String claimId;
    private String message;
}

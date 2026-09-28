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

    // Explicit Getters and Setters for complete IDE compatibility
    public boolean isPassed() {
        return passed;
    }

    public void setPassed(boolean passed) {
        this.passed = passed;
    }

    public int getScore() {
        return score;
    }

    public void setScore(int score) {
        this.score = score;
    }

    public int getTotalQuestions() {
        return totalQuestions;
    }

    public void setTotalQuestions(int totalQuestions) {
        this.totalQuestions = totalQuestions;
    }

    public String getClaimId() {
        return claimId;
    }

    public void setClaimId(String claimId) {
        this.claimId = claimId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    // Static factory methods
    public static QuizResultResponse passed(int score, int total, String claimId) {
        return QuizResultResponse.builder()
                .passed(true)
                .score(score)
                .totalQuestions(total)
                .claimId(claimId)
                .message("Ownership verification successful! Score: " + score + "/" + total + ". Direct chat unlocked.")
                .build();
    }

    public static QuizResultResponse failed(int score, int total) {
        return QuizResultResponse.builder()
                .passed(false)
                .score(score)
                .totalQuestions(total)
                .claimId(null)
                .message("Ownership verification failed. Score: " + score + "/" + total + ". Required minimum: 3/5.")
                .build();
    }
}

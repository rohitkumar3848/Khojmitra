package com.khojmitra.dto;

import com.khojmitra.model.VerificationQuestion;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportFoundRequest {

    @NotBlank(message = "Central drop-off location or desk is required")
    private String centralDropLocation;

    private String foundNotes;

    @NotNull(message = "5 verification questions are required")
    @Size(min = 5, max = 5, message = "Exactly 5 verification questions are required")
    private List<VerificationQuestion> verificationQuestions;

    // Explicit Getters and Setters
    public String getCentralDropLocation() {
        return centralDropLocation;
    }

    public void setCentralDropLocation(String centralDropLocation) {
        this.centralDropLocation = centralDropLocation;
    }

    public String getFoundNotes() {
        return foundNotes;
    }

    public void setFoundNotes(String foundNotes) {
        this.foundNotes = foundNotes;
    }

    public List<VerificationQuestion> getVerificationQuestions() {
        return verificationQuestions;
    }

    public void setVerificationQuestions(List<VerificationQuestion> verificationQuestions) {
        this.verificationQuestions = verificationQuestions;
    }
}

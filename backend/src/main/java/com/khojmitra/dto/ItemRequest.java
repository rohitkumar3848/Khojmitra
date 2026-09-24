package com.khojmitra.dto;

import com.khojmitra.model.ItemType;
import com.khojmitra.model.Location;
import com.khojmitra.model.VerificationQuestion;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItemRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Category is required")
    private String category;

    @NotNull(message = "Item type is required (LOST or FOUND)")
    private ItemType type;

    private Location location;

    private String imageUrl;

    private LocalDate date;

    private String centralDropLocation;

    // For FOUND items, exactly 5 verification questions
    private List<VerificationQuestion> verificationQuestions;
}

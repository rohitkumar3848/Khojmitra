package com.khojmitra.service;

import com.khojmitra.dto.ItemRequest;
import com.khojmitra.dto.ItemResponse;
import com.khojmitra.model.*;
import com.khojmitra.repository.ItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ItemService {

    private final ItemRepository itemRepository;

    public Item createItem(ItemRequest request, User user) {
        ItemStatus initialStatus;
        if (request.getType() == ItemType.FOUND) {
            // Found items require admin approval to prevent fake posts
            initialStatus = ItemStatus.PENDING_APPROVAL;

            // Ensure verification questions exist for found items
            if (request.getVerificationQuestions() == null || request.getVerificationQuestions().size() < 5) {
                throw new IllegalArgumentException("Found items must have exactly 5 ownership verification questions.");
            }
        } else {
            // Lost items can be published immediately to seek help
            initialStatus = ItemStatus.APPROVED;
        }

        // Assign IDs (1 to 5) to questions if missing
        List<VerificationQuestion> questions = new ArrayList<>();
        if (request.getVerificationQuestions() != null) {
            int qId = 1;
            for (VerificationQuestion q : request.getVerificationQuestions()) {
                questions.add(VerificationQuestion.builder()
                        .id(qId++)
                        .question(q.getQuestion().trim())
                        .expectedAnswer(q.getExpectedAnswer() != null ? q.getExpectedAnswer().trim() : "")
                        .build());
            }
        }

        Item item = Item.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .type(request.getType())
                .location(request.getLocation() != null ? request.getLocation() : new Location())
                .imageUrl(request.getImageUrl())
                .date(request.getDate() != null ? request.getDate() : LocalDate.now())
                .status(initialStatus)
                .centralDropLocation(request.getCentralDropLocation())
                .userId(user.getId())
                .posterName(user.getName())
                .posterEmail(user.getEmail())
                .verificationQuestions(questions)
                .createdAt(LocalDateTime.now())
                .build();

        return itemRepository.save(item);
    }

    public List<ItemResponse> getPublicFeed(String type, String category, String city, String building) {
        List<Item> items = itemRepository.findAll().stream()
                .filter(i -> {
                    // For LOST items: status APPROVED
                    // For FOUND items: only show if APPROVED or CLAIM_IN_PROGRESS
                    if (i.getType() == ItemType.LOST) {
                        return i.getStatus() == ItemStatus.APPROVED;
                    } else {
                        return i.getStatus() == ItemStatus.APPROVED || i.getStatus() == ItemStatus.CLAIM_IN_PROGRESS;
                    }
                })
                .collect(Collectors.toList());

        // Apply filters
        return items.stream()
                .filter(i -> type == null || type.isBlank() || i.getType().name().equalsIgnoreCase(type))
                .filter(i -> category == null || category.isBlank() || i.getCategory().equalsIgnoreCase(category))
                .filter(i -> city == null || city.isBlank() || (i.getLocation() != null && i.getLocation().getCity() != null && i.getLocation().getCity().equalsIgnoreCase(city)))
                .filter(i -> building == null || building.isBlank() || (i.getLocation() != null && i.getLocation().getOfficeBuilding() != null && i.getLocation().getOfficeBuilding().equalsIgnoreCase(building)))
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public ItemResponse getItemById(String id) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Item not found with id: " + id));
        return toResponse(item);
    }

    public Item getRawItemById(String id) {
        return itemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Item not found with id: " + id));
    }

    public List<ItemResponse> getMyItems(String userId) {
        return itemRepository.findByUserId(userId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public Item updateItem(String id, ItemRequest request, User user) {
        Item item = getRawItemById(id);
        if (!item.getUserId().equals(user.getId()) && !user.getRoles().contains(Role.ROLE_ADMIN)) {
            throw new SecurityException("You do not have permission to update this item");
        }

        item.setTitle(request.getTitle());
        item.setDescription(request.getDescription());
        item.setCategory(request.getCategory());
        if (request.getLocation() != null) {
            item.setLocation(request.getLocation());
        }
        if (request.getImageUrl() != null) {
            item.setImageUrl(request.getImageUrl());
        }
        if (request.getCentralDropLocation() != null) {
            item.setCentralDropLocation(request.getCentralDropLocation());
        }
        item.setUpdatedAt(LocalDateTime.now());

        return itemRepository.save(item);
    }

    public void deleteItem(String id, User user) {
        Item item = getRawItemById(id);
        if (!item.getUserId().equals(user.getId()) && !user.getRoles().contains(Role.ROLE_ADMIN)) {
            throw new SecurityException("You do not have permission to delete this item");
        }
        itemRepository.deleteById(id);
    }

    public ItemResponse toResponse(Item item) {
        List<ItemResponse.QuizQuestionDto> maskedQuestions = null;
        if (item.getVerificationQuestions() != null) {
            maskedQuestions = item.getVerificationQuestions().stream()
                    .map(q -> new ItemResponse.QuizQuestionDto(q.getId(), q.getQuestion()))
                    .collect(Collectors.toList());
        }

        return ItemResponse.builder()
                .id(item.getId())
                .title(item.getTitle())
                .description(item.getDescription())
                .category(item.getCategory())
                .type(item.getType())
                .location(item.getLocation())
                .imageUrl(item.getImageUrl())
                .date(item.getDate())
                .status(item.getStatus())
                .centralDropLocation(item.getCentralDropLocation())
                .userId(item.getUserId())
                .posterName(item.getPosterName())
                .posterEmail(item.getPosterEmail())
                .claimedByUserId(item.getClaimedByUserId())
                .activeClaimId(item.getActiveClaimId())
                .questions(maskedQuestions)
                .createdAt(item.getCreatedAt())
                .build();
    }
}

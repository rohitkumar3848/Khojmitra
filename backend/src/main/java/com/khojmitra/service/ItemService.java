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
                .rewardNote(request.getRewardNote())
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
                    // Show APPROVED and CLAIM_IN_PROGRESS items on feed
                    return i.getStatus() == ItemStatus.APPROVED || i.getStatus() == ItemStatus.CLAIM_IN_PROGRESS;
                })
                .collect(Collectors.toList());

        // Apply filters
        return items.stream()
                .filter(i -> type == null || type.isBlank() || i.getType().name().equalsIgnoreCase(type))
                .filter(i -> category == null || category.isBlank() || i.getCategory().equalsIgnoreCase(category))
                .filter(i -> city == null || city.isBlank() || (i.getLocation() != null && i.getLocation().getCity() != null && i.getLocation().getCity().toLowerCase().contains(city.toLowerCase().trim())))
                .filter(i -> building == null || building.isBlank() || (i.getLocation() != null && i.getLocation().getOfficeBuilding() != null && i.getLocation().getOfficeBuilding().toLowerCase().contains(building.toLowerCase().trim())))
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public Item reportFoundOnLostItem(String itemId, com.khojmitra.dto.ReportFoundRequest request, User finder) {
        Item item = getRawItemById(itemId);
        if (item.getType() != ItemType.LOST) {
            throw new IllegalArgumentException("Only LOST items can be reported as found with this action.");
        }
        if (item.getUserId().equals(finder.getId())) {
            throw new IllegalArgumentException("You cannot report finding your own lost item!");
        }

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

        item.setFoundByUserId(finder.getId());
        item.setFoundByName(finder.getName());
        item.setFoundByEmail(finder.getEmail());
        item.setCentralDropLocation(request.getCentralDropLocation());
        item.setVerificationQuestions(questions);
        item.setStatus(ItemStatus.CLAIM_IN_PROGRESS);
        item.setUpdatedAt(LocalDateTime.now());

        return itemRepository.save(item);
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
                .rewardNote(item.getRewardNote())
                .foundByUserId(item.getFoundByUserId())
                .foundByName(item.getFoundByName())
                .foundByEmail(item.getFoundByEmail())
                .questions(maskedQuestions)
                .createdAt(item.getCreatedAt())
                .build();
    }
}

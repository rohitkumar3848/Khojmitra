package com.khojmitra.service;

import com.khojmitra.dto.QuizResultResponse;
import com.khojmitra.dto.SubmitQuizRequest;
import com.khojmitra.model.*;
import com.khojmitra.repository.ChatMessageRepository;
import com.khojmitra.repository.ClaimRepository;
import com.khojmitra.repository.ItemRepository;
import com.khojmitra.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ClaimService {

    private final ClaimRepository claimRepository;
    private final ItemRepository itemRepository;
    private final UserRepository userRepository;
    private final ChatMessageRepository chatMessageRepository;

    @Value("${application.rules.quiz-passing-score:3}")
    private int passingScore;

    public QuizResultResponse submitQuiz(SubmitQuizRequest request, User claimant) {
        Item item = itemRepository.findById(request.getItemId())
                .orElseThrow(() -> new IllegalArgumentException("Item not found"));

        if (item.getType() != ItemType.FOUND) {
            throw new IllegalArgumentException("Only FOUND items can be claimed via verification quiz.");
        }

        if (item.getUserId().equals(claimant.getId())) {
            throw new IllegalArgumentException("You cannot claim an item you posted as found!");
        }

        if (item.getStatus() == ItemStatus.RETURNED) {
            throw new IllegalStateException("This item has already been claimed and returned.");
        }

        List<VerificationQuestion> expectedQuestions = item.getVerificationQuestions();
        if (expectedQuestions == null || expectedQuestions.isEmpty()) {
            throw new IllegalStateException("This item does not have verification questions configured.");
        }

        // Map answers submitted
        Map<Integer, String> userAnswersMap = new HashMap<>();
        if (request.getAnswers() != null) {
            for (SubmitQuizRequest.AnswerDto ans : request.getAnswers()) {
                userAnswersMap.put(ans.getQuestionId(), ans.getAnswer());
            }
        }

        int correctCount = 0;
        List<SubmittedAnswer> evaluatedAnswers = new ArrayList<>();

        for (VerificationQuestion q : expectedQuestions) {
            String submitted = userAnswersMap.getOrDefault(q.getId(), "").trim();
            boolean isMatch = isAnswerCorrect(q.getExpectedAnswer(), submitted);
            if (isMatch) {
                correctCount++;
            }
            evaluatedAnswers.add(SubmittedAnswer.builder()
                    .questionId(q.getId())
                    .question(q.getQuestion())
                    .userAnswer(submitted)
                    .isCorrect(isMatch)
                    .build());
        }

        boolean passed = correctCount >= passingScore;

        if (passed) {
            // Find existing claim or create new
            Optional<Claim> existingClaimOpt = claimRepository.findByItemIdAndClaimantId(item.getId(), claimant.getId());
            Claim claim = existingClaimOpt.orElseGet(() -> Claim.builder()
                    .itemId(item.getId())
                    .itemTitle(item.getTitle())
                    .itemImageUrl(item.getImageUrl())
                    .claimantId(claimant.getId())
                    .claimantName(claimant.getName())
                    .claimantEmail(claimant.getEmail())
                    .finderId(item.getUserId())
                    .finderName(item.getPosterName())
                    .finderEmail(item.getPosterEmail())
                    .createdAt(LocalDateTime.now())
                    .build());

            claim.setScore(correctCount);
            claim.setTotalQuestions(expectedQuestions.size());
            claim.setAnswers(evaluatedAnswers);
            claim.setStatus(ClaimStatus.QUIZ_PASSED);
            claim.setUpdatedAt(LocalDateTime.now());

            Claim savedClaim = claimRepository.save(claim);

            // Update Item state
            item.setStatus(ItemStatus.CLAIM_IN_PROGRESS);
            item.setActiveClaimId(savedClaim.getId());
            item.setClaimedByUserId(claimant.getId());
            itemRepository.save(item);

            // Post automated initial system message into the chat channel
            ChatMessage systemMsg = ChatMessage.builder()
                    .claimId(savedClaim.getId())
                    .senderId("SYSTEM")
                    .senderName("KhojMitra Bot")
                    .receiverId(savedClaim.getFinderId())
                    .content("🎉 Ownership Quiz Passed! Claimant answered " + correctCount + "/5 questions correctly. Chat is now unlocked to coordinate drop-off and verification.")
                    .isSystemMessage(true)
                    .timestamp(LocalDateTime.now())
                    .build();
            chatMessageRepository.save(systemMsg);

            return QuizResultResponse.builder()
                    .passed(true)
                    .score(correctCount)
                    .totalQuestions(expectedQuestions.size())
                    .claimId(savedClaim.getId())
                    .message("Ownership verification successful! Score: " + correctCount + "/5. You can now chat directly with the finder.")
                    .build();
        } else {
            return QuizResultResponse.builder()
                    .passed(false)
                    .score(correctCount)
                    .totalQuestions(expectedQuestions.size())
                    .claimId(null)
                    .message("Verification failed. You answered " + correctCount + "/5 correctly. At least " + passingScore + " correct answers are required to verify ownership.")
                    .build();
        }
    }

    public Claim confirmByFinder(String claimId, User finder) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new IllegalArgumentException("Claim not found: " + claimId));

        if (!claim.getFinderId().equals(finder.getId()) && !finder.getRoles().contains(Role.ROLE_ADMIN)) {
            throw new SecurityException("Only the finder can confirm ownership for this claim.");
        }

        claim.setStatus(ClaimStatus.FINDER_VERIFIED);
        claim.setUpdatedAt(LocalDateTime.now());
        Claim savedClaim = claimRepository.save(claim);

        // Update Item status
        Item item = itemRepository.findById(claim.getItemId()).orElse(null);
        if (item != null) {
            item.setStatus(ItemStatus.CONFIRMED_BY_FINDER);
            itemRepository.save(item);
        }

        // Post system chat update
        ChatMessage systemMsg = ChatMessage.builder()
                .claimId(claimId)
                .senderId("SYSTEM")
                .senderName("KhojMitra Bot")
                .receiverId(claim.getClaimantId())
                .content("✅ Finder has verified and confirmed you as the rightful owner! Item is now waiting for central desk dispatch.")
                .isSystemMessage(true)
                .timestamp(LocalDateTime.now())
                .build();
        chatMessageRepository.save(systemMsg);

        return savedClaim;
    }

    public List<Claim> getUserClaims(String userId) {
        return claimRepository.findByClaimantId(userId);
    }

    public List<Claim> getFinderClaims(String finderId) {
        return claimRepository.findByFinderId(finderId);
    }

    public Claim getClaimById(String claimId, User user) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new IllegalArgumentException("Claim not found"));

        // Only claimant, finder, or admin can access
        boolean isParticipant = claim.getClaimantId().equals(user.getId()) || claim.getFinderId().equals(user.getId());
        boolean isAdmin = user.getRoles().contains(Role.ROLE_ADMIN);

        if (!isParticipant && !isAdmin) {
            throw new SecurityException("Unauthorized to view this claim");
        }

        return claim;
    }

    private boolean isAnswerCorrect(String expected, String given) {
        if (expected == null || given == null) return false;

        String expNorm = normalizeText(expected);
        String givNorm = normalizeText(given);

        if (expNorm.isEmpty() || givNorm.isEmpty()) return false;

        // Exact match
        if (expNorm.equals(givNorm)) return true;

        // Substring / token matching
        if (givNorm.contains(expNorm) || expNorm.contains(givNorm)) return true;

        // Word overlap
        String[] expWords = expNorm.split("\\s+");
        String[] givWords = givNorm.split("\\s+");
        int matchCount = 0;
        for (String ew : expWords) {
            if (ew.length() <= 2) continue;
            for (String gw : givWords) {
                if (gw.contains(ew) || ew.contains(gw)) {
                    matchCount++;
                    break;
                }
            }
        }

        return matchCount > 0 && matchCount >= (expWords.length / 2);
    }

    private String normalizeText(String text) {
        return text.toLowerCase()
                .replaceAll("[^a-z0-9\\s]", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }
}

package com.khojmitra.service;

import com.khojmitra.dto.RewardRequest;
import com.khojmitra.model.*;
import com.khojmitra.repository.ClaimRepository;
import com.khojmitra.repository.ItemRepository;
import com.khojmitra.repository.RewardRepository;
import com.khojmitra.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class RewardService {

    private final RewardRepository rewardRepository;
    private final ClaimRepository claimRepository;
    private final ItemRepository itemRepository;
    private final UserRepository userRepository;

    @Value("${application.rules.reward-finder-percentage:50}")
    private double finderPercentage;

    @Value("${application.rules.reward-platform-percentage:50}")
    private double platformPercentage;

    @Value("${application.rules.goodwill-bonus-points:10}")
    private int goodwillBonusPoints;

    public Reward processReward(RewardRequest request, User claimant) {
        Claim claim = claimRepository.findById(request.getClaimId())
                .orElseThrow(() -> new IllegalArgumentException("Claim not found"));

        if (!claim.getClaimantId().equals(claimant.getId())) {
            throw new SecurityException("Only the claimant can submit a reward/tip for this recovered item.");
        }

        double tip = request.getTipAmount() != null ? request.getTipAmount() : 0.0;
        double finderShare = 0.0;
        double platformShare = 0.0;
        boolean isGoodwill = false;
        int bonusPoints = 0;

        User finder = userRepository.findById(claim.getFinderId()).orElse(null);

        if (tip > 0) {
            finderShare = (tip * finderPercentage) / 100.0;
            platformShare = (tip * platformPercentage) / 100.0;
            if (finder != null) {
                finder.setWalletBalance(finder.getWalletBalance() + finderShare);
                finder.setKarmaPoints(finder.getKarmaPoints() + 5);
                userRepository.save(finder);
            }
        } else {
            // Claimant gave 0: Platform auto-grants goodwill bonus points to honest finder
            isGoodwill = true;
            bonusPoints = goodwillBonusPoints;
            if (finder != null) {
                finder.setKarmaPoints(finder.getKarmaPoints() + bonusPoints);
                userRepository.save(finder);
            }
        }

        Reward reward = Reward.builder()
                .claimId(claim.getId())
                .itemId(claim.getItemId())
                .claimantId(claimant.getId())
                .claimantName(claimant.getName())
                .finderId(claim.getFinderId())
                .finderName(claim.getFinderName())
                .totalTip(tip)
                .finderAmount(finderShare)
                .platformAmount(platformShare)
                .isGoodwillBonus(isGoodwill)
                .bonusPoints(bonusPoints)
                .createdAt(LocalDateTime.now())
                .build();

        Reward savedReward = rewardRepository.save(reward);

        // Update Claim and Item status to finished/delivered/returned
        claim.setStatus(ClaimStatus.DELIVERED);
        claim.setUpdatedAt(LocalDateTime.now());
        claimRepository.save(claim);

        Item item = itemRepository.findById(claim.getItemId()).orElse(null);
        if (item != null) {
            item.setStatus(ItemStatus.RETURNED);
            item.setUpdatedAt(LocalDateTime.now());
            itemRepository.save(item);
        }

        return savedReward;
    }

    public Reward getRewardForClaim(String claimId) {
        return rewardRepository.findByClaimId(claimId).orElse(null);
    }
}

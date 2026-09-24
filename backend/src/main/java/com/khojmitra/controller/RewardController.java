package com.khojmitra.controller;

import com.khojmitra.dto.ApiResponse;
import com.khojmitra.dto.RewardRequest;
import com.khojmitra.model.Reward;
import com.khojmitra.model.User;
import com.khojmitra.service.AuthService;
import com.khojmitra.service.RewardService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/rewards")
@RequiredArgsConstructor
public class RewardController {

    private final RewardService rewardService;
    private final AuthService authService;

    @PostMapping
    public ResponseEntity<ApiResponse<Reward>> submitReward(@Valid @RequestBody RewardRequest request) {
        User currentUser = authService.getCurrentUser();
        Reward reward = rewardService.processReward(request, currentUser);
        String msg = reward.getIsGoodwillBonus()
                ? "Item handover closed! Since no tip was added, KhojMitra awarded 10 goodwill karma points to the finder."
                : "Reward processed! 50% transferred to Finder and 50% platform fee.";
        return ResponseEntity.ok(ApiResponse.ok(msg, reward));
    }

    @GetMapping("/claim/{claimId}")
    public ResponseEntity<ApiResponse<Reward>> getReward(@PathVariable String claimId) {
        Reward reward = rewardService.getRewardForClaim(claimId);
        return ResponseEntity.ok(ApiResponse.ok("Reward info retrieved", reward));
    }
}

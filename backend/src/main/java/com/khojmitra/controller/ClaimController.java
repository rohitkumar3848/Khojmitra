package com.khojmitra.controller;

import com.khojmitra.dto.ApiResponse;
import com.khojmitra.dto.QuizResultResponse;
import com.khojmitra.dto.SubmitQuizRequest;
import com.khojmitra.model.Claim;
import com.khojmitra.model.User;
import com.khojmitra.service.AuthService;
import com.khojmitra.service.ClaimService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/claims")
@RequiredArgsConstructor
public class ClaimController {

    private final ClaimService claimService;
    private final AuthService authService;

    @PostMapping("/quiz")
    public ResponseEntity<ApiResponse<QuizResultResponse>> submitQuiz(@Valid @RequestBody SubmitQuizRequest request) {
        User currentUser = authService.getCurrentUser();
        QuizResultResponse result = claimService.submitQuiz(request, currentUser);
        return ResponseEntity.ok(ApiResponse.ok(result.getMessage(), result));
    }

    @PostMapping("/{claimId}/confirm")
    public ResponseEntity<ApiResponse<Claim>> confirmByFinder(@PathVariable String claimId) {
        User currentUser = authService.getCurrentUser();
        Claim claim = claimService.confirmByFinder(claimId, currentUser);
        return ResponseEntity.ok(ApiResponse.ok("Finder confirmed ownership! Item queued for central desk pickup.", claim));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<Claim>>> getMyClaims() {
        User currentUser = authService.getCurrentUser();
        List<Claim> claims = claimService.getUserClaims(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.ok("Claims retrieved", claims));
    }

    @GetMapping("/finder")
    public ResponseEntity<ApiResponse<List<Claim>>> getFinderClaims() {
        User currentUser = authService.getCurrentUser();
        List<Claim> claims = claimService.getFinderClaims(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.ok("Claims on your found items retrieved", claims));
    }

    @GetMapping("/{claimId}")
    public ResponseEntity<ApiResponse<Claim>> getClaimById(@PathVariable String claimId) {
        User currentUser = authService.getCurrentUser();
        Claim claim = claimService.getClaimById(claimId, currentUser);
        return ResponseEntity.ok(ApiResponse.ok("Claim details retrieved", claim));
    }
}

package com.khojmitra.model;

/**
 * ClaimStatus represents the lifecycle of a claimant's ownership verification
 * for a found item on KhojMitra.
 */
public enum ClaimStatus {
    QUIZ_PASSED("Verification Passed", "Claimant answered 3+ questions correctly. Direct chat unlocked."),
    FINDER_VERIFIED("Finder Confirmed", "Finder verified ownership details in chat and approved handover."),
    READY_FOR_PICKUP("Ready at Desk", "Item is available at central drop-off desk for verified pickup."),
    DELIVERED("Delivered & Settled", "Item successfully returned to owner. Gratitude reward settled."),
    REJECTED("Claim Rejected", "Claim rejected due to failed verification or finder dispute.");

    private final String displayName;
    private final String description;

    ClaimStatus(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }

    public boolean canChat() {
        return this == QUIZ_PASSED || this == FINDER_VERIFIED;
    }

    public boolean isTerminal() {
        return this == DELIVERED || this == REJECTED;
    }

    public boolean canSettleReward() {
        return this == FINDER_VERIFIED || this == READY_FOR_PICKUP || this == DELIVERED;
    }
}

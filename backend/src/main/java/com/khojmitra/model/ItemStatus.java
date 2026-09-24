package com.khojmitra.model;

public enum ItemStatus {
    PENDING_APPROVAL,   // Submitted Found item waiting for admin review
    APPROVED,           // Approved by admin, listed on public feed
    CLAIM_IN_PROGRESS,  // Quiz passed, chat session active between claimant and finder
    CONFIRMED_BY_FINDER,// Finder validated rightful owner, waiting for central desk pickup
    READY_FOR_PICKUP,   // Central desk verified item is physically present and ready
    RETURNED,           // Item handed over to owner, reward settled
    REJECTED            // Rejected by admin as spam/invalid
}

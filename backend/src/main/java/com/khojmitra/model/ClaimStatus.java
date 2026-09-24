package com.khojmitra.model;

public enum ClaimStatus {
    QUIZ_PASSED,        // User answered at least 3/5 questions correctly, chat is unlocked
    FINDER_VERIFIED,    // Finder confirmed claimant is genuine owner via conversation
    READY_FOR_PICKUP,   // Central desk verified, item can be picked up
    DELIVERED,          // Handed over to owner, reward settled
    REJECTED            // Rejected by finder or admin
}

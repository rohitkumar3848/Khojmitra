package com.khojmitra.repository;

import com.khojmitra.model.Claim;
import com.khojmitra.model.ClaimStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClaimRepository extends MongoRepository<Claim, String> {

    List<Claim> findByClaimantId(String claimantId);

    List<Claim> findByFinderId(String finderId);

    List<Claim> findByItemId(String itemId);

    Optional<Claim> findByItemIdAndClaimantId(String itemId, String claimantId);

    List<Claim> findByStatus(ClaimStatus status);
}

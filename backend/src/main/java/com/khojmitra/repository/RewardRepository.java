package com.khojmitra.repository;

import com.khojmitra.model.Reward;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RewardRepository extends MongoRepository<Reward, String> {
    Optional<Reward> findByClaimId(String claimId);
    List<Reward> findByFinderId(String finderId);
    List<Reward> findByClaimantId(String claimantId);
}

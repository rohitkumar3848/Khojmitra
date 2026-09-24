package com.khojmitra.service;

import com.khojmitra.dto.ItemResponse;
import com.khojmitra.model.*;
import com.khojmitra.repository.ClaimRepository;
import com.khojmitra.repository.ItemRepository;
import com.khojmitra.repository.RewardRepository;
import com.khojmitra.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final ItemRepository itemRepository;
    private final UserRepository userRepository;
    private final ClaimRepository claimRepository;
    private final RewardRepository rewardRepository;
    private final ItemService itemService;

    public List<Item> getPendingItems() {
        return itemRepository.findByStatus(ItemStatus.PENDING_APPROVAL);
    }

    public Item approveItem(String itemId) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Item not found: " + itemId));
        item.setStatus(ItemStatus.APPROVED);
        item.setUpdatedAt(LocalDateTime.now());
        return itemRepository.save(item);
    }

    public Item rejectItem(String itemId) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Item not found: " + itemId));
        item.setStatus(ItemStatus.REJECTED);
        item.setUpdatedAt(LocalDateTime.now());
        return itemRepository.save(item);
    }

    public Item markReadyForPickup(String itemId) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Item not found: " + itemId));
        item.setStatus(ItemStatus.READY_FOR_PICKUP);
        item.setUpdatedAt(LocalDateTime.now());
        return itemRepository.save(item);
    }

    public Item markHandoverComplete(String itemId) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Item not found: " + itemId));
        item.setStatus(ItemStatus.RETURNED);
        item.setUpdatedAt(LocalDateTime.now());
        return itemRepository.save(item);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public void deleteUser(String userId) {
        userRepository.deleteById(userId);
    }

    public Map<String, Object> getSystemMetrics() {
        long totalItems = itemRepository.count();
        long totalLost = itemRepository.findByType(ItemType.LOST).size();
        long totalFound = itemRepository.findByType(ItemType.FOUND).size();
        long pendingApproval = itemRepository.findByStatus(ItemStatus.PENDING_APPROVAL).size();
        long totalReturned = itemRepository.findByStatus(ItemStatus.RETURNED).size();
        long totalUsers = userRepository.count();
        long totalClaims = claimRepository.count();

        List<Reward> rewards = rewardRepository.findAll();
        double totalTips = rewards.stream().mapToDouble(r -> r.getTotalTip() != null ? r.getTotalTip() : 0.0).sum();
        double platformEarned = rewards.stream().mapToDouble(r -> r.getPlatformAmount() != null ? r.getPlatformAmount() : 0.0).sum();
        double finderDistributed = rewards.stream().mapToDouble(r -> r.getFinderAmount() != null ? r.getFinderAmount() : 0.0).sum();

        Map<String, Object> metrics = new HashMap<>();
        metrics.put("totalItems", totalItems);
        metrics.put("totalLost", totalLost);
        metrics.put("totalFound", totalFound);
        metrics.put("pendingApproval", pendingApproval);
        metrics.put("totalReturned", totalReturned);
        metrics.put("totalUsers", totalUsers);
        metrics.put("totalClaims", totalClaims);
        metrics.put("totalTips", totalTips);
        metrics.put("platformEarned", platformEarned);
        metrics.put("finderDistributed", finderDistributed);

        return metrics;
    }
}

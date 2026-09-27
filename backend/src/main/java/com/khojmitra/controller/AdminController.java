package com.khojmitra.controller;

import com.khojmitra.dto.ApiResponse;
import com.khojmitra.model.Item;
import com.khojmitra.model.User;
import com.khojmitra.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<Item>>> getPendingItems() {
        List<Item> items = adminService.getPendingItems();
        return ResponseEntity.ok(ApiResponse.ok("Pending items retrieved", items));
    }

    @PostMapping("/items/{id}/approve")
    public ResponseEntity<ApiResponse<Item>> approveItem(@PathVariable String id) {
        Item item = adminService.approveItem(id);
        return ResponseEntity.ok(ApiResponse.ok("Item approved and published to public feed", item));
    }

    @PostMapping("/items/{id}/reject")
    public ResponseEntity<ApiResponse<Item>> rejectItem(@PathVariable String id) {
        Item item = adminService.rejectItem(id);
        return ResponseEntity.ok(ApiResponse.ok("Item rejected", item));
    }

    @PostMapping("/items/{id}/ready-for-pickup")
    public ResponseEntity<ApiResponse<Item>> readyForPickup(@PathVariable String id) {
        Item item = adminService.markReadyForPickup(id);
        return ResponseEntity.ok(ApiResponse.ok("Item verified at Central Desk and marked Ready for Pickup", item));
    }

    @PostMapping("/items/{id}/handover")
    public ResponseEntity<ApiResponse<Item>> handoverComplete(@PathVariable String id) {
        Item item = adminService.markHandoverComplete(id);
        return ResponseEntity.ok(ApiResponse.ok("Central Desk Handover Complete! Item marked as RETURNED", item));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<User>>> getAllUsers() {
        List<User> users = adminService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.ok("Users list retrieved", users));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable String id) {
        adminService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.ok("User deleted", null));
    }

    @GetMapping("/metrics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMetrics() {
        Map<String, Object> metrics = adminService.getSystemMetrics();
        return ResponseEntity.ok(ApiResponse.ok("System metrics retrieved", metrics));
    }
}


package com.khojmitra.controller;

import com.khojmitra.dto.ApiResponse;
import com.khojmitra.dto.ItemRequest;
import com.khojmitra.dto.ItemResponse;
import com.khojmitra.model.Item;
import com.khojmitra.model.User;
import com.khojmitra.service.AuthService;
import com.khojmitra.service.ItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/items")
@RequiredArgsConstructor
public class ItemController {

    private final ItemService itemService;
    private final AuthService authService;

    @PostMapping
    public ResponseEntity<ApiResponse<Item>> createItem(@Valid @RequestBody ItemRequest request) {
        User currentUser = authService.getCurrentUser();
        Item created = itemService.createItem(request, currentUser);
        String msg = created.getType().name().equals("FOUND")
                ? "Found item posted! It will appear on the feed once verified by Admin."
                : "Lost item published successfully!";
        return ResponseEntity.ok(ApiResponse.ok(msg, created));
    }

    @GetMapping("/feed")
    public ResponseEntity<ApiResponse<List<ItemResponse>>> getPublicFeed(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String building
    ) {
        List<ItemResponse> items = itemService.getPublicFeed(type, category, city, building);
        return ResponseEntity.ok(ApiResponse.ok("Feed retrieved", items));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ItemResponse>> getItemById(@PathVariable String id) {
        ItemResponse item = itemService.getItemById(id);
        return ResponseEntity.ok(ApiResponse.ok("Item retrieved", item));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<ItemResponse>>> getMyItems() {
        User currentUser = authService.getCurrentUser();
        List<ItemResponse> items = itemService.getMyItems(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.ok("User items retrieved", items));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Item>> updateItem(
            @PathVariable String id,
            @RequestBody ItemRequest request
    ) {
        User currentUser = authService.getCurrentUser();
        Item updated = itemService.updateItem(id, request, currentUser);
        return ResponseEntity.ok(ApiResponse.ok("Item updated", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteItem(@PathVariable String id) {
        User currentUser = authService.getCurrentUser();
        itemService.deleteItem(id, currentUser);
        return ResponseEntity.ok(ApiResponse.ok("Item deleted successfully", null));
    }
}

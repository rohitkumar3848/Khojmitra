package com.khojmitra.repository;

import com.khojmitra.model.Item;
import com.khojmitra.model.ItemStatus;
import com.khojmitra.model.ItemType;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItemRepository extends MongoRepository<Item, String> {

    List<Item> findByType(ItemType type);

    List<Item> findByStatus(ItemStatus status);

    List<Item> findByTypeAndStatus(ItemType type, ItemStatus status);

    List<Item> findByUserId(String userId);

    @Query("{ 'status': ?0, '$or': [ { 'title': { $regex: ?1, $options: 'i' } }, { 'description': { $regex: ?1, $options: 'i' } }, { 'category': { $regex: ?1, $options: 'i' } } ] }")
    List<Item> searchApprovedItems(ItemStatus status, String keyword);

    @Query("{ '$or': [ { 'type': 'LOST' }, { 'type': 'FOUND', 'status': 'APPROVED' } ] }")
    List<Item> findPublicFeedItems();
}

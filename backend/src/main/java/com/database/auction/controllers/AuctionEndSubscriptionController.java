// src/main/java/com/database/auction/controllers/AuctionEndSubscriptionController.java
package com.database.auction.controllers;

import com.database.auction.entity.AuctionEndSubscription;
import com.database.auction.service.AuctionEndNotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth/auction-items")
@CrossOrigin("http://localhost:3000")
public class AuctionEndSubscriptionController {

    @Autowired
    private AuctionEndNotificationService endService;

    /**
     * Called automatically from your insertAuctionItem method,
     * but you can also call it manually to subscribe an existing auction.
     */
    @PostMapping("/{auctionId}/subscribe-end")
    public ResponseEntity<AuctionEndSubscription> subscribeEnd(
            @PathVariable int auctionId) {
        AuctionEndSubscription sub = endService.subscribe(auctionId);
        return ResponseEntity.ok(sub);
    }
}

// src/main/java/com/database/auction/controllers/AuctionStartController.java
package com.database.auction.controllers;

import com.database.auction.entity.AuctionStartSubscription;
import com.database.auction.service.AuctionStartNotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin("http://localhost:3000")
@RestController
@RequestMapping("/auth/auction-items")

public class AuctionStartController {

    @Autowired private AuctionStartNotificationService service;

    /**
     * Buyer opts in to "auction live" alert.
     */
    @PostMapping("/{buyerId}/{auctionId}/notify")
    public ResponseEntity<Void> subscribe(
            @PathVariable int buyerId,
            @PathVariable int auctionId) {

        service.subscribe(buyerId, auctionId);
        return ResponseEntity.ok().build();
    }
}

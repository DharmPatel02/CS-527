// src/main/java/com/database/auction/controllers/BidController.java
package com.database.auction.controllers;

import com.database.auction.dto.BidDto;
import com.database.auction.service.BidService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController

@RequestMapping("/auth/bids")
@Slf4j
public class BidController {

    private final BidService bidService;

    @Autowired
    public BidController(BidService bidService) {
        this.bidService = bidService;
    }

    /** Place a new bid */
    @PostMapping
    public ResponseEntity<BidDto> placeBid(@RequestBody BidDto bidDto) {
        BidDto created = bidService.placeBid(bidDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /** List all bids for a given auction */
    @GetMapping("/auction/{auctionId}")
    public ResponseEntity<List<BidDto>> bidsByAuction(@PathVariable int auctionId) {
        return ResponseEntity.ok(bidService.getBidsByAuction(auctionId));
    }

    /** List all bids by a given buyer */
    @GetMapping("/buyer/{buyerId}")
    public ResponseEntity<List<BidDto>> bidsByBuyer(@PathVariable int buyerId) {
        return ResponseEntity.ok(bidService.getBidsByBuyer(buyerId));
    }

    /** Remove a bid by its ID and auction ID */
    @PostMapping("/remove_bid/{bid_id}/{auction_id}")
    public String removeBid(
            @PathVariable("bid_id") int bidId,
            @PathVariable("auction_id") int auction_id) {
        System.out.println("In Controller");
        log.info("auction_id"+auction_id );
        return bidService.removeBid(bidId, auction_id);
    }

    /** JDBC-based fetch of all bids for an auction (optional) */
    @GetMapping("/{auctionId}/bids")
    public ResponseEntity<List<BidDto>> getAllBids(@PathVariable int auctionId) {
        List<BidDto> bids = bidService.getAllBidsByAuction(auctionId);
        if (bids.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(bids);
    }
}

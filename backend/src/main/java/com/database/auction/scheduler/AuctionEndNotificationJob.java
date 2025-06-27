package com.database.auction.scheduler;// src/main/java/com/database/auction/jobs/AuctionEndNotificationJob.java


import com.database.auction.entity.AuctionEndSubscription;
import com.database.auction.entity.AuctionItems;
import com.database.auction.entity.Bid;
import com.database.auction.repository.AuctionEndSubscriptionRepository;
import com.database.auction.repository.AuctionItemsRepository;
import com.database.auction.repository.BidRepository;
import com.database.auction.service.NotificationService;
import lombok.extern.slf4j.Slf4j;
import org.quartz.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
public class AuctionEndNotificationJob implements Job {
    public AuctionEndNotificationJob() {}

    @Autowired private AuctionEndSubscriptionRepository subRepo;
    @Autowired private AuctionItemsRepository           itemsRepo;
    @Autowired private BidRepository                    bidRepo;
    @Autowired private NotificationService              notifications;

//    @Override
//    public void execute(JobExecutionContext context) {
//        JobDataMap data = context.getMergedJobDataMap();
//        Long subId = data.getLong("subscriptionId");
//        log.info("▶️ AuctionEndNotificationJob firing for subscription {}", subId);
//
//        // 1) load subscription & mark triggered
//        AuctionEndSubscription sub = subRepo.findById(subId)
//                .orElseThrow(() -> new IllegalStateException("No subscription " + subId));
//
//        if (Boolean.TRUE.equals(sub.getTriggered())) {
//            log.info("  – already triggered, skipping");
//            return;
//        }
//
//        // 2) load auction
//        AuctionItems item = itemsRepo.findByAuctionIdNative(sub.getAuctionId())
//                .orElseThrow(() -> new IllegalStateException(
//                        "Auction not found: " + sub.getAuctionId()));
//
//        // 3) determine which notification
//        Integer winnerId = item.getWinningBuyerId();
//        if (winnerId != null) {
//            // ─── Case 1: winner exists
//            double price = item.getCurrentBid() != null ? item.getCurrentBid() : 0.0;
//            String msg = String.format("🎉 You won auction %d for £%.2f",
//                    item.getauction_id(), price);
//            notifications.alertOutbid(winnerId, item.getauction_id(), msg);
//            log.info("  – notified winner buyerId={}", winnerId);
//
//        } else {
//            // ─── no winner: check bids
//            List<Bid> bids = bidRepo.findAllByAuctionItem_Id(item.getId());
//            int sellerId = item.getseller_id();
//            String msg;
//            if (bids.isEmpty()) {
//                // ── Case 2: no bids at all
//                msg = "😞 No one bid on your auction.";
//            } else {
//                // ── Case 3: bids placed but none crossed min_price
//                msg = "⚠️ Bids were placed but none crossed your minimum price.";
//            }
//            notifications.alertOutbid(sellerId, item.getauction_id(), msg);
//            log.info("  – notified sellerId={} : {}", sellerId, msg);
//        }
//
//        // 4) mark subscription done
//        sub.setTriggered(true);
//        subRepo.save(sub);
//        log.info("  – subscription {} marked triggered", subId);
//    }

    /** schedule the Quartz trigger for this subscription */
    @Override
    public void execute(JobExecutionContext context) {
        JobDataMap data = context.getMergedJobDataMap();
        Long subId = data.getLong("subscriptionId");
        log.info("▶️ AuctionEndNotificationJob firing for subscription {}", subId);

        // 1) load the subscription
        AuctionEndSubscription sub = subRepo.findById(subId)
                .orElseThrow(() -> new IllegalStateException("No subscription " + subId));

        // 2) skip if already triggered
        if (Boolean.TRUE.equals(sub.getTriggered())) {
            log.info("  – already triggered, skipping");
            return;
        }

        // 3) load the auction by its PRIMARY KEY (sub.getAuctionId())
        AuctionItems item = itemsRepo.findById(Long.valueOf(sub.getAuctionId()))
                .orElseThrow(() -> new IllegalStateException(
                        "Auction not found: " + sub.getAuctionId()));

        // 4) decide which notification(s) to send
        Integer winnerId = item.getWinningBuyerId();
        if (winnerId != null) {
            // ─── Case: there is a winner
            double price = item.getCurrentBid() != null ? item.getCurrentBid() : 0.0;
            String msg = String.format("🎉 You won auction %d for £%.2f",
                    item.getId(), price);

            // notify the buyer
            notifications.alertOutbid(winnerId, Math.toIntExact(item.getId()), msg);
            log.info("  – notified winner buyerId={}", winnerId);

        } else {
            // ─── Case: no winning bid
            List<Bid> bids = bidRepo.findAllByAuctionItem_Id(item.getId());
            int sellerId = item.getseller_id();
            String msg;

            if (bids.isEmpty()) {
                msg = "😞 No one bid on your auction.";
            } else {
                msg = "⚠️ Bids were placed but none crossed your minimum price.";
            }

            // notify the seller
            notifications.alertOutbid(sellerId, Math.toIntExact(item.getId()), msg);
            log.info("  – notified sellerId={} : {}", sellerId, msg);
        }

        // 5) mark the subscription as triggered
        sub.setTriggered(true);
        subRepo.save(sub);
        log.info("  – subscription {} marked triggered", subId);
    }
}

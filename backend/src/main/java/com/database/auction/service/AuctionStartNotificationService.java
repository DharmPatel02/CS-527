// src/main/java/com/database/auction/service/AuctionStartNotificationService.java
package com.database.auction.service;

import com.database.auction.entity.AuctionStartSubscription;

public interface AuctionStartNotificationService {
    AuctionStartSubscription subscribe(int buyerId, int auctionId);
    void scheduleExisting();  // to re-schedule on startup
}

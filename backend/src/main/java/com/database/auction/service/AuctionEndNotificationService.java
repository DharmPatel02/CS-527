// src/main/java/com/database/auction/service/AuctionEndNotificationService.java
package com.database.auction.service;

import com.database.auction.entity.AuctionEndSubscription;

public interface AuctionEndNotificationService {
    AuctionEndSubscription subscribe(int auctionId);
}

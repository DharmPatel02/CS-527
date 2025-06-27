// src/main/java/com/database/auction/repository/AuctionEndSubscriptionRepository.java
package com.database.auction.repository;

import com.database.auction.entity.AuctionEndSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.Instant;
import java.util.List;

public interface AuctionEndSubscriptionRepository 
        extends JpaRepository<AuctionEndSubscription, Long> {
    List<AuctionEndSubscription> findByTriggeredFalseAndClosingTimeAfter(Instant now);
}

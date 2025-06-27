// src/main/java/com/database/auction/repository/AuctionStartSubscriptionRepository.java
package com.database.auction.repository;

import com.database.auction.entity.AuctionStartSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.time.Instant;

public interface AuctionStartSubscriptionRepository
        extends JpaRepository<AuctionStartSubscription,Long> {
    List<AuctionStartSubscription> findByTriggeredFalseAndStartTimeAfter(Instant now);
}

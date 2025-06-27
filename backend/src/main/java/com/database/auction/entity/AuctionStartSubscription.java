// src/main/java/com/database/auction/entity/AuctionStartSubscription.java
package com.database.auction.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "auction_start_subscriptions")
public class AuctionStartSubscription {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="buyer_id", nullable=false)
    private Integer buyerId;

    @Column(name="auction_id", nullable=false)
    private Integer auctionId;

    @Column(name="start_time", nullable=false)
    private Instant startTime;

    @Column(name="triggered", nullable=false)
    private Boolean triggered = false;

    // getters / setters ...
    public Long getId() { return id; }
    public Integer getBuyerId() { return buyerId; }
    public void setBuyerId(Integer buyerId) { this.buyerId = buyerId; }
    public Integer getAuctionId() { return auctionId; }
    public void setAuctionId(Integer auctionId) { this.auctionId = auctionId; }
    public Instant getStartTime() { return startTime; }
    public void setStartTime(Instant startTime) { this.startTime = startTime; }
    public Boolean getTriggered() { return triggered; }
    public void setTriggered(Boolean triggered) { this.triggered = triggered; }
}

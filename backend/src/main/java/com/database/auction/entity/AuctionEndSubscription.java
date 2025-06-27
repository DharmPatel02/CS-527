// src/main/java/com/database/auction/entity/AuctionEndSubscription.java
package com.database.auction.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Entity
@Getter
@Setter
@Table(name = "auction_end_subscriptions")
public class AuctionEndSubscription {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="auction_id", nullable=false)
    private Integer auctionId;

    @Column(name="closing_time", columnDefinition="DATETIME")
    private Instant closingTime;

    @Column(name="triggered", nullable=false)
    private Boolean triggered = false;

    // standard getters & setters
    public Long getId() { return id; }
    public Integer getAuctionId() { return auctionId; }
    public void setAuctionId(Integer auctionId) { this.auctionId = auctionId; }
    public Instant getClosingTime() { return closingTime; }
    public void setClosingTime(Instant closingTime) { this.closingTime = closingTime; }
    public Boolean getTriggered() { return triggered; }
    public void setTriggered(Boolean triggered) { this.triggered = triggered; }
}

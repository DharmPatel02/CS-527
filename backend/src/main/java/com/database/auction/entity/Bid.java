package com.database.auction.entity;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "bids")
public class Bid {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "bid_id")
    private Long bidId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "auction_id", nullable = false)
    private AuctionItems auctionItem;

    @Column(name = "buyer_id", nullable = false)
    private Integer buyerId;

    @Column(name = "bid_time", nullable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date bidTime;

    @Column(name = "bid_amount", nullable = false)
    private Double bidAmount;

    @Column(name = "reserve_price", nullable = false)
    private Double reservePrice;

    // Getters and setters

    public Long getBidId() {
        return bidId;
    }

    public AuctionItems getAuctionItem() {
        return auctionItem;
    }
    public void setAuctionItem(AuctionItems auctionItem) {
        this.auctionItem = auctionItem;
    }

    public Integer getBuyerId() {
        return buyerId;
    }
    public void setBuyerId(Integer buyerId) {
        this.buyerId = buyerId;
    }

    public Date getBidTime() {
        return bidTime;
    }
    public void setBidTime(Date bidTime) {
        this.bidTime = bidTime;
    }

    public Double getBidAmount() {
        return bidAmount;
    }
    public void setBidAmount(Double bidAmount) {
        this.bidAmount = bidAmount;
    }

    public Double getReservePrice() {
        return reservePrice;
    }
    public void setReservePrice(Double reservePrice) {
        this.reservePrice = reservePrice;
    }
}

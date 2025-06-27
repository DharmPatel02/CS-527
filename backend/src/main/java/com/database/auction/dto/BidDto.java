package com.database.auction.dto;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import java.util.Date;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class BidDto {
    private Long   bidId;
    private int    auctionId;
    private int    buyerId;
    private Date   bidTime;
    private Double bidAmount;
    private Double reservePrice;

    // Getters & setters

    public Long getBidId() {
        return bidId;
    }
    public void setBidId(Long bidId) {
        this.bidId = bidId;
    }

    public int getAuctionId() {
        return auctionId;
    }
    public void setAuctionId(int auctionId) {
        this.auctionId = auctionId;
    }

    public int getBuyerId() {
        return buyerId;
    }
    public void setBuyerId(int buyerId) {
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

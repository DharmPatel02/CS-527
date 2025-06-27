package com.database.auction.dto;

import com.database.auction.enums.Category;

import java.util.Date;
import java.util.List;


public class AuctionItemDto {

    private Long id;
    private int auctionId;
    private int sellerId;
    private String itemName;
    private Category category;
    private Double starting_price;
    private Double bidIncrement;
    private Date startTime;
    //    private Double reserve_price;
    private Date closingTime;
    private String description;
    private Double currentBid;
    
    // New field to hold image URLs
    private List<String> images;

    public AuctionItemDto() {
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public Double getCurrentBid() {
        return currentBid;
    }

    public void setCurrentBid(Double currentBid) {
        this.currentBid = currentBid;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public int getAuctionId() {
        return auctionId;
    }

    public void setAuctionId(int auctionId) {
        this.auctionId = auctionId;
    }

    public int getSellerId() {
        return sellerId;
    }

    public void setSellerId(int sellerId) {
        this.sellerId = sellerId;
    }

    public String getItemName() {
        return itemName;
    }

    public void setItemName(String itemName) {
        this.itemName = itemName;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public Double getStartingPrice() {
        return starting_price;
    }

    public void setStartingPrice(Double starting_price) {
        this.starting_price = starting_price;
    }

    public Double getBidIncrement() {
        return bidIncrement;
    }

    public void setBidIncrement(Double bidIncrement) {
        this.bidIncrement = bidIncrement;
    }

    public Date getStartTime() {
        return startTime;
    }
    public void setStartTime(Date startTime) {
        this.startTime = startTime;
    }

    public Date getClosingTime() {
        return closingTime;
    }

    public void setClosingTime(Date closingTime) {
        this.closingTime = closingTime;
    }

    public String getDescription() {
        return description;
    }
 
    public void setDescription(String description) {
        this.description = description;
    }
    
    public List<String> getImages() {
        return images;
    }
    
    public void setImages(List<String> images) {
        this.images = images;
    }
}

// src/main/java/com/database/auction/dto/BuyerOrderDTO.java
package com.database.auction.dto;

import com.database.auction.enums.Category;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import java.util.List;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class BuyerOrderDTO {
    private int auctionId;
    private List<String> images;
    private String description;
    private String itemName;
    private Category category;
    private Double currentBid;

    public int getAuctionId() { return auctionId; }
    public void setAuctionId(int auctionId) { this.auctionId = auctionId; }

    public List<String> getImages() { return images; }
    public void setImages(List<String> images) { this.images = images; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getItemName() { return itemName; }
    public void setItemName(String itemName) { this.itemName = itemName; }

    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }

    public Double getCurrentBid() { return currentBid; }
    public void setCurrentBid(Double currentBid) { this.currentBid = currentBid; }
}

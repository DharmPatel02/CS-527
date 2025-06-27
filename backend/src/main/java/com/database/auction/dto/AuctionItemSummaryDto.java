package com.database.auction.dto;

import com.database.auction.enums.Category;

import java.util.Date;
import java.util.List;

public class AuctionItemSummaryDto {

    private int auction_id;
    private List<String> images;
    private String description;
    private String item_name;
    private Category category;
   // private Double starting_price;
    private Date closing_time;
    private Double currentBid;
    private Date startTime;

    public AuctionItemSummaryDto() {
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    @Override
    public String toString() {
        return "AuctionItemSummaryDto{" +
                "auction_id=" + auction_id +
                ", images=" + images +
                ", description='" + description + '\'' +
                ", item_name='" + item_name + '\'' +
                ", category=" + category +
                ", starting_price=" + currentBid +
                ", closing_time=" + closing_time +
                '}';
    }

    public Double getCurrentBid() {
        return currentBid;
    }
    public void setCurrentBid(Double currentBid) {
        this.currentBid = currentBid;
    }

    public int getAuctionId() {
        return auction_id;
    }

    public void setAuctionId(int auction_id) {
        this.auction_id = auction_id;
    }

    public List<String> getImages() {
        return images;
    }

    public void setImages(List<String> images) {
        this.images = images;
    }

    public String getItemName() {
        return item_name;
    }
 
    public void setItemName(String itemName) {
        this.item_name = itemName;
    }

    public Date getStartTime() {
        return startTime;
    }
    public void setStartTime(Date startTime) {
        this.startTime = startTime;
    }
 
//    public Double getStartingPrice() {
//        return starting_price;
//    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

//    public void setStartingPrice(Double startingPrice) {
//        this.starting_price = startingPrice;
//    }
 
    public Date getClosingTime() {
        return closing_time;
    }
 
    public void setClosingTime(Date closingTime) {
        this.closing_time = closingTime;
    }
}

package com.database.auction.entity;

import com.database.auction.enums.Category;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "auction_items")
public class AuctionItems {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "auction_id", unique = true)
    private int auction_id;

    @Column(name = "seller_id")
    private int seller_id;

    @Column(name = "item_name")
    private String itemName;

    @Enumerated(EnumType.STRING)
    @Column(name = "category")
    private Category category;

    @Column(name = "starting_price")
    private Double starting_price;

    @Column(name = "bid_increment")
    private Double bid_increment;

//    @Column(name = "reserve_price")
//    private Double reserve_price;

    @Column(name = "closing_time")
    @Temporal(TemporalType.TIMESTAMP)
    private Date closingTime;

    @Column(name = "description")
    private String description;

    @Column(name = "current_bid")
    private Double currentBid;

    @Column(name = "start_time")
    @Temporal(TemporalType.TIMESTAMP)
    private Date startTime;

    // One auction item can have many images.
    @OneToMany(mappedBy = "auctionItem", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<AuctionImage> images = new ArrayList<>();

    @Column(name = "min_price")
    private Double minPrice;

    @Column(name = "buyer_id")
    private Integer winningBuyerId;

    public AuctionItems() {
    }

    // Getters and setters for all fields

    public Integer getWinningBuyerId() {
        return winningBuyerId;
    }
    public void setWinningBuyerId(Integer winningBuyerId) {
        this.winningBuyerId = winningBuyerId;
    }

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

    public int getauction_id() {
        return auction_id;
    }

    public void setauction_id(int auction_id) {
        this.auction_id = auction_id;
    }

    public int getseller_id() {
        return seller_id;
    }

    public void setseller_id(int seller_id) {
        this.seller_id = seller_id;
    }

    public String getitem_name() {
        return itemName;
    }

    public void setitem_name(String item_name) {
        this.itemName = item_name;
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

    public Double getbid_increment() {
        return bid_increment;
    }

    public void setbid_increment(Double bid_increment) {
        this.bid_increment = bid_increment;
    }

//    public Double getreserve_price() {
//        return reserve_price;
//    }
//
//    public void setreserve_price(Double reserve_price) {
//        this.reserve_price = reserve_price;
//    }

    public Date getClosingTime() {
        return closingTime;
    }

    public void setClosingTime(Date closing_time) {
        this.closingTime = closing_time;
    }

    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }

    public List<AuctionImage> getImages() {
        return images;
    }

    public void setImages(List<AuctionImage> images) {
        this.images = images;
    }

    public Double getMinPrice() {
        return minPrice;
    }

    public void setMinPrice(Double minPrice) {
        this.minPrice = minPrice;
    }

    public Date getStartTime() {
        return startTime;
    }
    public void setStartTime(Date startTime) {
        this.startTime = startTime;
    }

    @Override
    public String toString() {
        return "AuctionItems{" +
                "id=" + id +
                ", auction_id=" + auction_id +
                ", seller_id=" + seller_id +
                ", item_name='" + itemName + '\'' +
                ", category=" + category +
                ", startingPrice=" + starting_price +
                ", bid_increment=" + bid_increment +
                //", reserve_price=" + reserve_price +
                ", closingTime=" + closingTime +
                ", description='" + description + '\'' +
                ", images=" + images +
                '}';
    }
}

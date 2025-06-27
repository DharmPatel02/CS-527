package com.database.auction.service;

import com.database.auction.dto.BidDto;

import java.util.List;

public interface BidService {
    BidDto placeBid(BidDto bidDto);
    List<BidDto> getBidsByAuction(int auctionId);
    List<BidDto> getBidsByBuyer(int buyerId);
    String removeBid(int bid_id,int auction_id);
    List<BidDto> getAllBidsByAuction(int auctionId);
}

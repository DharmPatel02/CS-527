package com.database.auction.mapper;

import com.database.auction.dto.BidDto;
import com.database.auction.entity.Bid;
import org.springframework.stereotype.Component;

@Component
public class BidMapper {

    public BidDto toDto(Bid bid) {
        BidDto dto = new BidDto();
        dto.setBidId(bid.getBidId());
        dto.setAuctionId(bid.getAuctionItem().getId().intValue());
        dto.setBuyerId(bid.getBuyerId());
        dto.setBidTime(bid.getBidTime());
        dto.setBidAmount(bid.getBidAmount());
        dto.setReservePrice(bid.getReservePrice());
        return dto;
    }

    public Bid toEntity(BidDto dto, 
                        com.database.auction.entity.AuctionItems auctionItem, 
                        com.database.auction.entity.Users buyer) {
        Bid bid = new Bid();
        bid.setAuctionItem(auctionItem);
        bid.setBuyerId(buyer.getId().intValue());
        bid.setBidTime(dto.getBidTime());
        bid.setBidAmount(dto.getBidAmount());
        bid.setReservePrice(dto.getReservePrice());
        return bid;
    }
}

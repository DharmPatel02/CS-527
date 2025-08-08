package com.database.auction.mapper;


import com.database.auction.dto.AuctionItemDto;
import com.database.auction.dto.AuctionItemSummaryDto;
import com.database.auction.entity.AuctionItems;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Component
public class AuctionItemsMapper {

    public AuctionItemDto toDto(AuctionItems auctionItem) {
        if (auctionItem == null) {
            return null;
        }
        AuctionItemDto dto = new AuctionItemDto();
        dto.setId(auctionItem.getId());
        dto.setAuctionId(auctionItem.getauction_id());
        dto.setSellerId(auctionItem.getseller_id());
        dto.setItemName(auctionItem.getitem_name());
        dto.setCategory(auctionItem.getCategory());
        dto.setStartingPrice(auctionItem.getStartingPrice());
        dto.setBidIncrement(auctionItem.getbid_increment());
        //dto.setreserve_price(auctionItem.getreserve_price());
        dto.setClosingTime(auctionItem.getClosingTime());
        dto.setDescription(auctionItem.getDescription());
        dto.setCurrentBid(auctionItem.getCurrentBid());
        dto.setStartTime(auctionItem.getStartTime());
        // ← here’s the change: build full URLs
        List<String> imageUrls = auctionItem.getImages().stream()
                .limit(1)
                .map(img -> "/auth/auction-items/"
                        + auctionItem.getId()
                        + "/images/"
                        + img.getId())
                .collect(Collectors.toList());
        dto.setImages(imageUrls);


        return dto;
    }

    public AuctionItems toEntity(AuctionItemDto dto) {
        if (dto == null) {
            return null;
        }
        AuctionItems auctionItem = new AuctionItems();
        //auctionItem.setauction_id(dto.getAuctionId());
        auctionItem.setseller_id(dto.getSellerId());
        auctionItem.setitem_name(dto.getItemName());
        auctionItem.setCategory(dto.getCategory());
        auctionItem.setStartingPrice(dto.getStartingPrice());
        auctionItem.setbid_increment(dto.getBidIncrement());
        //auctionItem.setreserve_price(dto.getreserve_price());
        auctionItem.setClosingTime(dto.getClosingTime());
        auctionItem.setDescription(dto.getDescription());
        auctionItem.setCurrentBid(dto.getCurrentBid());
        // The images will be processed in the service if provided.
        return auctionItem;
    }

    public AuctionItemSummaryDto toSummaryDto(AuctionItems auctionItem) {
        if (auctionItem == null) {
            return null;
        }
        AuctionItemSummaryDto summaryDto = new AuctionItemSummaryDto();
//        List<String> firstImageOnly = auctionItem.getImages().stream()
//                .map(AuctionImage::getImageUrl)
//                .limit(1)  // <-- stops after the first element
//                .collect(Collectors.toList());
//        summaryDto.setImages(firstImageOnly);

        List<String> firstImageUrl = auctionItem.getImages().stream()
                .limit(1)
                .map(img -> "/auth/auction-items/"
                        + auctionItem.getId()
                        + "/images/"
                        + img.getId())
                .collect(Collectors.toList());
        summaryDto.setImages(firstImageUrl);


        summaryDto.setItemName(auctionItem.getitem_name());
        // Pass the Category enum directly instead of converting it to string.
        summaryDto.setCategory(auctionItem.getCategory());
        summaryDto.setStartTime(auctionItem.getStartTime());
        //summaryDto.setStartingPrice(auctionItem.getStartingPrice());
        summaryDto.setCurrentBid(auctionItem.getCurrentBid());
        summaryDto.setClosingTime(auctionItem.getClosingTime());
        summaryDto.setAuctionId(auctionItem.getauction_id());
        summaryDto.setDescription(auctionItem.getDescription());
        log.info(summaryDto.toString());
        return summaryDto;
    }
}
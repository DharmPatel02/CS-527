package com.database.auction.service;


import com.database.auction.dto.*;
import com.database.auction.entity.AuctionItems;
import com.database.auction.enums.Category;

import java.util.List;
import java.util.Optional;

public interface AuctionItemsService {
    List<AuctionItemDto> findAllAuctionItems();
    List<AuctionItemSummaryDto> findAllAuctionItemSummaries();
    AuctionItemDto findAuctionItemByAuctionId(int auctionId);
    List<AuctionItemSummaryDto> findAuctionItemsByCategory(Category category);
    AuctionItemDto insertAuctionItem(AuctionItemDto auctionItemDto);
    List<AuctionItemSellerSummaryDto> findSellerSummary(int sellerId);
    int updateanswer(int question_id,int auction_id,String answer);
    int insertquestion(int auctionId, String question);
    List<QuestionDTO> getallquessans(int auction_id);
    List<AuctionItemDto> getSalesReportByAuctionId(Integer auctionId);
    List<AuctionItemDto> getsalesreportByCategory(String category);
    List<AuctionItemDto> getsalesreportBySellerId(Integer seller_id);
    List<AuctionItemDto> getsalesreport();
    /** Get all orders a buyer has won (only past auctions) */
    List<BuyerOrderDTO> findOrdersByBuyer(int buyerId);

    List<AuctionItemDto> searchAuctions(String query);

    List<QuestionDTO> getUnansweredQuestions(int auctionId);
    List getsalesreportforBestBuyer();
}

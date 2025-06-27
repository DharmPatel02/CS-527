package com.database.auction.repository;


import com.database.auction.dto.AuctionItemDto;
import com.database.auction.entity.AuctionItems;
import com.database.auction.enums.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Repository
public interface AuctionItemsRepository extends JpaRepository<AuctionItems, Long> {
    @Query(
            value = "SELECT * FROM Auction_Items WHERE auction_id = :auctionId",
            nativeQuery = true
    )
    Optional<AuctionItems> findByAuctionIdNative(@Param("auctionId") int auctionId);

    List<AuctionItems> findAllByCategory(Category category);
    /** Returns the current maximum id in the table, or 0 if empty */
    @Query("SELECT COALESCE(MAX(a.id), 0) FROM AuctionItems a")
    Long findMaxId();

    /** Returns the current maximum auction_id in the table, or 0 if empty */
    @Query("SELECT COALESCE(MAX(a.auction_id), 0) FROM AuctionItems a")
    Long findMaxAuctionId();

    /** Find all auctions listed by a given seller_id */
    @Query("SELECT a FROM AuctionItems a WHERE a.seller_id = :sellerId")
    List<AuctionItems> findBySellerId(@Param("sellerId") int sellerId);

    /** Find closed auctions where the given buyer was recorded as winner */
    List<AuctionItems> findByWinningBuyerIdAndClosingTimeBefore(Integer buyerId, Date now);

    // 1) text search on name or description
    List<AuctionItems> findByItemNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
            String itemName, String description);

    // 2) exact match on current bid (optional)
    List<AuctionItems> findByCurrentBid(Double currentBid);
}

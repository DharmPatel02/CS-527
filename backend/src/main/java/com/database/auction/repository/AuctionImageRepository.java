package com.database.auction.repository;

import com.database.auction.entity.AuctionImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuctionImageRepository extends JpaRepository<AuctionImage, Long> {
    /**
     * Find all images belonging to a given auction item.
     */
    List<AuctionImage> findAllByAuctionItem_Id(Long auctionItemId);
}

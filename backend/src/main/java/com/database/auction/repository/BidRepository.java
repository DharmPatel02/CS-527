package com.database.auction.repository;

import com.database.auction.entity.Bid;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BidRepository extends JpaRepository<Bid, Long> {
    List<Bid> findAllByAuctionItem_Id(Long auctionItemId);
    List<Bid> findAllByBuyer_UserId(int buyerId);
}

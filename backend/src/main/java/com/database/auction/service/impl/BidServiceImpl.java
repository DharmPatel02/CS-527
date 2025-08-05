// src/main/java/com/database/auction/service/impl/BidServiceImpl.java
package com.database.auction.service.impl;

import com.database.auction.dto.BidDto;
import com.database.auction.entity.AuctionItems;
import com.database.auction.entity.Bid;
import com.database.auction.entity.Users;
import com.database.auction.exception.AuctionItemNotFoundException;
import com.database.auction.exception.UserNotFound;
import com.database.auction.mapper.BidMapper;
import com.database.auction.repository.AuctionItemsRepository;
import com.database.auction.repository.BidRepository;
import com.database.auction.repository.UsersRepository;
import com.database.auction.service.BidService;
import com.database.auction.service.NotificationService;
import jakarta.persistence.EntityNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
public class BidServiceImpl implements BidService {

    private final BidRepository bidRepo;
    private final AuctionItemsRepository itemsRepo;
    private final UsersRepository usersRepo;
    private final BidMapper mapper;
    private final JdbcTemplate jdbc;
    private final NotificationService notificationService;

    @Autowired
    public BidServiceImpl(
            BidRepository bidRepo,
            AuctionItemsRepository itemsRepo,
            UsersRepository usersRepo,
            BidMapper mapper,
            JdbcTemplate jdbc,
            NotificationService notificationService) {
        this.bidRepo            = bidRepo;
        this.itemsRepo          = itemsRepo;
        this.usersRepo          = usersRepo;
        this.mapper             = mapper;
        this.jdbc               = jdbc;
        this.notificationService = notificationService;
    }

//    @Override
//    public BidDto placeBid(BidDto dto) {
//        log.info("Placing bid by buyer {} on auction {}", dto.getBuyerId(), dto.getAuctionId());
//
//        // 1) Load auction and buyer
//        AuctionItems item = itemsRepo
//                .findByAuctionIdNative(dto.getAuctionId())
//                .orElseThrow(() -> new AuctionItemNotFoundException(
//                        "Auction not found: " + dto.getAuctionId()));
//        Users buyer = usersRepo.findById(dto.getBuyerId())
//                .orElseThrow(() -> new UserNotFound(
//                        "Buyer not found: " + dto.getBuyerId()));
//
//        // 2) Ensure bidTime is set
//        if (dto.getBidTime() == null) {
//            dto.setBidTime(new Date());
//        }
//
//        // 3) Null-safe defaults
//        double increment = Optional.ofNullable(item.getbid_increment()).orElse(0.0);
//        double floor     = Optional.ofNullable(item.getMinPrice())     .orElse(0.0);
//
//        // 4) Persist the new bid
//        Bid newBid   = mapper.toEntity(dto, item, buyer);
//        Bid savedBid = bidRepo.save(newBid);
//
//        // 5) Recompute currentBid
//        List<Bid> allBids = bidRepo.findAllByAuctionItem_Id(item.getId());
//        // sort descending by reservePrice
//        allBids.sort(Comparator.comparing(Bid::getReservePrice).reversed());
//        double highestReserve = allBids.get(0).getReservePrice();
//        double secondReserve  = allBids.size() > 1
//                ? allBids.get(1).getReservePrice()
//                : highestReserve;
//        double newCurrentBid  = secondReserve + increment;
//        item.setCurrentBid(newCurrentBid);
//
//        // 6) Determine winning buyer above floor
//        Optional<Bid> winner = allBids.stream()
//                .filter(b -> b.getReservePrice() != null && b.getReservePrice() > floor)
//                .max(Comparator.comparing(Bid::getReservePrice));
//        item.setWinningBuyerId(
//                winner.map(b -> b.getBuyer().getUserId()).orElse(null)
//        );
//
//        itemsRepo.save(item);
//
//        // 7) Outbid notifications
//        int newBidderId     = savedBid.getBuyer().getUserId();
//        int currentWinnerId = allBids.get(0).getBuyer().getUserId();
//        if (newBidderId != currentWinnerId) {
//            String msg = String.format(
//                    "Your bid on auction %d was not high enough. Current top bid: £%.2f",
//                    dto.getAuctionId(), newCurrentBid);
//            notificationService.alertOutbid(newBidderId, dto.getAuctionId(), msg);
//        }
//
//        // Notify previous top bidder if they were beaten
//        // (we captured previousTop in previous version if needed)
//
//        return mapper.toDto(savedBid);
//    }

    @Override
    public BidDto placeBid(BidDto dto) {
        log.info("Placing bid by buyer {} on auction {}", dto.getBuyerId(), dto.getAuctionId());

        // 1) Load auction and buyer
        AuctionItems item = itemsRepo
                .findByAuctionIdNative(dto.getAuctionId())
                .orElseThrow(() -> new AuctionItemNotFoundException(
                        "Auction not found: " + dto.getAuctionId()));
        Users buyer = usersRepo.findById((long) dto.getBuyerId())
                .orElseThrow(() -> new UserNotFound(
                        "Buyer not found: " + dto.getBuyerId()));

        if (dto.getBidTime() == null) {
            dto.setBidTime(new Date());
        }

        // 2) Capture previous top (if any)
        Optional<Bid> previousTop = bidRepo
                .findAllByAuctionItem_Id(item.getId()).stream()
                .max(Comparator.comparing(Bid::getReservePrice));

        // 3) Save the new bid
        Bid newBid   = mapper.toEntity(dto, item, buyer);
        Bid savedBid = bidRepo.save(newBid);

        // 4) Recompute currentBid
        List<Bid> allBids = bidRepo.findAllByAuctionItem_Id(item.getId());
        // sort descending by reservePrice
        allBids.sort(Comparator.comparing(Bid::getReservePrice).reversed());

        double newCurrentBid;
        if (allBids.size() == 1) {
            // --- FIRST BID: startingPrice + bidIncrement
            newCurrentBid = item.getStartingPrice() + item.getbid_increment();
        } else {
            // --- SECOND OR LATER BID: second-highest + increment
            double secondReserve = allBids.get(1).getReservePrice();
            newCurrentBid = secondReserve + item.getbid_increment();
        }
        item.setCurrentBid(newCurrentBid);

        // 5) Determine the “winner” floor logic
        Double floor = item.getMinPrice();
        Optional<Bid> winner = allBids.stream()
                .filter(b -> b.getReservePrice() != null && b.getReservePrice() > floor)
                .max(Comparator.comparing(Bid::getReservePrice));

        item.setWinningBuyerId(
                winner.map(b -> b.getBuyerId()).orElse(null)
        );

        itemsRepo.save(item);

        // 6a) If this new bid was NOT the top bid, notify this bidder
        Bid highestBid = allBids.get(0);
        int newBidderId      = savedBid.getBuyerId();
        int currentWinnerId  = highestBid.getBuyerId();
        if (newBidderId != currentWinnerId) {
            String msg = String.format(
                    "Your bid on auction %d was not high enough. Current top bid: £%.2f",
                    dto.getAuctionId(), newCurrentBid
            );
            notificationService.alertOutbid(newBidderId, dto.getAuctionId(), msg);
            log.info("Notified bidder {} that they were outbid", newBidderId);
        }

        // 6b) If there was a previous top and they lost, notify them too
        if (previousTop.isPresent()) {
            Bid oldTop   = previousTop.get();
            int oldUserId = oldTop.getBuyerId();
            if (oldUserId != currentWinnerId) {
                String msg = String.format(
                        "You have been outbid on auction %d. New top bid: £%.2f",
                        dto.getAuctionId(), newCurrentBid
                );
                notificationService.alertOutbid(oldUserId, dto.getAuctionId(), msg);
                log.info("Notified previous top bidder {} of being outbid", oldUserId);
            }
        }

        // 7) Return the saved bid DTO
        return mapper.toDto(savedBid);
    }

    @Override
    public List<BidDto> getBidsByAuction(int auctionId) {
        AuctionItems item = itemsRepo
                .findByAuctionIdNative(auctionId)
                .orElseThrow(() -> new AuctionItemNotFoundException(
                        "Auction not found: " + auctionId));
        return bidRepo.findAllByAuctionItem_Id(item.getId())
                .stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<BidDto> getBidsByBuyer(int buyerId) {
        usersRepo.findById((long) buyerId)
                .orElseThrow(() -> new UserNotFound("Buyer not found: " + buyerId));
        return bidRepo.findAllByBuyerId(buyerId)
                .stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    /*@Override
    public List<BidDto> getAllBidsByAuction(int auctionId) {
        String sql = """
            SELECT bid_id,
                   auction_id,
                   bidder_id,
                   amount   AS bid_amount,
                   placed_at AS bid_time,
                   reserve_price
              FROM bids
             WHERE auction_id = ?
             ORDER BY placed_at ASC
            """;
        return jdbc.query(
                sql,
                new Object[]{ auctionId },
                (rs, rowNum) -> {
                    BidDto b = new BidDto();
                    b.setBidId(        rs.getLong("bid_id"));
                    b.setAuctionId(    rs.getInt("auction_id"));
                    b.setBuyerId(      rs.getInt("bidder_id"));
                    b.setBidAmount(    rs.getDouble("bid_amount"));
                    b.setBidTime(      rs.getTimestamp("bid_time"));
                    b.setReservePrice( rs.getDouble("reserve_price"));
                    return b;
                }
        );
    }*/

    @Override
    public List<BidDto> getAllBidsByAuction(int auctionId) {
        String sql = """
            SELECT bid_id,
                   auction_id,
                   buyer_id,
                   bid_amount,
                   bid_time,
                   reserve_price
              FROM bids
             WHERE auction_id = ?
             ORDER BY bid_time ASC
            """;
        return jdbc.query(
                sql,
                new Object[]{ auctionId },
                (rs, rowNum) -> {
                    BidDto b = new BidDto();
                    b.setBidId(        rs.getLong("bid_id"));
                    b.setAuctionId(    rs.getInt("auction_id"));
                    b.setBuyerId(      rs.getInt("buyer_id"));
                    b.setBidAmount(    rs.getDouble("bid_amount"));
                    b.setBidTime(      rs.getTimestamp("bid_time"));
                    b.setReservePrice( rs.getDouble("reserve_price"));
                    return b;
                }
        );
    }

    @Override
    public String removeBid(int bidId, int auctionId) {
        String sql = "DELETE FROM bids WHERE bid_id = ? AND auction_id = ?";
        int rows = jdbc.update(sql, bidId, auctionId);
        if (rows != 1) {
            throw new EntityNotFoundException("Bid not found: " + bidId);
        }
        return "Bid Deleted Successfully";
    }
}

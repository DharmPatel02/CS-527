package com.database.auction.repository;

import com.database.auction.entity.AuctionQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface QuestionRepository 
    extends JpaRepository<AuctionQuestion, Integer> {

    /** 
     * Find all questions for a given auction item.
     * Spring Data derives the SQL: 
     *   SELECT * FROM auction_questions 
     *    WHERE auction_item_id = :itemId
     */
    //List<AuctionQuestion> findByAuctionItem_AuctionItemId(Integer itemId);

    /**
     * (Optional) find only those with non-null answers
     */
   // List<AuctionQuestion> findByAuctionItem_AuctionItemIdAndAnswerIsNotNull(Integer itemId);
}
package com.database.auction.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@ToString
@NoArgsConstructor
@Entity
@Table(
        name    = "auction_questions",
        indexes = @Index(name = "idx_auction_id", columnList = "auction_id")
)
public class AuctionQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "question_id", updatable = false, nullable = false)
    private Integer questionId;

    @Column(name = "auction_id", nullable = false)
    private Integer auctionId;

    @Column(name = "question", columnDefinition = "TEXT", nullable = false)
    private String question;

    @Column(name = "answer", columnDefinition = "TEXT")
    private String answer;



    @Builder
    public AuctionQuestion(Integer auctionId,
                           String question,
                           String answer,
                           LocalDateTime askedAt,
                           LocalDateTime answeredAt) {
        this.auctionId    = auctionId;
        this.question     = question;
        this.answer       = answer;

    }
}

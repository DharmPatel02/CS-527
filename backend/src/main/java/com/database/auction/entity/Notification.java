
package com.database.auction.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Entity
@Getter
@Setter
@Table(name = "notifications")
public class Notification {
  @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
  private Long id;

  @Column(name="user_id", nullable=false)
  private Integer userId;

  @Column(name="auction_id", nullable=false)
  private Integer auctionId;

  @Column(nullable=false)
  private String message;

  @Column(name="created_at", nullable=false, updatable=false)
  private Instant createdAt = Instant.now();

  @Column(name="is_read", nullable=false)
  private Boolean isRead = false;

}

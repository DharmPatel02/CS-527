// com/database/auction/service/impl/NotificationServiceImpl.java
package com.database.auction.service.impl;

import com.database.auction.entity.Notification;
import com.database.auction.repository.NotificationRepository;
import com.database.auction.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class NotificationServiceImpl implements NotificationService {
  private final NotificationRepository repo;
  @Autowired
  public NotificationServiceImpl(NotificationRepository repo){
    this.repo = repo;
  }

  @Override
  public void alertOutbid(int userId, int auctionId, String message) {
    Notification n = new Notification();
    n.setUserId(userId);
    n.setAuctionId(auctionId);
    n.setMessage(message);
    repo.save(n);
  }

  @Override
  public List<Notification> fetchUnread(int userId) {
    return repo.findByUserIdAndIsReadFalse(userId);
  }

  @Override
  public void markRead(Long notificationId) {
    repo.findById(notificationId).ifPresent(n -> {
      n.setIsRead(true);
      repo.save(n);
    });
  }
}

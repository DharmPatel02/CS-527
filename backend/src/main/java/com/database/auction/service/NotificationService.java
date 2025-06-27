// com/database/auction/service/NotificationService.java
package com.database.auction.service;

import com.database.auction.entity.Notification;
import java.util.List;

public interface NotificationService {
  void alertOutbid(int userId, int auctionId, String message);
  List<Notification> fetchUnread(int userId);
  void markRead(Long notificationId);
}

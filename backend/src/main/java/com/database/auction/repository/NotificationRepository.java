// com/database/auction/repository/NotificationRepository.java
package com.database.auction.repository;

import com.database.auction.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
  List<Notification> findByUserIdAndIsReadFalse(Integer userId);
}

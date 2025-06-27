// com/database/auction/controller/NotificationController.java
package com.database.auction.controllers;

import com.database.auction.entity.Notification;
import com.database.auction.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/auth/notifications")
@CrossOrigin("http://localhost:3000")
public class NotificationController {
  private final NotificationService service;
  @Autowired
  public NotificationController(NotificationService service) {
    this.service = service;
  }

  /** Fetch unread notifications for the current user */
  @GetMapping
  public ResponseEntity<List<Notification>> getUnread(
      @RequestParam("userId") int userId) {
    return ResponseEntity.ok(service.fetchUnread(userId));
  }

  /** Mark one notification as read */
  @PostMapping("/{id}/read")
  public ResponseEntity<Void> markRead(@PathVariable Long id) {
    service.markRead(id);
    return ResponseEntity.ok().build();
  }
}

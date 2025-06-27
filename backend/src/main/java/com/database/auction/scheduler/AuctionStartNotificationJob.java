// src/main/java/com/database/auction/jobs/AuctionStartNotificationJob.java
package com.database.auction.scheduler;

import com.database.auction.entity.AuctionStartSubscription;
import com.database.auction.repository.AuctionStartSubscriptionRepository;
import com.database.auction.service.NotificationService;
import lombok.extern.slf4j.Slf4j;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobDataMap;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Slf4j
@Component
public class AuctionStartNotificationJob implements Job {

    @Autowired
    private AuctionStartSubscriptionRepository subRepo;

    @Autowired
    private NotificationService notificationService;

    @Override
    public void execute(JobExecutionContext context) {
        JobDataMap data = context.getMergedJobDataMap();
        Long subId = data.getLong("subscriptionId");
        log.info("Job fired: AuctionStartNotificationJob for subscriptionId={}", subId);


        Optional<AuctionStartSubscription> maybeSub = subRepo.findById(subId);
        if (maybeSub.isEmpty()) return;

        AuctionStartSubscription sub = maybeSub.get();
        if (Boolean.TRUE.equals(sub.getTriggered())) return;

        // 1) send the “live now” notification
        String msg = String.format("Your auction %d is now live!", sub.getAuctionId());
        notificationService.alertOutbid(
            sub.getBuyerId(), 
            sub.getAuctionId(), 
            msg
        );

        // 2) mark subscription triggered
        sub.setTriggered(true);
        subRepo.save(sub);
    }
}

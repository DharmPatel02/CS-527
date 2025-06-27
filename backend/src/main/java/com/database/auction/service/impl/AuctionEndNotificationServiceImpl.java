// src/main/java/com/database/auction/service/impl/AuctionEndNotificationServiceImpl.java
package com.database.auction.service.impl;

import com.database.auction.entity.AuctionEndSubscription;
import com.database.auction.entity.AuctionItems;
import com.database.auction.exception.AuctionItemNotFoundException;

import com.database.auction.repository.AuctionEndSubscriptionRepository;
import com.database.auction.repository.AuctionItemsRepository;
import com.database.auction.scheduler.AuctionEndNotificationJob;
import com.database.auction.service.AuctionEndNotificationService;
import jakarta.annotation.PostConstruct;
import org.quartz.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


import java.time.Instant;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;

@Service
public class AuctionEndNotificationServiceImpl implements AuctionEndNotificationService {

    @Autowired private AuctionEndSubscriptionRepository subRepo;
    @Autowired private AuctionItemsRepository         itemsRepo;
    @Autowired private Scheduler                       scheduler;

    /** on startup, re-schedule any not yet triggered */
    @PostConstruct
    public void rescheduleExisting() {
        List<AuctionEndSubscription> subs = 
            subRepo.findByTriggeredFalseAndClosingTimeAfter(Instant.now());
        subs.forEach(this::scheduleJob);
    }

    @Override
    public AuctionEndSubscription subscribe(int auctionId) {
        AuctionItems item = itemsRepo.findById((long) auctionId)
            .orElseThrow(() -> new AuctionItemNotFoundException(
                "Auction not found: " + auctionId));

        AuctionEndSubscription sub = new AuctionEndSubscription();
        sub.setAuctionId(auctionId);
        //Date closingtime = item.atZone(ZoneId.systemDefault()).toInstant();
        sub.setClosingTime(item.getClosingTime().toInstant());
        sub = subRepo.save(sub);

        scheduleJob(sub);
        return sub;
    }

    /** schedule the Quartz trigger for this subscription */
    private void scheduleJob(AuctionEndSubscription sub) {
        JobDetail job = JobBuilder.newJob(AuctionEndNotificationJob.class)
            .withIdentity("endSub-" + sub.getId(), "auction-end")
            .usingJobData("subscriptionId", sub.getId())
            .build();

        Trigger trig = TriggerBuilder.newTrigger()
            .withIdentity("endTrig-" + sub.getId(), "auction-end")
            .startAt(java.util.Date.from(sub.getClosingTime()))
            .withSchedule(SimpleScheduleBuilder.simpleSchedule()
                .withMisfireHandlingInstructionFireNow())
            .build();

        try {
            scheduler.scheduleJob(job, trig);
        } catch (SchedulerException e) {
            throw new RuntimeException(e);
        }
    }
}

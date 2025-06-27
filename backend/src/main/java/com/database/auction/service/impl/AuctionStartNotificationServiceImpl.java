package com.database.auction.service.impl;

import com.database.auction.entity.AuctionStartSubscription;
import com.database.auction.entity.AuctionItems;
import com.database.auction.exception.AuctionItemNotFoundException;

import com.database.auction.repository.AuctionItemsRepository;
import com.database.auction.repository.AuctionStartSubscriptionRepository;
import com.database.auction.scheduler.AuctionStartNotificationJob;
import com.database.auction.service.AuctionStartNotificationService;
import jakarta.annotation.PostConstruct;
import org.quartz.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


import java.time.Instant;
import java.util.List;

@Service
public class AuctionStartNotificationServiceImpl implements AuctionStartNotificationService {
    private final AuctionStartSubscriptionRepository subRepo;
    private final AuctionItemsRepository itemsRepo;
    private final Scheduler scheduler;

    @Autowired
    public AuctionStartNotificationServiceImpl(
            AuctionStartSubscriptionRepository subRepo,
            AuctionItemsRepository itemsRepo,
            Scheduler scheduler) {
        this.subRepo = subRepo;
        this.itemsRepo = itemsRepo;
        this.scheduler = scheduler;
    }

    /** On startup, reschedule any subscriptions still pending */
    @PostConstruct
    public void scheduleExisting() {
        Instant now = Instant.now();
        List<AuctionStartSubscription> subs =
                subRepo.findByTriggeredFalseAndStartTimeAfter(now);
        subs.forEach(this::scheduleJob);
    }

    /** Called by your controller */
    @Override
    public AuctionStartSubscription subscribe(int buyerId, int auctionId) {
        // 1) Load auction to get its startTime
        AuctionItems item = itemsRepo
                .findByAuctionIdNative(auctionId)
                .orElseThrow(() -> new AuctionItemNotFoundException(
                        "Auction not found: " + auctionId));

        Instant startTime = item.getStartTime().toInstant();


        // 2) Save subscription
        AuctionStartSubscription sub = new AuctionStartSubscription();
        sub.setBuyerId(buyerId);
        sub.setAuctionId(auctionId);
        sub.setStartTime(startTime);
        sub = subRepo.save(sub);

        // 3) Schedule the Quartz job
        scheduleJob(sub);
        return sub;
    }

    private void scheduleJob(AuctionStartSubscription sub) {
        JobDetail job = JobBuilder.newJob(AuctionStartNotificationJob.class)
                .withIdentity("startNoti-" + sub.getId(), "auction-start")
                .usingJobData("subscriptionId", sub.getId())
                .build();

        Trigger trigger = TriggerBuilder.newTrigger()
                .withIdentity("startTrig-" + sub.getId(), "auction-start")
                .startAt(java.util.Date.from(sub.getStartTime()))
                .withSchedule(SimpleScheduleBuilder.simpleSchedule()
                        .withMisfireHandlingInstructionFireNow())
                .build();

        try {
            scheduler.scheduleJob(job, trigger);
        } catch (SchedulerException e) {
            throw new RuntimeException("Failed to schedule auction‐start job", e);
        }
    }
}

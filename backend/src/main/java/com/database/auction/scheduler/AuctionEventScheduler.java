package com.database.auction.scheduler;// inside your existing scheduler class, e.g. AuctionEventScheduler.java


import com.database.auction.entity.AuctionItems;
import com.database.auction.repository.AuctionItemsRepository;
import lombok.extern.slf4j.Slf4j;
import org.quartz.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.List;

@Component
@Slf4j
public class AuctionEventScheduler {
    private final Scheduler                scheduler;
    private final AuctionItemsRepository itemsRepo;

    @Autowired
    public AuctionEventScheduler(Scheduler scheduler,
            AuctionItemsRepository itemsRepo) {
        this.scheduler = scheduler;
        this.itemsRepo = itemsRepo;
    }

    /** on startup, schedule both start and end jobs for all future auctions */
    @EventListener(ContextRefreshedEvent.class)
    public void scheduleAllAuctions() throws SchedulerException {
        log.info("🔔 scheduleAllAuctions() called");
        List<AuctionItems> all = itemsRepo.findAll();
        log.info("🔔 Found {} auctions in DB", all.size());
        Date now = new Date();

        for (AuctionItems a : all) {
            Date closeAt = a.getClosingTime();
            boolean future = closeAt.after(now);
            log.info("→ auction {} closes at {} (future? {})",
                    a.getauction_id(), closeAt, future);
            //Date closeAt = a.getClosingTime();
            if (closeAt.after(now)) {
                JobKey   endJobKey = new JobKey("endJob-" + a.getauction_id(), "auction-end");
                if (!scheduler.checkExists(endJobKey)) {
                    JobDetail job = JobBuilder.newJob(AuctionEndNotificationJob.class)
                        .withIdentity(endJobKey)
                        .usingJobData("auctionId", a.getauction_id())
                        .build();

                    Trigger trigger = TriggerBuilder.newTrigger()
                        .withIdentity("endTrig-" + a.getauction_id(), "auction-end")
                        .startAt(closeAt)
                        .withSchedule(SimpleScheduleBuilder.simpleSchedule()
                            .withMisfireHandlingInstructionFireNow())
                        .build();

                    scheduler.scheduleJob(job, trigger);
                    log.info("Scheduled AuctionEndNotificationJob for auction {} at {}",
                             a.getauction_id(), closeAt);
                }
            }
        }
    }

    /** call this in your upload‐controller after saving a new auction */
    public void scheduleEndForAuction(AuctionItems a) throws SchedulerException {
        Date closeAt = a.getClosingTime();
        if (closeAt.after(new Date())) {
            JobDetail job = JobBuilder.newJob(AuctionEndNotificationJob.class)
                .withIdentity("endJob-" + a.getauction_id(), "auction-end")
                .usingJobData("auctionId", a.getauction_id())
                .build();
            Trigger trigger = TriggerBuilder.newTrigger()
                .withIdentity("endTrig-" + a.getauction_id(), "auction-end")
                .startAt(closeAt)
                .withSchedule(SimpleScheduleBuilder.simpleSchedule()
                    .withMisfireHandlingInstructionFireNow())
                .build();
            scheduler.scheduleJob(job, trigger);
            log.info("Scheduled end‐job for new auction {} at {}", a.getauction_id(), closeAt);
        }
    }
}

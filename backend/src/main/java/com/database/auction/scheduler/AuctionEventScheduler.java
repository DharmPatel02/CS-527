package com.database.auction.scheduler;// inside your existing scheduler class, e.g. AuctionEventScheduler.java


import com.database.auction.entity.AuctionItems;
import com.database.auction.repository.AuctionItemsRepository;
import lombok.extern.slf4j.Slf4j;
import org.quartz.*;
import org.quartz.impl.matchers.GroupMatcher;
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
        
        // Clear any existing auction-end group jobs/triggers to prevent conflicts
        try {
            var jobKeys = scheduler.getJobKeys(GroupMatcher.jobGroupEquals("auction-end"));
            if (!jobKeys.isEmpty()) {
                scheduler.deleteJobs(List.copyOf(jobKeys));
                log.info("🔔 Cleared {} existing auction-end jobs/triggers", jobKeys.size());
            }
        } catch (Exception e) {
            log.warn("Could not clear existing jobs: {}", e.getMessage());
        }
        
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
                JobKey     endJobKey = new JobKey("endJob-" + a.getauction_id(), "auction-end");
                TriggerKey endTrigKey = new TriggerKey("endTrig-" + a.getauction_id(), "auction-end");
                
                // Check if both job and trigger already exist
                if (!scheduler.checkExists(endJobKey) && !scheduler.checkExists(endTrigKey)) {
                    JobDetail job = JobBuilder.newJob(AuctionEndNotificationJob.class)
                        .withIdentity(endJobKey)
                        .usingJobData("auctionId", a.getauction_id())
                        .build();

                    Trigger trigger = TriggerBuilder.newTrigger()
                        .withIdentity(endTrigKey)
                        .startAt(closeAt)
                        .withSchedule(SimpleScheduleBuilder.simpleSchedule()
                            .withMisfireHandlingInstructionFireNow())
                        .build();

                    scheduler.scheduleJob(job, trigger);
                    log.info("Scheduled AuctionEndNotificationJob for auction {} at {}",
                             a.getauction_id(), closeAt);
                } else {
                    log.info("Job or trigger already exists for auction {}, skipping...", a.getauction_id());
                }
            }
        }
    }

    /** call this in your upload‐controller after saving a new auction */
    public void scheduleEndForAuction(AuctionItems a) throws SchedulerException {
        Date closeAt = a.getClosingTime();
        if (closeAt.after(new Date())) {
            JobKey     endJobKey = new JobKey("endJob-" + a.getauction_id(), "auction-end");
            TriggerKey endTrigKey = new TriggerKey("endTrig-" + a.getauction_id(), "auction-end");
            
            // Only schedule if job and trigger don't already exist
            if (!scheduler.checkExists(endJobKey) && !scheduler.checkExists(endTrigKey)) {
                JobDetail job = JobBuilder.newJob(AuctionEndNotificationJob.class)
                    .withIdentity(endJobKey)
                    .usingJobData("auctionId", a.getauction_id())
                    .build();
                Trigger trigger = TriggerBuilder.newTrigger()
                    .withIdentity(endTrigKey)
                    .startAt(closeAt)
                    .withSchedule(SimpleScheduleBuilder.simpleSchedule()
                        .withMisfireHandlingInstructionFireNow())
                    .build();
                scheduler.scheduleJob(job, trigger);
                log.info("Scheduled end‐job for new auction {} at {}", a.getauction_id(), closeAt);
            } else {
                log.info("Job or trigger already exists for auction {}, skipping schedule...", a.getauction_id());
            }
        }
    }
}

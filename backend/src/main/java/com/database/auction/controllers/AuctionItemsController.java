package com.database.auction.controllers;


import com.database.auction.dto.*;
import com.database.auction.entity.AuctionImage;
import com.database.auction.entity.AuctionItems;
import com.database.auction.enums.Category;
import com.database.auction.exception.AuctionItemNotFoundException;
import com.database.auction.mapper.AuctionItemsMapper;
import com.database.auction.repository.AuctionImageRepository;
import com.database.auction.repository.AuctionItemsRepository;
import com.database.auction.scheduler.AuctionEventScheduler;
import com.database.auction.service.AuctionEndNotificationService;
import com.database.auction.service.AuctionItemsService;
import lombok.extern.slf4j.Slf4j;
import org.quartz.SchedulerException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Slf4j
@RestController

@RequestMapping("/auth/auction-items")
public class AuctionItemsController {

    private final AuctionItemsService auctionItemsService;
    private AuctionItemsRepository auctionItemsRepository;
    private AuctionItemsMapper auctionItemsMapper;
    private AuctionImageRepository imagesRepo;
    private AuctionEventScheduler auctionEventScheduler;
    private AuctionEndNotificationService auctionEndNotificationService;


    @Autowired
    public AuctionItemsController(AuctionItemsService auctionItemsService, AuctionItemsRepository itemsRepo,
                                  AuctionImageRepository imagesRepo, AuctionEndNotificationService auctionEndNotificationService) {
        this.auctionItemsService = auctionItemsService;
        this.auctionItemsRepository = itemsRepo;
        this.imagesRepo = imagesRepo;
        this.auctionEndNotificationService = auctionEndNotificationService;
    }

    // Endpoint to retrieve all auction items
    @GetMapping("/all")
    public List<AuctionItemDto> getAllAuctionItems() {
        System.out.println("All items will be displayed now");
        return auctionItemsService.findAllAuctionItems();
    }

    @GetMapping("/summary")
    public ResponseEntity<List<AuctionItemSummaryDto>> getAuctionItemSummaries() {
        log.info("We have received the calling from frontend");
        return ResponseEntity.ok(auctionItemsService.findAllAuctionItemSummaries());
    }

    @GetMapping("/summary/{category}")
    public ResponseEntity<List<AuctionItemSummaryDto>> getByCategory(
            @PathVariable String category) {
        Category cat;
        try {
            cat = Category.valueOf(category.toLowerCase());
        } catch (IllegalArgumentException ex) {
            // not one of CAR, BIKE, TRUCK
            return ResponseEntity
                    .badRequest()
                    .build();
        }
        List<AuctionItemSummaryDto> dtos =
                auctionItemsService.findAuctionItemsByCategory(cat);
        return ResponseEntity.ok(dtos);
    }

    // NEW: lookup by auctionId, return as ResponseEntity
    @GetMapping("/{auctionId}")
    public ResponseEntity<AuctionItemDto> getAuctionItemByAuctionId(
            @PathVariable int auctionId) {
        log.info("In auction Item Controller");
        AuctionItemDto dto = auctionItemsService.findAuctionItemByAuctionId(auctionId);
        return ResponseEntity.ok(dto);
    }

    @PostMapping(
            value = "/{seller_id}/upload",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<Void> uploadAuctionItem(
            //  @RequestParam int auctionId,
            @PathVariable("seller_id") int sellerId,
            @RequestParam("item_name") String itemName,
            @RequestParam("category") Category category,
            @RequestParam("starting_price") Double startingPrice,
            @RequestParam("bid_increment") Double bidIncrement,
            @RequestParam("closing_time")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime closingTime,
            @RequestParam("start_time")
            //@DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            String startT,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("min_price")       Double minPrice,
            @RequestParam(value = "current_bid", required = false) Double currentBid,
            @RequestParam("images") MultipartFile[] images
    ) throws IOException, SchedulerException {
        LocalDateTime startTime;
        log.info("inserting the items");
        if ("null".equals(startT )) {
            startTime  = LocalDateTime.now();
        } else{
            startTime = LocalDateTime.parse(startT ,
                    DateTimeFormatter.ISO_DATE_TIME);
        }
        //log.info("Uploaded time is "+startTime.toString());

        // Convert LocalDateTime to java.util.Date
        Date closing = Date.from(closingTime.atZone(ZoneId.systemDefault()).toInstant());

        // 1) Save AuctionItems
        AuctionItems item = new AuctionItems();
        // item.setauction_id(auctionId);
        item.setseller_id(sellerId);
        item.setitem_name(itemName);
        item.setCategory(category);
        item.setStartingPrice(startingPrice);
        item.setbid_increment(bidIncrement);
        item.setStartTime(Date.from(startTime.atZone(ZoneId.systemDefault()).toInstant()));
        item.setClosingTime(closing);
        item.setDescription(description);
        item.setCurrentBid(currentBid != null ? currentBid : startingPrice);
        item.setMinPrice(minPrice);

        // ────────────────────────────────────────────────────────────
        // ★ Here's the new bit: manually assign the primary key ★
        Long maxAuctionId = auctionItemsRepository.findMaxAuctionId();
        item.setauction_id((int)(maxAuctionId + 1));
        // ────────────────────────────────────────────────────────────
        AuctionItems saved = auctionItemsRepository.save(item);


        // 2) Save uploaded images
        for (MultipartFile file : images) {
            AuctionImage img = new AuctionImage();
            img.setImageUrl(file.getOriginalFilename());
            img.setAuctionItem(saved);
            img.setImageData(file.getBytes());
            imagesRepo.save(img);
        }
        //auctionEventScheduler.scheduleEndForAuction(saved);
        auctionEndNotificationService.subscribe(Math.toIntExact(saved.getId()));

        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping("/{itemId}/images/{imageId}")
    public ResponseEntity<byte[]> getImage(
            @PathVariable Long itemId,
            @PathVariable Long imageId) {

        Optional<AuctionImage> opt = imagesRepo.findById(imageId);
        if (opt.isEmpty() || !opt.get().getAuctionItem().getId().equals(itemId)) {
            return ResponseEntity.notFound().build();
        }

        AuctionImage img = opt.get();
        // Determine MIME type if you stored it, otherwise default to JPEG
        MediaType mediaType = MediaType.IMAGE_JPEG;
        // If file name ends with .png, you could switch:
        if (img.getImageUrl().toLowerCase().endsWith(".png")) {
            mediaType = MediaType.IMAGE_PNG;
        }

        return ResponseEntity
                .ok()
                .contentType(mediaType)
                .body(img.getImageData());
    }

    /** Seller summary: highest-reserve buyer per auction */
    @GetMapping("/summarySeller/{sellerId}")
    public ResponseEntity<List<AuctionItemSellerSummaryDto>> getSellerSummary(
            @PathVariable int sellerId) {
        List<AuctionItemSellerSummaryDto> list = auctionItemsService.findSellerSummary(sellerId);
        return ResponseEntity.ok(list);
    }

    @PostMapping(value="/update_answer/{question_id}/{auction_id}",consumes=MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Void> updateanswer(
            @PathVariable int question_id,
            @PathVariable int auction_id,
            @RequestBody QuestionDTO quesdto)
    {
        System.out.println("In Controller");


        int affected=  auctionItemsService.updateanswer(question_id,auction_id,quesdto.getAnswer());

        if(affected>0)
            return ResponseEntity.status(HttpStatus.CREATED).build();

        return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED).build();

    }

//    @PutMapping(value="/insertquestion/{auction_id}",consumes=MediaType.APPLICATION_JSON_VALUE)
//    public ResponseEntity<Void> insertquestion(
//
//            @PathVariable int auction_id,
//            @RequestBody QuestionDTO quesdto)
//    {
//        System.out.println("In Controller");
//
//        int affected= auctionItemsService.insertquestion(auction_id,quesdto.getQuestion());
//
//        if(affected>0)
//            return ResponseEntity.status(HttpStatus.CREATED).build();
//
//        return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED).build();
//
//    }

    @PutMapping("/insertquestion/{auction_id}")
    public ResponseEntity<Void> insertquestion(
            @PathVariable("auction_id") String auctionIdStr,
            @RequestBody    QuestionDTO quesdto) {

        int auctionId;
        try {
            auctionId = Integer.parseInt(auctionIdStr);
        } catch (NumberFormatException ex) {
            // return 400 Bad Request with a message
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .header("X-Error", "Invalid auction_id: " + auctionIdStr)
                    .build();
        }



        int affected = auctionItemsService.insertquestion(auctionId, quesdto.getQuestion());
        return affected > 0
                ? ResponseEntity.status(HttpStatus.CREATED).build()
                : ResponseEntity.status(HttpStatus.EXPECTATION_FAILED).build();
    }

    @GetMapping(
            value = "/getallquessans/{auctionId}"
            //produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<List<QuestionDTO>> getallquessans(
            @PathVariable("auctionId") int auctionId) {
        System.out.println("In Controller");
        log.info("auction_id: {}", auctionId);

        List<QuestionDTO> questions = auctionItemsService.getallquessans(auctionId);

        if (questions.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(questions);
    }

//Report based on Item

    @GetMapping("/getSalesReportByAuctionId/{auction_id}")
    public ResponseEntity<List<AuctionItemDto>> getSalesReportByAuctionId(
            @PathVariable Integer auction_id
    )
    {
        System.out.println("In Controller");
        log.info("auction_id"+auction_id );
        return ResponseEntity.ok(auctionItemsService.getSalesReportByAuctionId(auction_id));
    }

    @GetMapping("/getsalesreport")
    public ResponseEntity<List<AuctionItemDto>> getsalesreport(
    )
    {
        System.out.println("In Controller");

        return ResponseEntity.ok(auctionItemsService.getsalesreport());
    }

    @GetMapping("/getsalesreportByCategory/{category}")
    public ResponseEntity<List<AuctionItemDto>> getsalesreportByCategory(

            @PathVariable String category)
    {
        System.out.println("In Controller");
        log.info("category"+category );
        return ResponseEntity.ok(auctionItemsService.getsalesreportByCategory(category));
    }


    @GetMapping("/getsalesreportBySellerId/{seller_id}")
    public ResponseEntity<List<AuctionItemDto>> getsalesreportBySellerId(

            @PathVariable Integer seller_id)
    {
        System.out.println("In Controller");
        log.info("seller_id"+seller_id );
        return ResponseEntity.ok(auctionItemsService.getsalesreportBySellerId(seller_id));
    }

    @GetMapping("/bestsellingitem/getsalesreport")
    public ResponseEntity<AuctionItemDto> getBestSellingItemSalesReport() {
        System.out.println("In Controller");

        List<AuctionItemDto> list = auctionItemsService.getsalesreport();

        if (list.isEmpty()) {
            // no data
            return ResponseEntity.noContent().build();
        }

        double maxDiv = Double.NEGATIVE_INFINITY;
        int bestIndex = 0;

        for (int i = 0; i < list.size(); i++) {
            AuctionItemDto dto = list.get(i);

            // guard nulls—skip any record missing the bids
            if (dto.getCurrentBid() == null || dto.getStartingPrice() == null) {
                continue;
            }

            double upper = dto.getCurrentBid() - dto.getStartingPrice();
            double div   = upper / dto.getCurrentBid() * 100.0;

            if (div > maxDiv) {
                maxDiv    = div;
                bestIndex = i;
            }
        }

        // If we never found a valid record, return no content
        if (bestIndex < 0 || bestIndex >= list.size() || maxDiv == Double.NEGATIVE_INFINITY) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(list.get(bestIndex));
    }

    @GetMapping("/buyer/{buyerId}/orders")
    public ResponseEntity<List<BuyerOrderDTO>> getMyOrders(
            @PathVariable("buyerId") int buyerId) {
        log.info("Inside the buyers orderid"+buyerId);
        List<BuyerOrderDTO> orders = auctionItemsService.findOrdersByBuyer(buyerId);
        return ResponseEntity.ok(orders);
    }


    @GetMapping("/search")
    public ResponseEntity<List<AuctionItemDto>> search(
            @RequestParam("q") String query) {
        List<AuctionItemDto> results = auctionItemsService.searchAuctions(query);
        return ResponseEntity.ok(results);
    }

    @GetMapping(
            value = "/questions/unanswered/{auction_id}",
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<List<QuestionDTO>> getUnansweredQuestions(
            @PathVariable("auction_id") int auctionId) {

        List<QuestionDTO> questions =
                auctionItemsService.getUnansweredQuestions(auctionId);

        if (questions.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(questions);
    }

    @GetMapping("/bestbuyer/getsalesreport")
    public ResponseEntity<List<Object>> getbestBuyer()
    {
        System.out.println("In Controller");

        List list=auctionItemsService.getsalesreportforBestBuyer();


        return ResponseEntity.ok(list);

    }






}
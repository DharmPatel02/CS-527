package com.database.auction;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling  //  Enables scheduled tasks (required for @Scheduled to work)
public class AuctionSystemApplication {

    public static void main(String[] args) {
        SpringApplication.run(AuctionSystemApplication.class, args);
    }
}


// package com.database.auction;

// import org.springframework.boot.SpringApplication;
// import org.springframework.boot.autoconfigure.SpringBootApplication;

// @SpringBootApplication
// public class AuctionSystemApplication {

// 	public static void main(String[] args) {
// 		SpringApplication.run(AuctionSystemApplication.class, args);
// 	}
// }

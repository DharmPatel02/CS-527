CREATE TABLE `auction_end_subscriptions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `auction_id` int NOT NULL,
  `closing_time` datetime(6) NOT NULL,
  `triggered` bit(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `auction_images` (
  `id` bigint NOT NULL,
  `auction_item_id` bigint DEFAULT NULL,
  `image_data` longblob,
  `image_mime` varchar(50) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKooy23449iyc2qshbixxmmybdw` (`auction_item_id`),
  CONSTRAINT `FKooy23449iyc2qshbixxmmybdw` FOREIGN KEY (`auction_item_id`) REFERENCES `auction_items` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `auction_items` (
  `id` bigint NOT NULL,
  `auction_id` int DEFAULT NULL,
  `bid_increment` double DEFAULT NULL,
  `category` enum('bike','car','truck') DEFAULT NULL,
  `closing_time` datetime(6) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `item_name` varchar(255) DEFAULT NULL,
  `reserve_price` double DEFAULT NULL,
  `seller_id` int DEFAULT NULL,
  `starting_price` double DEFAULT NULL,
  `current_bid` double DEFAULT NULL,
  `min_price` double DEFAULT NULL,
  `start_time` datetime(6) DEFAULT NULL,
  `buyer_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKaguo9u124oksxbofn9dneptke` (`auction_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `auction_questions` (
  `question_id` int NOT NULL AUTO_INCREMENT,
  `auction_id` int NOT NULL,
  `question` text NOT NULL,
  `answer` text,
  PRIMARY KEY (`question_id`),
  KEY `idx_auction_id` (`auction_id`),
  KEY `auction_id` (`auction_id`),
  CONSTRAINT `fk_auction_questions_auctions` FOREIGN KEY (`auction_id`) REFERENCES `auction_items` (`auction_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `auction_start_subscriptions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `auction_id` int NOT NULL,
  `buyer_id` int NOT NULL,
  `start_time` datetime(6) NOT NULL,
  `triggered` bit(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `bids` (
  `bid_id` bigint NOT NULL AUTO_INCREMENT,
  `bid_amount` double NOT NULL,
  `bid_time` datetime(6) NOT NULL,
  `reserve_price` double NOT NULL,
  `auction_id` bigint NOT NULL,
  `buyer_id` int NOT NULL,
  PRIMARY KEY (`bid_id`),
  KEY `FKkgq4u9hmapxi456egeqbc9rvq` (`auction_id`),
  KEY `FKnaual6ihvgbe70rfkk3qeyvri` (`buyer_id`),
  CONSTRAINT `FKkgq4u9hmapxi456egeqbc9rvq` FOREIGN KEY (`auction_id`) REFERENCES `auction_items` (`id`),
  CONSTRAINT `FKnaual6ihvgbe70rfkk3qeyvri` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `notifications` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `auction_id` int NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `is_read` bit(1) NOT NULL,
  `message` varchar(255) NOT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `user_details` (
  `username` varchar(255) NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `first_name` varchar(255) DEFAULT NULL,
  `last_name` varchar(255) DEFAULT NULL,
  `phone_number` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `users` (
  `id` bigint NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `role` enum('ADMIN','BUYER','CUSTOMER_REP','SELLER') DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `username` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK6dotkott2kjsp8vw4d0m25fb7` (`email`),
  UNIQUE KEY `UK6efs5vmce86ymf5q7lmvn2uuf` (`user_id`),
  UNIQUE KEY `UKr43af9ap4edm43mmtq01oddj6` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;









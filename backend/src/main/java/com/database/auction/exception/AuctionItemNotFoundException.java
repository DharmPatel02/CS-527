package com.database.auction.exception;

public class AuctionItemNotFoundException extends RuntimeException {
    public AuctionItemNotFoundException(String message) {
        super(message);
    }
}

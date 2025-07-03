import React, { createContext, useState, useEffect } from "react";
import { API_ENDPOINTS } from "../config/api";

export const AuctionContext = createContext();

export function AuctionProvider({ children }) {
  const [auctions, setAuctions] = useState([]);

  // Fetch all auctions from the server
  const fetchAuctions = async () => {
    try {
      const res = await fetch(API_ENDPOINTS.AUCTION_ITEMS_SUMMARY);
      if (!res.ok) throw new Error(`Fetch failed: ${res.statusText}`);
      const data = await res.json();
      setAuctions(data);
    } catch (err) {
      console.error("Error fetching auctions:", err);
    }
  };

  useEffect(() => {
    fetchAuctions();
  }, []);

  return (
    <AuctionContext.Provider value={{ auctions, fetchAuctions }}>
      {children}
    </AuctionContext.Provider>
  );
}

import React, { createContext, useState, useEffect } from 'react';

export const AuctionContext = createContext();

export function AuctionProvider({ children }) {
  const [auctions, setAuctions] = useState([]);

  // Fetch all auctions from the server
  const fetchAuctions = async () => {
    try {
      const res = await fetch('http://localhost:8080/auth/auction-items/summary');
      if (!res.ok) throw new Error(`Fetch failed: ${res.statusText}`);
      const data = await res.json();
      setAuctions(data);
    } catch (err) {
      console.error('Error fetching auctions:', err);
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

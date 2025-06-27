import React, { createContext, useState } from "react";

// Creating Context
export const ItemContext = createContext(null);

export const ItemProvider = ({ children }) => {
  const [items, setItems] = useState([]);

  return (
    <ItemContext.Provider value={{ items, setItems }}>
      {children}
    </ItemContext.Provider>
  );
};

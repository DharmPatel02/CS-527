import React, { useContext } from "react";
import { ItemContext } from "./ItemContext";
import "./BuyerStyle.css";

const BuyerPage = () => {
  const context = useContext(ItemContext);

  if (!context) {
    return <p>Error: ItemContext is not available. Make sure the provider is set.</p>;
  }

  const { items } = context;

  return (
    <div className="buyer-page">
      <h2>Available Items for Sale</h2>
      {items.length === 0 ? (
        <p>No items available</p>
      ) : (
        <div className="item-grid">
          {items.map((item, index) => (
            <div key={index} className="item-card">
              <img src={item.image} alt="Item" className="item-image" />
              <h3>{item.name}</h3>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BuyerPage;

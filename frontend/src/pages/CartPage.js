import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";
import "./CartPage.css";

// const CartPage = ({ cartItems, setCartItems, addToOrders }) => {
//   const navigate = useNavigate();
//   const [checkoutSuccess, setCheckoutSuccess] = useState(false);

const CartPage = () => {
  const navigate = useNavigate();
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  // Constant mock data for cart items
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Cruise Deal - Singapore to Tokyo",
      currentBid: 2799,
      closingTime: "12 Feb 2027",
      image:
        "https://i.insider.com/5e9a0cafdcd88c113f7c08b0?width=1300&format=jpeg&auto=webp",
    },
    {
      id: 2,
      name: "Sunset Drive - Vintage Mustang",
      currentBid: 7200,
      closingTime: "22 Apr 2025",
      image:
        "https://i.insider.com/5e9a0cafdcd88c113f7c08b0?width=1300&format=jpeg&auto=webp",
    },
  ]);

  const handleCheckout = () => {
    if (cartItems.length > 0) {
      // Add cart items to orders
      //addToOrders(cartItems);
      // Clear the cart
      setCartItems([]);
      setCheckoutSuccess(true);
      setTimeout(() => setCheckoutSuccess(false), 3000);
    }
  };

  const removeFromCart = (id) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
  };

  return (
    <div>
      <nav className="top-nav">
        <div className="logo">VEHICLE SHOP</div>
        <div className="nav-links">
        <NavLink to="/summary">Home</NavLink>
        <NavLink to="/summary/car">Car</NavLink>
          <NavLink to="/summary/bike">Bike</NavLink>
          <NavLink to="/summary/truck">Truck</NavLink>
          <input type="text" placeholder="Search..." className="search-bar" />
          <a href="/profile">Profile</a>
          <a href="/cart">Cart ({cartItems.length})</a>
        </div>
      </nav>

      <div className="cart-container">
        <h1>YOUR CART</h1>

        {checkoutSuccess && (
          <div className="success-message">
            Checkout successful! Your items have been added to your orders.
          </div>
        )}

        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <p>Your cart is empty</p>
            <button onClick={() => navigate("/car")}>Browse Vehicles</button>
          </div>
        ) : (
          <div className="cart-content">
            <div className="cart-items">
              {cartItems.map((item) => (
                <div className="cart-item" key={item.id}>
                  <img src={item.image} alt={item.name} />
                  <div className="item-details">
                    <h3>{item.name}</h3>
                    <p>Current Bid: £{item.currentBid}</p>
                    <p>Closing: {item.closingTime}</p>
                  </div>
                  <button
                    className="remove-btn"
                    onClick={() => removeFromCart(item.id)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <h3>Order Summary</h3>
              <div className="summary-item">
                <span>Items:</span>
                <span>{cartItems.length}</span>
              </div>
              <div className="summary-item">
                <span>Total:</span>
                <span>
                  £{cartItems.reduce((sum, item) => sum + item.currentBid, 0)}
                </span>
              </div>
              <button className="checkout-btn" onClick={handleCheckout}>
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;

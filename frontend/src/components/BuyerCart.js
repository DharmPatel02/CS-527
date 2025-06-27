import React, { useState } from 'react';
import './BuyerCart.css';

function BuyerCart({ history }) {
  const [cartItems, setCartItems] = useState([
    { id: 1, name: 'Leather Jacket', price: 50, quantity: 1 },
    { id: 2, name: 'Sneakers', price: 30, quantity: 1 },
  ]);

  const updateQuantity = (id, delta) => {
    setCartItems(cartItems.map(item => 
      item.id === id 
        ? { ...item, quantity: Math.max(1, item.quantity + delta) }
        : item
    ));
  };

  const removeItem = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = () => {
    // In real app, this would process payment
    alert(`Total amount: $${total}. Proceeding to payment...`);
    setCartItems([]);
    history.push('/items');
  };

  return (
    <div className="buyer-cart">
      <h2>Shopping Cart</h2>
      
      {cartItems.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Total</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map(item => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>${item.price}</td>
                  <td>
                    <button onClick={() => updateQuantity(item.id, -1)}>-</button>
                    {item.quantity}
                    <button onClick={() => updateQuantity(item.id, 1)}>+</button>
                  </td>
                  <td>${item.price * item.quantity}</td>
                  <td>
                    <button onClick={() => removeItem(item.id)}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="cart-summary">
            <h3>Total: ${total}</h3>
            <button onClick={handleCheckout} className="checkout-btn">
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default BuyerCart;
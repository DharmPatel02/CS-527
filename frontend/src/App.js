// App.js
import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import HomePage from "./pages/HomePage";
// import Dashboard from "./pages/Dashboard";
import SellerDashboard from "./pages/SellerDashboard";
import CategoryPage from "./pages/CategoryPage";
import ItemDetail from "./pages/ItemDetails";
import SummaryPage from "./pages/summaryPage";
import ProfilePage from "./pages/ProfilePage";
import CartPage from "./pages/CartPage";
import Admin from "./pages/Admin";
import { useAuth } from "./context/AuthContext";
import { ItemProvider } from "./pages/ItemContext";
import Navbar from "./components/navbar";
import AdminPage from "./pages/AdminPage";
import CustomerRepresentative from "./pages/CustomerRepresentatives";
// import SellerItems from "./pages/SellerItems";
import QuestionPage from "./pages/QuestionPage";
import NotificationsPage from "./pages/NotificationsPage";

const App = () => {
  const { isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [orders, setOrders] = useState([]);

  const addToCart = (item) => setCartItems([...cartItems, item]);
  const addToOrders = (items) => {
    const newOrders = items.map((item) => ({
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      item: item.name,
      price: item.currentBid,
      status: "Processing",
    }));
    setOrders([...orders, ...newOrders]);
  };

  return (
    <ItemProvider>
      {/* <Navbar cartItemCount={cartItems.length} /> */}
      <Routes>
        {/* public */}
        {/* <Route path="/" element={<Home />} /> */}
        {/* <Route path="/HomePage" element={<HomePage />} /> */}
        <Route path="/" element={<HomePage />} />
        <Route path="/HomePage" element={<HomePage />} />
        <Route path="/login" element={<HomePage />} />{" "}
        {/* <Route path="/seller-items" element={<SellerItems />} /> */}
        {/* or your Login page */}
        {/* protected */}
        {/* <Route
          path="/dashboard"
          element={
            isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />
          }
        /> */}
        <Route path="/SellerDashboard" element={<SellerDashboard />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route
          path="/customer-representative"
          element={<CustomerRepresentative />}
        />
        {/* summary + category + item */}
        <Route
          path="/summary"
          element={<SummaryPage addToCart={addToCart} />}
        />
        <Route
          path="/summary/:category"
          element={<CategoryPage addToCart={addToCart} />}
        />
        <Route path="/:itemId" element={<ItemDetail />} />
        <Route path="/questions/:auctionId" element={<QuestionPage />} />
        <Route
          path="/NotificationsPage/:userId"
          element={<NotificationsPage />}
        />{" "}
        {/* <Route path="/seller-profile" element={<SellerProfile />} /> */}
        {/* legacy/unprefixed category/item */}
        {/* <Route
          path="/:category"
          element={<CategoryPage addToCart={addToCart} />}
        />
        <Route path="/:category/:auctionId" element={<ItemDetail />} /> */}
        {/* cart & profile */}
        <Route
          path="/cart"
          element={
            <CartPage
              cartItems={cartItems}
              setCartItems={setCartItems}
              addToOrders={addToOrders}
            />
          }
        />
        <Route path="/profile" element={<ProfilePage orders={orders} />} />
      </Routes>
    </ItemProvider>
  );
};

export default App;

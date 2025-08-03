import React, { useState } from "react";
import "./HomePage.css";
import LoginPopup from "./LoginPopup";
import ForgotPasswordPopup from "./ForgotPasswordPopup";
import PasswordRequests from "./PasswordRequests";
import testBackend from "../test-backend";
import testCORS from "../test-cors";

const HomePage = () => {
  const [openPopup, setOpenPopup] = useState(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showPasswordRequests, setShowPasswordRequests] = useState(false);

  const handleTestBackend = () => {
    testBackend();
  };

  const handleTestCORS = () => {
    testCORS();
  };

  return (
    <div className="homepage-container">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <div className="logo-section">
            <span className="hammer-icon">🔨</span>
            <h1 className="brand-title">VehicleShop</h1>
            <p className="brand-subtitle">Premium Vehicle Auction Platform</p>
          </div>

          <div className="hero-description">
            <p>
              Discover premium vehicles from trusted sellers worldwide. Join
              thousands of satisfied customers in our secure marketplace.
            </p>
            <div style={{ marginTop: "10px" }}>
              <button
                onClick={handleTestBackend}
                style={{
                  background: "#007bff",
                  color: "white",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "5px",
                  cursor: "pointer",
                  marginRight: "10px",
                }}
              >
                🔧 Test Backend Connection
              </button>
              <button
                onClick={handleTestCORS}
                style={{
                  background: "#28a745",
                  color: "white",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                🌐 Test CORS Headers
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Login Section */}
      <div className="login-section">
        <div className="login-container">
          <h2 className="section-title">Choose Your Access Portal</h2>

          {/* All Login Options */}
          <div className="login-grid">
            <div className="login-card buyer-card">
              <div className="card-header">
                <div className="card-icon-large">🛒</div>
                <h3>I Want to Buy</h3>
                <p>Browse and bid on premium vehicles</p>
              </div>
              <button
                className="primary-button buyer-button"
                onClick={() => setOpenPopup("buyer")}
              >
                Login as Buyer
              </button>
            </div>

            <div className="login-card seller-card">
              <div className="card-header">
                <div className="card-icon-large">💰</div>
                <h3>I Want to Sell</h3>
                <p>List and sell your vehicles</p>
              </div>
              <button
                className="primary-button seller-button"
                onClick={() => setOpenPopup("seller")}
              >
                Login as Seller
              </button>
            </div>

            <div className="login-card rep-card">
              <div className="card-header">
                <div className="card-icon-large">🎧</div>
                <h3>Customer Support</h3>
                <p>Help customers with their queries</p>
              </div>
              <button
                className="primary-button rep-button"
                onClick={() => setOpenPopup("representative")}
              >
                Support Login
              </button>
            </div>

            <div className="login-card admin-card">
              <div className="card-header">
                <div className="card-icon-large">⚙️</div>
                <h3>System Admin</h3>
                <p>Manage platform and operations</p>
              </div>
              <button
                className="primary-button admin-button"
                onClick={() => setOpenPopup("admin")}
              >
                Admin Login
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Popup Handling */}
      {openPopup === "buyer" && (
        <LoginPopup
          userType="Buyer"
          onClose={() => setOpenPopup(null)}
          onForgotPassword={() => setShowForgotPassword(true)}
        />
      )}
      {openPopup === "seller" && (
        <LoginPopup
          userType="Seller"
          onClose={() => setOpenPopup(null)}
          onForgotPassword={() => setShowForgotPassword(true)}
        />
      )}
      {openPopup === "representative" && (
        <LoginPopup
          userType="Customer Representative"
          onClose={() => setOpenPopup(null)}
          redirectTo="/customer-representative"
        />
      )}
      {openPopup === "admin" && (
        <LoginPopup
          userType="Admin"
          onClose={() => setOpenPopup(null)}
          redirectTo="/admin"
        />
      )}
      {showForgotPassword && (
        <ForgotPasswordPopup onClose={() => setShowForgotPassword(false)} />
      )}
      {showPasswordRequests && (
        <PasswordRequests onClose={() => setShowPasswordRequests(false)} />
      )}
    </div>
  );
};

export default HomePage;

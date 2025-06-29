import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  // Function to determine the correct home route based on user role
  const getHomeRoute = () => {
    const role = localStorage.getItem("role");
    const token = localStorage.getItem("token");

    console.log("Debug - Role from localStorage:", role);
    console.log("Debug - Token exists:", !!token);

    if (!token) {
      console.log("Debug - No token, redirecting to login");
      return "/";
    }

    switch (role) {
      case "SELLER":
        console.log("Debug - Seller detected, redirecting to SellerDashboard");
        return "/SellerDashboard";
      case "BUYER":
        console.log("Debug - Buyer detected, redirecting to summary");
        return "/summary";
      case "ADMIN":
        console.log("Debug - Admin detected, redirecting to admin");
        return "/admin";
      case "CUSTOMER_REPRESENTATIVE":
        console.log(
          "Debug - Customer Rep detected, redirecting to customer-representative"
        );
        return "/customer-representative";
      default:
        console.log("Debug - Unknown role:", role, "redirecting to login");
        return "/";
    }
  };

  const handleHomeClick = (e) => {
    e.preventDefault();
    console.log("Debug - Home button clicked");
    const homeRoute = getHomeRoute();
    console.log("Debug - Navigating to:", homeRoute);
    navigate(homeRoute);
  };

  return (
    <nav className="navbar">
      <div className="nav-links">
        <a href="#" onClick={handleHomeClick} className="link">
          Home
        </a>

        {!isAuthenticated ? (
          <Link to="/HomePage" className="link">
            Login
          </Link>
        ) : (
          <>
            <Link to="/dashboard" className="link">
              Dashboard
            </Link>
            <button onClick={logout} className="logout-button">
              Logout
            </button>
          </>
        )}
        <Link to="/SellerDashboard" className="link">
          Seller Dashboard
        </Link>
        <Link to="/summary" className="link">
          Buyer Page
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;

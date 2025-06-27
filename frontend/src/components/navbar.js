import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();

  const NavLinkStyles = ({ isActive }) => {
    return {
      fontWeight: isActive ? "bold" : "normal",
      textDecoration: isActive ? "none" : "underline",
      fontStyle: isActive ? "italic" : "normal1",
    };
  };

  return (
    <nav style={{ padding: "10px", background: "#eee" }}>
      <Link to="/">Home</Link>  |
      
      {!isAuthenticated ? (
        <Link to="/HomePage"> Login |</Link>
      ) : (
        <>
          <Link to="/dashboard"> Dashboard</Link> |
          <button onClick={logout}>Logout</button>
        </>
      )}
      <Link to="/SellerDashboard">Seller Dashboard</Link> |
      <Link to="/summary">Buyer Page</Link>
    </nav>
  );
};

export default Navbar;

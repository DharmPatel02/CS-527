import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "../config/api";
import "./LoginPopup.css";

const LoginPopup = ({ userType, onClose, redirectTo, onForgotPassword }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  // Disable signup for Customer Reps
  const isCustomerRep = userType.toLowerCase().includes("representative");
  const isAdmin = userType.toLowerCase() === "admin"; // Add admin check

  useEffect(() => {
    if (isCustomerRep) {
      setIsLogin(true); // Force login view for Customer Reps
    }
  }, [isCustomerRep]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    // Validation for signup
    if (!isLogin) {
      if (!email || !email.includes("@")) {
        setError("Please enter a valid email address");
        return;
      }
      if (!username || !password) {
        setError("Username and password are required");
        return;
      }
    }

    let role;
    if (isCustomerRep) {
      role = "CUSTOMER_REP";
    } else {
      role = userType.toUpperCase();
    }

    const url = isLogin ? API_ENDPOINTS.LOGIN : API_ENDPOINTS.SIGNUP;

    try {
      let requestBody;
      if (isLogin) {
        requestBody = {
          username,
          password_hash: password,
        };
      } else {
        requestBody = {
          username,
          password_hash: password,
          email,
          role,
        };
      }

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (response.ok) {
        if (isLogin) {
          // Store user data without token since backend doesn't use JWT
          localStorage.setItem("userId", data.user_id);
          localStorage.setItem("username", data.username);
          localStorage.setItem("role", data.role);
          localStorage.setItem("email", data.email);

          console.log("Login successful:", data);

          if (role === "BUYER") {
            navigate("/summary");
          } else if (role === "SELLER") {
            navigate("/SellerDashboard");
          } else if (role === "CUSTOMER_REP") {
            navigate(redirectTo || "/customer-representative");
          } else if (role === "ADMIN") {
            // Add admin case
            navigate("/admin");
          }

          onClose();
        } else {
          console.log("Signup successful:", data);
          setSuccessMessage(`${userType} account created successfully!`);
          setIsLogin(true);
        }
      } else {
        setError(data.message || "An error occurred.");
      }
    } catch (err) {
      setError("username or password is incorrect.");
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <button className="close-btn" onClick={onClose}>
          ×
        </button>
        <h2>{isLogin ? `${userType} Login` : `${userType} Signup`}</h2>
        <form onSubmit={handleSubmit}>
          {!isLogin && !isCustomerRep && (
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          )}
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">{isLogin ? "Login" : "Create Account"}</button>
          {isLogin && !isCustomerRep && !isAdmin && (
            <button
              type="button"
              className="forgot-password-btn"
              onClick={onForgotPassword}
            >
              Forgot Password?
            </button>
          )}
        </form>
        {/* {!isCustomerRep && (
          <p>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? "Signup" : "Login"}
            </span>
          </p> */}
        {!isCustomerRep &&
          !isAdmin && ( // Modify condition to include admin
            <p>
              {isLogin
                ? "Don't have an account? "
                : "Already have an account? "}
              <span onClick={() => setIsLogin(!isLogin)}>
                {isLogin ? "Signup" : "Login"}
              </span>
            </p>
          )}
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>

      {successMessage && (
        <div className="success-popup">
          <p>{successMessage}</p>
        </div>
      )}
    </div>
  );
};

export default LoginPopup;

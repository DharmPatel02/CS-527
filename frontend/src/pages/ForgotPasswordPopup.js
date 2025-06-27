import React, { useState } from "react";
import "./ForgotPasswordPopup.css";

const ForgotPasswordPopup = ({ onClose }) => {
  const [userId, setUserId] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId) {
      setError("Please enter your User ID");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8080/auth/nullify-password/${userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        setSuccessMessage("Password reset request sent successfully");
        setError("");
        setTimeout(() => {
          onClose();
        }, 2000);
      } else if (response.status === 417) {
        setError("User ID not found. Please check your User ID and try again.");
      } else {
        setError("Request failed. Please try again later.");
      }
    } catch (err) {
      setError("Error processing request: " + err.message);
    }
  };

  return (
    <div className="forgot-password-overlay">
      <div className="forgot-password-content">
        <button className="close-btn" onClick={onClose}>
          ×
        </button>
        <h2>Forgot Password</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="number"
            placeholder="Enter your User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
          />
          <button type="submit">Submit Request</button>
        </form>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
      </div>
    </div>
  );
};

export default ForgotPasswordPopup;
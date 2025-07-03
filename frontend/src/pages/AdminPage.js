import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "../config/api";
import "./AdminPage.css";

const AdminPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("");
  const [reportData, setReportData] = useState(null);
  const [reportError, setReportError] = useState("");
  const [auctionId, setAuctionId] = useState("");
  const [category, setCategory] = useState("");
  const [seller_id, setSellerId] = useState("");
  const [showCreateRepForm, setShowCreateRepForm] = useState(false);
  const [bids, setBids] = useState([]); // New state for bids
  const [bidError, setBidError] = useState(""); // New state for bid errors
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("role");
    const token = localStorage.getItem("token");

    console.log("Token from localStorage:", token);
    console.log("Role from localStorage:", role);

    if (!token || role !== "ADMIN") {
      navigate("/login");
    }
  }, [navigate]);

  const handleCreateRep = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!token) {
      setError("No authentication token found. Please log in again.");
      navigate("/login");
      return;
    }

    try {
      // const response = await fetch("API_ENDPOINTS.SIGNUP", {
      const response = await fetch(API_ENDPOINTS.SIGNUP, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password_hash: password,
          email,
          role: "CUSTOMER_REP",
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccessMessage("Customer Representative created successfully!");
        setUsername("");
        setPassword("");
        setEmail("");
        setError("");
        setShowCreateRepForm(false);
      } else {
        setError(data.message || "Failed to create representative");
      }
    } catch (err) {
      setError("Server error. Please try again.");
    }
  };

  const handleGetReport = async () => {
    setReportError("");
    setReportData(null);
    const token = localStorage.getItem("token");

    if (!token) {
      setReportError("No authentication token found. Please log in again.");
      navigate("/login");
      return;
    }
    // let url = "API_ENDPOINTS.AUCTION_ITEMS";
    let url = `${API_ENDPOINTS.BASE_URL}/auth/auction-items`;

    switch (selectedFilter) {
      case "totalEarnings":
        url += "/getsalesreport";
        break;
      case "itemsByAuction":
        if (!auctionId) {
          setReportError("Please enter an Auction ID");
          return;
        }
        url += `/getSalesReportByAuctionId/${auctionId}`;
        break;
      case "byCategory":
        if (!category) {
          setReportError("Please enter a Category");
          return;
        }
        url += `/getsalesreportByCategory/${category}`;
        break;
      case "sellerEarnings":
        if (!seller_id) {
          setReportError("Please enter a Seller ID");
          return;
        }
        url += `/getsalesreportBySellerId/${seller_id}`;
        break;
      case "bestSelling":
        url += "/bestsellingitem/getsalesreport";
        break;
      default:
        setReportError("Please select a valid filter");
        return;
    }

    try {
      console.log("Fetching URL:", url);
      console.log("Authorization Header:", `Bearer ${token}`);
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Response status:", response.status);

      if (response.status === 403) {
        setReportError(
          "Access denied: You do not have permission to view this report. The token may be invalid or expired."
        );
        return;
      }

      if (response.status === 401) {
        setReportError("Session expired. Please log in again.");
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/login");
        return;
      }

      const data = await response.json();
      if (response.ok) {
        setReportData(data);
      } else {
        setReportError(data.message || "Failed to fetch report data");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setReportError("Server error. Please try again.");
    }
  };

  const handleGetBids = async () => {
    setBidError("");
    setBids([]);
    const token = localStorage.getItem("token");

    if (!token) {
      setBidError("No authentication token found. Please log in again.");
      navigate("/login");
      return;
    }

    if (!auctionId) {
      setBidError("Please enter an Auction ID");
      return;
    }
    // const url = `API_ENDPOINTS.BIDS/${auctionId}/bids`;
    const url = `${API_ENDPOINTS.BASE_URL}/auth/bids/${auctionId}/bids`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 403) {
        setBidError(
          "Access denied: You do not have permission to view these bids."
        );
        return;
      }

      if (response.status === 401) {
        setBidError("Session expired. Please log in again.");
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/login");
        return;
      }

      const data = await response.json();
      if (response.ok) {
        setBids(data);
      } else if (response.status === 204) {
        setBidError("No bids found for this auction.");
      } else {
        setBidError(data.message || "Failed to fetch bids");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setBidError("Server error. Please try again.");
    }
  };

  const handleRemoveBid = async (bidId) => {
    const token = localStorage.getItem("token");

    if (!token) {
      setBidError("No authentication token found. Please log in again.");
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(
        // `API_ENDPOINTS.BIDS/remove_bid/${bidId}/${auctionId}`,
        `${API_ENDPOINTS.BASE_URL}/auth/bids/remove_bid/${bidId}/${auctionId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.text();
      if (response.ok) {
        setSuccessMessage(data || "Bid removed successfully!");
        // Refresh the bids list
        handleGetBids();
      } else {
        setBidError(data || "Failed to remove bid");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setBidError("Server error. Please try again.");
    }
  };

  const handleCancel = () => {
    // Reset all search-related states
    setSelectedFilter("");
    setAuctionId("");
    setCategory("");
    setSellerId("");
    setReportData(null);
    setReportError("");
    setBids([]); // Reset bids
    setBidError(""); // Reset bid error
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    navigate("/");
  };

  const items = Array.isArray(reportData)
    ? reportData
    : reportData
    ? [reportData]
    : [];

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>ADMIN DASHBOARD</h1>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>

      <div className="form-wrapper">
        <h1>Create Customer Representative Account</h1>
        <button
          onClick={() => setShowCreateRepForm(!showCreateRepForm)}
          className="submit-btn toggle-form-btn"
        >
          {showCreateRepForm ? "Hide Form" : "Create Account"}
          <span className="btn-arrow">{showCreateRepForm ? "↑" : "↓"}</span>
        </button>

        {showCreateRepForm && (
          <div className="create-rep-form">
            <h2>Create Customer Representative</h2>
            <form onSubmit={handleCreateRep}>
              <div className="form-group">
                <div className="input-container">
                  <label className="input-label">Email Address</label>
                  <input
                    type="email"
                    placeholder="Enter email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="input-container">
                  <label className="input-label">Username</label>
                  <input
                    type="text"
                    placeholder="Create username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="input-container">
                  <label className="input-label">Password</label>
                  <input
                    type="password"
                    placeholder="Set secure password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <button type="submit" className="submit-btn">
                Create Representative
                <span className="btn-arrow">→</span>
              </button>
            </form>
          </div>
        )}

        {error && <div className="message error-message">{error}</div>}
        {successMessage && (
          <div className="message success-message">{successMessage}</div>
        )}
      </div>

      <div className="report-section">
        <h2>Sales Reports</h2>
        <div className="filter-container">
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="form-input"
          >
            <option value="">Select a report filter</option>
            <option value="totalEarnings">Total Earnings</option>
            <option value="itemsByAuction">Items Sales by Auction ID</option>
            <option value="byCategory">Sales by Category</option>
            <option value="sellerEarnings">Seller Earnings</option>
            <option value="bestSelling">Best Selling Item</option>
          </select>

          {selectedFilter === "itemsByAuction" && (
            <input
              type="number"
              placeholder="Enter Auction ID"
              value={auctionId}
              onChange={(e) => setAuctionId(e.target.value)}
              className="form-input"
            />
          )}
          {selectedFilter === "byCategory" && (
            <input
              type="text"
              placeholder="Enter Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="form-input"
            />
          )}
          {selectedFilter === "sellerEarnings" && (
            <input
              type="number"
              placeholder="Enter Seller ID"
              value={seller_id}
              onChange={(e) => setSellerId(e.target.value)}
              className="form-input"
            />
          )}

          <div className="button-group">
            <button onClick={handleGetReport} className="submit-btn">
              Create
              <span className="btn-arrow">→</span>
            </button>
            <button onClick={handleCancel} className="cancel-btn">
              Cancel
              <span className="btn-arrow">×</span>
            </button>
          </div>
        </div>

        {reportError && (
          <div className="message error-message">{reportError}</div>
        )}
        {items.length > 0 && (
          <div className="report-results">
            <h3>Report Results</h3>
            <div className="items-grid">
              {items.map((item, index) => (
                <div key={index} className="item-card">
                  <h4 className="item-name">{item.itemName || "N/A"}</h4>
                  <div className="item-details">
                    <p>
                      <strong>Seller ID:</strong> {item.sellerId || "N/A"}
                    </p>
                    <p>
                      <strong>Category:</strong> {item.category || "N/A"}
                    </p>
                    <p>
                      <strong>Description:</strong> {item.description || "N/A"}
                    </p>
                    <p>
                      <strong>Closing Time:</strong> {item.closingTime || "N/A"}
                    </p>
                    <p>
                      <strong>Starting Price:</strong>
                      {item.startingPrice != null
                        ? `$${item.startingPrice}`
                        : "N/A"}
                    </p>
                    <p>
                      <strong>Current Bid:</strong> ${item.currentBid || "N/A"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="auction-details-section">
        <h2>Auction Details</h2>
        <div className="filter-container">
          <input
            type="number"
            placeholder="Enter Auction ID"
            value={auctionId}
            onChange={(e) => setAuctionId(e.target.value)}
            className="form-input"
          />
          <div className="button-group">
            <button onClick={handleGetBids} className="submit-btn">
              Auction Details
              <span className="btn-arrow">→</span>
            </button>
            <button onClick={handleCancel} className="cancel-btn">
              Cancel
              <span className="btn-arrow">×</span>
            </button>
          </div>
        </div>

        {bidError && <div className="message error-message">{bidError}</div>}
        {bids.length > 0 && (
          <div className="report-results">
            <h3>Bids for Auction</h3>
            <div className="items-grid">
              {bids.map((bid, index) => (
                <div key={index} className="item-card">
                  <div className="item-details">
                    <p>
                      <strong>Bid ID:</strong> {bid.bid_id || "N/A"}
                    </p>
                    <p>
                      <strong>Auction ID:</strong> {bid.auction_id || "N/A"}
                    </p>
                    <p>
                      <strong>Bid Amount:</strong> ${bid.bid_amount || "N/A"}
                    </p>
                    <p>
                      <strong>Bid Time:</strong> {bid.bid_time || "N/A"}
                    </p>
                    <p>
                      <strong>Buyer ID:</strong> {bid.buyer_id || "N/A"}
                    </p>
                    <button
                      onClick={() => handleRemoveBid(bid.bid_id)}
                      className="cancel-btn"
                      style={{ marginTop: "10px" }}
                    >
                      Remove
                      <span className="btn-arrow">×</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;

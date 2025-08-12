import React, { useState, useEffect } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import "./SellerDashboardStyle.css";
import { API_ENDPOINTS } from "../config/api";

const SellerDashboard = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [notifs, setNotifs] = useState([]);
  const [newItem, setNewItem] = useState({
    item_name: "",
    description: "",
    starting_price: "",
    bid_increment: "",
    start_time: "",
    closing_time: "",
    category: "",
    imageFiles: [],
    min_price: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [alert, setAlert] = useState("");
  const myUserId = localStorage.getItem("userId");

  // Redirect non-sellers to login
  useEffect(() => {
    if (localStorage.getItem("role") !== "SELLER") {
      navigate("/login");
    }
  }, [navigate]);

  // Fetch seller's auctions
  useEffect(() => {
    async function loadItems() {
      try {
        const sellerId = localStorage.getItem("userId");
        const res = await fetch(API_ENDPOINTS.SELLER_ITEMS(sellerId), {
          credentials: "include",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();
        console.log("Backend response from /summarySeller:", data);
        setItems(data);
      } catch (err) {
        console.error(err);
        setAlert("Failed to load auctions.");
      }
    }
    loadItems();
  }, []);

  useEffect(() => {
    if (!myUserId) {
      navigate("/login");
      return;
    }

    const fetchNotifs = async () => {
      try {
        const res = await fetch(
          `${API_ENDPOINTS.BASE_URL}/auth/notifications?userId=${myUserId}`,
          {
            credentials: "include",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (res.ok) {
          const data = await res.json();
          setNotifs(data);
        } else {
          console.error("Failed to load notifications:", res.status);
        }
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };

    fetchNotifs();
    const intervalId = setInterval(fetchNotifs, 30000);
    return () => clearInterval(intervalId);
  }, [myUserId, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewItem((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setNewItem((prev) => ({ ...prev, imageFiles: files }));
  };

  const handleEdit = (item) => {
    setEditingId(item.auction_id);
    setNewItem({
      item_name: item.item_name,
      description: item.description,
      starting_price: item.starting_price ? item.starting_price.toString() : "",
      bid_increment: item.bid_increment.toString(),
      start_time: item.start_time
        ? new Date(item.start_time).toISOString().slice(0, 16)
        : "",
      closing_time: new Date(item.closing_time).toISOString().slice(0, 16),
      category: item.category,
      imageFiles: [],
      min_price: item.min_price ? item.min_price.toString() : "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancel = () => {
    setEditingId(null);
    setNewItem({
      item_name: "",
      description: "",
      starting_price: "",
      bid_increment: "",
      start_time: "",
      closing_time: "",
      category: "",
      imageFiles: [],
      min_price: "",
    });
    setAlert("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert("");

    const sellerId = Number(localStorage.getItem("userId"));
    const startPrice = newItem.starting_price
      ? parseFloat(newItem.starting_price)
      : null;
    const minPrice = newItem.min_price ? parseFloat(newItem.min_price) : null;

    let startTime = null;
    if (newItem.start_time.trim() !== "") {
      const startDate = new Date(newItem.start_time);
      startDate.setHours(startDate.getHours() - 4);
      startTime = startDate.toISOString();
    }
    const closingDate = new Date(newItem.closing_time);
    closingDate.setHours(closingDate.getHours() - 4);
    const closingTime = closingDate.toISOString();
    const url = editingId
      ? `${API_ENDPOINTS.BASE_URL}/auth/auction-items/${sellerId}/update`
      : `${API_ENDPOINTS.BASE_URL}/auth/auction-items/${sellerId}/upload`;
    const method = editingId ? "PUT" : "POST";

    // Validation: Ensure min_price is >= starting_price if both are provided
    if (startPrice !== null && minPrice !== null && minPrice < startPrice) {
      setAlert(
        "Minimum price must be greater than or equal to the starting price."
      );
      return;
    }

    // Validation: Ensure start_time is before closing_time
    if (startTime && new Date(startTime) >= new Date(closingTime)) {
      setAlert("Start time must be before closing time.");
      return;
    }

    // Validation: Ensure start_time is in the future
    const now = new Date();
    if (startTime && new Date(startTime) <= now) {
      setAlert("Start time must be in the future.");
      return;
    }

    // Build FormData
    const formData = new FormData();
    if (editingId) {
      formData.append("auction_id", editingId);
    }
    formData.append("seller_id", sellerId);
    formData.append("item_name", newItem.item_name);
    formData.append("description", newItem.description);
    if (startPrice !== null) {
      formData.append("starting_price", startPrice);
      formData.append("current_bid", startPrice);
    } else {
      formData.append("current_bid", 0);
    }
    formData.append("bid_increment", parseFloat(newItem.bid_increment));
    formData.append("start_time", startTime ?? null);
    formData.append("closing_time", closingTime);
    formData.append("category", newItem.category);
    if (minPrice !== null) {
      formData.append("min_price", minPrice);
    }
    newItem.imageFiles.forEach((file) => {
      formData.append("images", file);
    });

    try {
      const res = await fetch(url, {
        method,
        body: formData,
        credentials: "include",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (res.status === 403) {
        setAlert("Permission denied. Please log in again.");
        return;
      }
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Status ${res.status}: ${errorText}`);
      }

      let result = {};
      const contentType = res.headers.get("Content-Type");
      if (contentType && contentType.includes("application/json")) {
        result = await res.json();
      } else {
        result = {
          auction_id: editingId || Date.now(),
          ...newItem,
          starting_price: startPrice || 0,
        };
      }

      setAlert(
        editingId ? "Item updated successfully." : "Item uploaded successfully."
      );
      if (editingId) {
        setItems((prev) =>
          prev.map((i) =>
            i.auction_id === editingId ? { ...i, ...result } : i
          )
        );
      } else {
        setItems((prev) => [...prev, result]);
      }
      handleCancel();
    } catch (err) {
      console.error("Submit error:", err);
      setAlert(
        `${editingId ? "Update failed" : "Upload failed"}: ${err.message}`
      );
    }
  };

  const now = new Date();
  const active = items.filter(
    (i) =>
      new Date(i.closing_time) > now &&
      (!i.start_time || new Date(i.start_time) <= now)
  );
  const closed = items.filter((i) => new Date(i.closing_time) <= now);

  // Helper to fix relative and localhost URLs in image URLs
  const fixImageUrl = (url) => {
    if (typeof url !== "string") return url;
    if (url.startsWith("/")) {
      return `${API_ENDPOINTS.BASE_URL}${url}`;
    }
    if (url.includes("localhost:8080")) {
      return url.replace("http://localhost:8080", API_ENDPOINTS.BASE_URL);
    }
    return url;
  };

  const determineWinner = (item) => {
    const finalBid = parseFloat(item.current_bid);
    const reservePrice = item.min_price ? parseFloat(item.min_price) : null;

    if (reservePrice && finalBid < reservePrice) {
      return "- (Reserve not met)";
    }

    return item.buyer_username || "No offers made";
  };

  return (
    <div className="seller-dashboard">
      <nav className="top-nav">
        <div className="nav-links">
          <NavLink to={`/NotificationsPage/${myUserId}`}>
            Notifications{" "}
            {notifs.length > 0 && (
              <span className="notif-badge">{notifs.length}</span>
            )}
          </NavLink>
          <NavLink to="/profile">Profile</NavLink>
        </div>
      </nav>

      <h2>{editingId ? "Edit Auction Item" : "Create New Auction"}</h2>

      {alert && (
        <div
          className={`alert ${alert.includes("success") ? "success" : "error"}`}
        >
          {alert}
        </div>
      )}

      <form onSubmit={handleSubmit} className="new-item-form">
        <div className="form-grid">
          <div className="form-group">
            <label>Item Name</label>
            <input
              name="item_name"
              placeholder="Enter item name"
              value={newItem.item_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Category</label>
            <select
              name="category"
              value={newItem.category}
              onChange={handleChange}
              required
            >
              <option value="">Select Category</option>
              <option value="car">Car</option>
              <option value="bike">Bike</option>
              <option value="truck">Truck</option>
            </select>
          </div>

          <div className="form-group">
            <label>Starting Price (Optional)</label>
            <input
              name="starting_price"
              type="number"
              placeholder="0.00"
              value={newItem.starting_price}
              onChange={handleChange}
              step="0.01"
              min="0"
            />
          </div>

          <div className="form-group">
            <label>Bid Increment</label>
            <input
              name="bid_increment"
              type="number"
              placeholder="10.00"
              value={newItem.bid_increment}
              onChange={handleChange}
              required
              step="0.01"
              min="0.01"
            />
          </div>

          <div className="form-group">
            <label>Minimum Price (Optional)</label>
            <input
              name="min_price"
              type="number"
              placeholder="0.00"
              value={newItem.min_price}
              onChange={handleChange}
              step="0.01"
              min="0"
            />
          </div>

          <div className="form-group">
            <label>Start Time (Optional)</label>
            <input
              name="start_time"
              type="datetime-local"
              value={newItem.start_time}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Closing Time</label>
            <input
              name="closing_time"
              type="datetime-local"
              value={newItem.closing_time}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group" style={{ gridColumn: "1 / -1" }}>
            <label>Description</label>
            <textarea
              name="description"
              placeholder="Describe your item in detail..."
              value={newItem.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className="file-input-section">
            <label>Upload Images</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
            />
            {newItem.imageFiles.length > 0 && (
              <div className="selected-files">
                <p>Selected files ({newItem.imageFiles.length}):</p>
                <ul>
                  {newItem.imageFiles.map((file, index) => (
                    <li key={index}>📸 {file.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="form-buttons">
          <button type="submit">
            {editingId ? "Update Auction" : "Create Auction"}
          </button>
          {editingId && (
            <button type="button" onClick={handleCancel}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <h3 className="section-header">Active Auctions</h3>
      <div className="table-container">
        <table className="items-table">
          <thead>
            <tr>
              <th>Item Details</th>
              <th>Category</th>
              <th>Current Bid</th>
              <th>Reserve Price</th>
              <th>Closes</th>
              <th>Images</th>
            </tr>
          </thead>
          <tbody>
            {active.length > 0 ? (
              active.map((item) => (
                <tr key={item.auction_id}>
                  <td>
                    <strong>{item.item_name}</strong>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "var(--dark-teal)",
                        marginTop: "4px",
                      }}
                    >
                      ID: {item.auction_id}
                    </div>
                  </td>
                  <td>
                    <span className="status-active">{item.category}</span>
                  </td>
                  <td>
                    <span className="price-display">
                      £{item.current_bid || 0}
                    </span>
                  </td>
                  <td>
                    <span className="price-display">
                      {item.min_price ? `£${item.min_price}` : "No reserve"}
                    </span>
                  </td>
                  <td>
                    {new Date(item.closing_time).toLocaleDateString()}
                    <br />
                    <small>
                      {new Date(item.closing_time).toLocaleTimeString()}
                    </small>
                  </td>
                  <td>
                    {Array.isArray(item.images) && item.images.length > 0 ? (
                      <div style={{ display: "flex", flexWrap: "wrap" }}>
                        {item.images.slice(0, 3).map((url, index) => (
                          <img
                            key={index}
                            src={fixImageUrl(url)}
                            alt={item.item_name}
                            className="table-image"
                          />
                        ))}
                        {item.images.length > 3 && (
                          <span
                            style={{
                              fontSize: "12px",
                              color: "var(--dark-teal)",
                            }}
                          >
                            +{item.images.length - 3} more
                          </span>
                        )}
                      </div>
                    ) : (
                      <span style={{ color: "var(--dark-teal)" }}>
                        No images
                      </span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="no-data">
                  No active auctions found. Create your first auction above!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <h3 className="section-header">Closed Auctions</h3>
      <div className="table-container">
        <table className="items-table">
          <thead>
            <tr>
              <th>Item Details</th>
              <th>Category</th>
              <th>Final Bid</th>
              <th>Reserve Price</th>
              <th>Closed Date</th>
              <th>Winner</th>
              <th>Images</th>
            </tr>
          </thead>
          <tbody>
            {closed.length > 0 ? (
              closed.map((item) => (
                <tr key={item.auction_id}>
                  <td>
                    <strong>{item.item_name}</strong>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "var(--dark-teal)",
                        marginTop: "4px",
                      }}
                    >
                      ID: {item.auction_id}
                    </div>
                  </td>
                  <td>
                    <span className="status-closed">{item.category}</span>
                  </td>
                  <td>
                    <span className="price-display">
                      £{item.current_bid || 0}
                    </span>
                  </td>
                  <td>
                    <span className="price-display">
                      {item.min_price ? `£${item.min_price}` : "No reserve"}
                    </span>
                  </td>
                  <td>
                    {new Date(item.closing_time).toLocaleDateString()}
                    <br />
                    <small>
                      {new Date(item.closing_time).toLocaleTimeString()}
                    </small>
                  </td>
                  <td>
                    <span className="winner-display">
                      {determineWinner(item)}
                    </span>
                  </td>
                  <td>
                    {Array.isArray(item.images) && item.images.length > 0 ? (
                      <div style={{ display: "flex", flexWrap: "wrap" }}>
                        {item.images.slice(0, 3).map((url, index) => (
                          <img
                            key={index}
                            src={fixImageUrl(url)}
                            alt={item.item_name}
                            className="table-image"
                          />
                        ))}
                        {item.images.length > 3 && (
                          <span
                            style={{
                              fontSize: "12px",
                              color: "var(--dark-teal)",
                            }}
                          >
                            +{item.images.length - 3} more
                          </span>
                        )}
                      </div>
                    ) : (
                      <span style={{ color: "var(--dark-teal)" }}>
                        No images
                      </span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="no-data">
                  No closed auctions yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SellerDashboard;

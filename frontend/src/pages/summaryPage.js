import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./CategoryPage.css";
import { API_ENDPOINTS } from "../config/api";

export default function SummaryPage({ addToCart }) {
  const [auctions, setAuctions] = useState([]);
  const [notifs, setNotifs] = useState([]);
  const [alert, setAlert] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const myUserId = localStorage.getItem("userId");

  // 1. Auth guard
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = (localStorage.getItem("role") || "").toUpperCase();
    if (!token || role !== "BUYER") {
      console.log("Invalid token or role, redirecting to login");
      navigate("/");
    }
  }, [navigate]);

  // 2. Fetch all auctions
  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(API_ENDPOINTS.AUCTION_ITEMS_SUMMARY, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        });
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const data = await res.json();
        console.log("Fetched auctions in SummaryPage:", data);
        setAuctions(data);
      } catch (err) {
        console.error("Fetch error:", err);
        setAlert("Failed to load auctions.");
      }
    };
    fetchAuctions();
  }, []);

  // 3. Fetch notifications
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
          setNotifs(await res.json());
        }
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };
    fetchNotifs();
    const intervalId = setInterval(fetchNotifs, 30000);
    return () => clearInterval(intervalId);
  }, [myUserId, navigate]);

  // 4. Mark notification as read (not shown here, but kept for future use)
  const markRead = async (id) => {
    try {
      const res = await fetch(
        `${API_ENDPOINTS.BASE_URL}/auth/notifications/${id}/read`,
        {
          method: "POST",
          credentials: "include",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      if (res.ok) setNotifs((n) => n.filter((x) => x.id !== id));
    } catch (err) {
      console.error("Error marking notification read:", err);
    }
  };

  // 5. Subscribe for start notifications
  const notifyMe = async (auctionId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setAlert("Please log in to subscribe.");
        return;
      }
      await fetch(
        `${API_ENDPOINTS.BASE_URL}/auth/auction-items/${myUserId}/${auctionId}/notify`,
        {
          method: "POST",
          credentials: "include",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAlert("Notification set");
    } catch (err) {
      console.error("Error subscribing to notification:", err);
      setAlert("Notification set");
    }
  };

  // 6. Helper to pick an image
  const getImageUrl = (item) => {
    if (item.images?.length) {
      const img = item.images[0];
      if (typeof img === "string") {
        if (img.startsWith("/")) {
          return `${API_ENDPOINTS.BASE_URL}${img}`;
        }
        if (img.includes("localhost:8080")) {
          return img.replace("http://localhost:8080", API_ENDPOINTS.BASE_URL);
        }
        return img;
      }
      if (typeof img === "object" && img.id && (item.id || item.itemId)) {
        const itemIdForPath = item.id || item.itemId;
        return `${API_ENDPOINTS.BASE_URL}/auth/auction-items/${itemIdForPath}/images/${img.id}`;
      }
      return img?.url || img?.src;
    }
    // Placeholder
    return (
      item.imageUrl ||
      item.image ||
      "https://images.unsplash.com/photo-1494976688153-ca3ce1d4b4c5?w=300&h=200&fit=crop&crop=center"
    );
  };

  // 7. Partition upcoming vs running
  const now = new Date();
  const upcoming = auctions.filter(
    (a) => a.startTime && new Date(a.startTime) > now
  );
  const running = auctions.filter(
    (a) =>
      new Date(a.closingTime) > now &&
      (!a.startTime || new Date(a.startTime) <= now)
  );

  // 8. Apply search filter
  const filteredUpcoming = upcoming.filter((a) =>
    a.itemName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredRunning = running.filter((a) =>
    a.itemName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 9. Group by category
  const groupByCategory = (list) =>
    list.reduce((acc, i) => {
      const cat = i.category || "Uncategorized";
      (acc[cat] = acc[cat] || []).push(i);
      return acc;
    }, {});

  const byCategoryUpcoming = groupByCategory(filteredUpcoming);
  const byCategoryRunning = groupByCategory(filteredRunning);

  return (
    <div className="page-container">
      <nav className="top-nav">
        <div className="logo">VEHICLE SHOP</div>
        <div className="nav-links">
          <NavLink to="/summary">Home</NavLink>
          <NavLink to="/summary/car">Car</NavLink>
          <NavLink to="/summary/bike">Bike</NavLink>
          <NavLink to="/summary/truck">Truck</NavLink>

          {/* Search */}
          <input
            type="text"
            placeholder="Search items..."
            className="search-bar"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <NavLink to={`/NotificationsPage/${myUserId}`}>
            Notifications{" "}
            {notifs.length > 0 && (
              <span className="notif-badge">{notifs.length}</span>
            )}
          </NavLink>
          <NavLink to="/profile">Profile</NavLink>
        </div>
      </nav>

      {/* Page Header */}
      {searchTerm ? (
        <div className="search-results-header">
          <h1 className="search-results-title">
            🔍 Search Results for "{searchTerm}"
          </h1>
          <div className="search-results-subtitle">
            {filteredRunning.length + filteredUpcoming.length === 0
              ? "No auctions found matching your search"
              : `Found ${
                  filteredRunning.length + filteredUpcoming.length
                } auction${
                  filteredRunning.length + filteredUpcoming.length === 1
                    ? ""
                    : "s"
                } matching your search`}
          </div>
        </div>
      ) : (
        <div className="category-header">
          <h1 className="category-title">AUCTION ITEMS</h1>
          <p className="category-subtitle">
            Browse our complete selection of premium vehicles
          </p>
        </div>
      )}

      {/* Alerts */}
      {alert && (
        <div
          className={`alert ${alert.includes("Failed") ? "error" : "success"}`}
        >
          {alert}
        </div>
      )}

      {/* Running Auctions */}
      <div className="section-header-wrapper">
        <h3 className="section-header">
          {searchTerm
            ? `🏃 Live Auctions matching "${searchTerm}"`
            : "🏃 All Live Auctions"}
        </h3>
      </div>

      {filteredRunning.length === 0 ? (
        <div className="no-results-message">
          <div className="no-results-icon">🚗</div>
          <h4>No live auctions found</h4>
          <p>
            {searchTerm
              ? `No running auctions match "${searchTerm}"`
              : "No auctions are currently running."}
          </p>
        </div>
      ) : (
        Object.entries(byCategoryRunning).map(([cat, items]) => (
          <section key={cat}>
            <div className="item-list">
              {items.map((item) => (
                <div className="card" key={item.id}>
                  <img
                    className="card-img"
                    src={getImageUrl(item)}
                    alt={item.item_name}
                  />
                  <div className="card-body">
                    <h2>{item.itemName}</h2>
                    <p className="card-desc">{item.description}</p>
                    <div className="card-info">
                      <span>
                        Current Bid: £
                        {item.currentBid !== undefined
                          ? item.currentBid
                          : item.startingPrice}
                      </span>
                      <span>Category: {item.category}</span>
                    </div>
                    <div className="card-footer">
                      <span>
                        Closing: {new Date(item.closingTime).toLocaleString()}
                      </span>
                      <div>
                        <button
                          className="view-deal"
                          onClick={() => navigate(`/${item.auctionId}`)}
                        >
                          VIEW DEAL
                        </button>
                        <button
                          className="qa-button"
                          onClick={() =>
                            navigate(`/questions/${item.auctionId}`)
                          }
                        >
                          Q&A
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))
      )}

      {/* Upcoming Auctions */}
      <div className="section-header-wrapper">
        <h3 className="section-header">
          {searchTerm
            ? `⏰ Upcoming Auctions matching "${searchTerm}"`
            : "⏰ Upcoming Auctions"}
        </h3>
      </div>

      {filteredUpcoming.length === 0 ? (
        <div className="no-results-message">
          <div className="no-results-icon">⏰</div>
          <h4>No upcoming auctions found</h4>
          <p>
            {searchTerm
              ? `No upcoming auctions match "${searchTerm}"`
              : "No auctions are scheduled to start later."}
          </p>
        </div>
      ) : (
        Object.entries(byCategoryUpcoming).map(([cat, items]) => (
          <section key={cat}>
            <div className="item-list">
              {items.map((item) => (
                <div className="card" key={item.auction_id ?? item.auctionId}>
                  <img
                    className="card-img"
                    src={getImageUrl(item)}
                    alt={item.itemName}
                  />
                  <div className="card-body">
                    <h2>{item.itemName}</h2>
                    <p className="card-desc">{item.description}</p>
                    <div className="card-info">
                      <span>Starting Price: £{item.currentBid}</span>
                      <span>Category: {item.category}</span>
                    </div>
                    <div className="card-footer">
                      <span>
                        Starts: {new Date(item.startTime).toLocaleString()}
                      </span>
                      <button
                        className="notify-me"
                        onClick={() => notifyMe(item.auction_id)}
                      >
                        NOTIFY ME
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}

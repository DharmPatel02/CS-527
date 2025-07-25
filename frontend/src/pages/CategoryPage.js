import React, { useEffect, useState } from "react";
import { useParams, useNavigate, NavLink } from "react-router-dom";
import "./CategoryPage.css";
import { API_ENDPOINTS } from "../config/api";

const CategoryPage = ({ addToCart }) => {
  const { category } = useParams(); // "car" / "bike" / "truck"
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifs, setNotifs] = useState([]); // State for notifications
  const [showNotifs, setShowNotifs] = useState(true); // Toggle notification section visibility
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const myUserId = localStorage.getItem("userId");

  // Fetch auctions
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(API_ENDPOINTS.AUCTION_ITEMS_SUMMARY, {
          credentials: "include",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const data = await res.json();
        console.log("fetched auctions:", data);
        setAuctions(data);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to load auctions.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Fetch notifications
  useEffect(() => {
    if (!myUserId) {
      setError("Please log in to view this page.");
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
    // Poll every 30 seconds
    const intervalId = setInterval(fetchNotifs, 30000);
    return () => clearInterval(intervalId);
  }, [myUserId, navigate]);

  // Mark notification as read
  const markRead = async (id) => {
    try {
      const res = await fetch(
        `${API_ENDPOINTS.BASE_URL}/auth/notifications/${id}/read`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (res.ok) {
        setNotifs((prev) => prev.filter((n) => n.id !== id));
      } else {
        console.error("Failed to mark notification read:", res.status);
      }
    } catch (err) {
      console.error("Error marking notification read:", err);
    }
  };

  const getImageUrl = (item) => {
    if (item.images) {
      if (Array.isArray(item.images) && typeof item.images[0] === "string") {
        // Fix localhost URLs
        const url = item.images[0];
        if (url.includes("localhost:8080")) {
          return url.replace("http://localhost:8080", API_ENDPOINTS.BASE_URL);
        }
        return url;
      }
      if (
        Array.isArray(item.images) &&
        item.images[0] &&
        (item.images[0].url || item.images[0].src)
      ) {
        const url = item.images[0].url || item.images[0].src;
        if (url.includes("localhost:8080")) {
          return url.replace("http://localhost:8080", API_ENDPOINTS.BASE_URL);
        }
        return url;
      }
    }
    if (item.imageUrl) return item.imageUrl;
    if (item.image) return item.image;
    return "https://images.unsplash.com/photo-1494976688153-ca3ce1d4b4c5?w=300&h=200&fit=crop&crop=center";
  };

  // Filter auctions by category, closingTime, and searchTerm
  const now = new Date();
  const filtered = auctions.filter(
    (a) =>
      a.category?.toLowerCase() === category.toLowerCase() &&
      a.closingTime &&
      new Date(a.closingTime) > now &&
      (searchTerm === "" ||
        a.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.description?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="page-container">
      <nav className="top-nav">
        <div className="logo">VEHICLE SHOP</div>
        <div className="nav-links">
          <NavLink to="/summary">Home</NavLink>
          <NavLink to="/summary/car">Car</NavLink>
          <NavLink to="/summary/bike">Bike</NavLink>
          <NavLink to="/summary/truck">Truck</NavLink>
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
          {/* <NavLink to="/cart">Cart</NavLink> */}
        </div>
      </nav>

      <div className="category-header">
        <h1 className="category-title">{category?.toUpperCase()}S</h1>
        <div className="category-subtitle">
          Browse our selection of premium {category}s
        </div>
      </div>

      <div className="item-list">
        {loading ? (
          <p>Loading auctions...</p>
        ) : error ? (
          <p style={{ color: "red" }}>{error}</p>
        ) : filtered.length === 0 ? (
          <div className="no-results-message">
            <div className="no-results-icon">
              {category === "car" ? "🚗" : category === "bike" ? "🏍️" : "🚛"}
            </div>
            <h4>No active {category}s found</h4>
            <p>
              We don't have any {category}s available for auction right now.
              Check back soon for new listings!
            </p>
          </div>
        ) : (
          filtered.map((item) => (
            <div className="card" key={item.auctionId}>
              <img
                className="card-img"
                src={getImageUrl(item)}
                alt={item.itemName}
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

                  <button
                    className="view-deal"
                    onClick={() => navigate(`/${item.auctionId}`)}
                  >
                    VIEW DEAL
                  </button>
                  <button
                    className="qa-button"
                    onClick={() => navigate(`/questions/${item.auctionId}`)}
                  >
                    Q&A
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CategoryPage;

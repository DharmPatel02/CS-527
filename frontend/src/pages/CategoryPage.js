import React, { useEffect, useState } from "react";
import { useParams, useNavigate, NavLink } from "react-router-dom";
import "./CategoryPage.css";

const CategoryPage = ({ addToCart }) => {
  const { category } = useParams(); // "car" / "bike" / "truck"
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifs, setNotifs] = useState([]); // State for notifications
  const [showNotifs, setShowNotifs] = useState(true); // Toggle notification section visibility
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const myUserId = localStorage.getItem('userId');

  // Fetch auctions
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("http://localhost:8080/auth/auction-items/summary", {
          credentials: 'include',
          headers: {
            "Authorization": `Bearer ${localStorage.getItem('token')}`
          }
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
      navigate('/login');
      return;
    }

    const fetchNotifs = async () => {
      try {
        const res = await fetch(
          `http://localhost:8080/auth/notifications?userId=${myUserId}`,
          {
            credentials: 'include',
            headers: {
              "Authorization": `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        if (res.ok) {
          const data = await res.json();
          setNotifs(data);
        } else {
          console.error('Failed to load notifications:', res.status);
        }
      } catch (err) {
        console.error('Error fetching notifications:', err);
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
        `http://localhost:8080/auth/notifications/${id}/read`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            "Authorization": `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      if (res.ok) {
        setNotifs(prev => prev.filter(n => n.id !== id));
      } else {
        console.error('Failed to mark notification read:', res.status);
      }
    } catch (err) {
      console.error('Error marking notification read:', err);
    }
  };

  const getImageUrl = (item) => {
    if (item.images) {
      if (Array.isArray(item.images) && typeof item.images[0] === "string") {
        return item.images[0];
      }
      if (
        Array.isArray(item.images) &&
        item.images[0] &&
        (item.images[0].url || item.images[0].src)
      ) {
        return item.images[0].url || item.images[0].src;
      }
    }
    if (item.imageUrl) return item.imageUrl;
    if (item.image) return item.image;
    return "https://via.placeholder.com/300x200?text=No+Image";
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
    <div>
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
            onChange={e => setSearchTerm(e.target.value)}
          />
          <NavLink to={`/NotificationsPage/${myUserId}`}>
            Notifications {notifs.length > 0 && <span className="notif-badge">{notifs.length}</span>}
          </NavLink>
          <NavLink to="/profile">Profile</NavLink>
          {/* <NavLink to="/cart">Cart</NavLink> */}
        </div>
      </nav>

      <h1>{category?.toUpperCase()}S</h1>

      <div className="item-list">
        {loading ? (
          <p>Loading auctions...</p>
        ) : error ? (
          <p style={{ color: "red" }}>{error}</p>
        ) : filtered.length === 0 ? (
          <p>No active {category}s found.</p>
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
                        {item.currentBid !== undefined ? item.currentBid : item.startingPrice}
                      </span>
                  <span>Category: {item.category}</span>
                </div>

                <div className="card-footer">
                  <span>
                    Closing: {new Date(item.closingTime).toLocaleString()}
                  </span>

                  <button
                    className="view-deal"
                    onClick={() =>
                      navigate(`/${item.auctionId}`)
                    }
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
          ))
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
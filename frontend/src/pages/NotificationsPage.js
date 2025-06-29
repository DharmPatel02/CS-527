import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import "./NotificationPages.css";
import "./CategoryPage.css";

export default function NotificationsPanel() {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!userId) return;

    // Fetch unread notifications
    const fetchNotifs = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `http://localhost:8080/auth/notifications?userId=${userId}`,
          { credentials: "include" }
        );
        if (res.ok) {
          const data = await res.json();
          setNotifs(data);
        } else {
          console.error("Failed to load notifications:", res.status);
        }
      } catch (err) {
        console.error("Error fetching notifications:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifs();
    // Poll every 30 seconds
    const intervalId = setInterval(fetchNotifs, 30000);
    return () => clearInterval(intervalId);
  }, [userId]);

  const markRead = async (id) => {
    try {
      const res = await fetch(
        `http://localhost:8080/auth/notifications/${id}/read`,
        {
          method: "POST",
          credentials: "include",
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

  const markAllRead = async () => {
    try {
      const promises = notifs.map((notif) =>
        fetch(`http://localhost:8080/auth/notifications/${notif.id}/read`, {
          method: "POST",
          credentials: "include",
        })
      );
      await Promise.all(promises);
      setNotifs([]);
    } catch (err) {
      console.error("Error marking all notifications read:", err);
    }
  };

  const getNotificationIcon = (message) => {
    const msg = message.toLowerCase();
    if (msg.includes("auction") && msg.includes("start")) return "🚀";
    if (msg.includes("auction") && msg.includes("end")) return "🏁";
    if (msg.includes("bid")) return "💰";
    if (msg.includes("win") || msg.includes("won")) return "🎉";
    if (msg.includes("payment")) return "💳";
    if (msg.includes("delivery")) return "🚚";
    return "🔔";
  };

  const getNotificationPriority = (message) => {
    const msg = message.toLowerCase();
    if (
      msg.includes("urgent") ||
      msg.includes("payment") ||
      msg.includes("deadline")
    )
      return "high";
    if (msg.includes("auction end") || msg.includes("winner")) return "medium";
    return "normal";
  };

  const displayedNotifs = showAll ? notifs : notifs.slice(0, 5);

  if (!userId) return null;

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
          />
          <NavLink to={`/NotificationsPage/${userId}`}>
            Notifications{" "}
            {notifs.length > 0 && (
              <span className="notif-badge">{notifs.length}</span>
            )}
          </NavLink>
          <NavLink to="/profile">Profile</NavLink>
        </div>
      </nav>

      <div className="notifications-container">
        <div className="notifications-header">
          <div className="header-left">
            <h2 className="notifications-title">
              <span className="title-icon">🔔</span>
              Notifications
            </h2>
            <span className="notifications-count">{notifs.length} unread</span>
          </div>

          {notifs.length > 0 && (
            <div className="header-actions">
              <button
                className="action-btn mark-all-btn"
                onClick={markAllRead}
                title="Mark all as read"
              >
                <span className="btn-icon">✅</span>
                Mark All Read
              </button>
            </div>
          )}
        </div>

        <div className="notifications-content">
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading notifications...</p>
            </div>
          ) : notifs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🎉</div>
              <h3>All caught up!</h3>
              <p>You have no new notifications right now.</p>
            </div>
          ) : (
            <>
              <div className="notifications-list">
                {displayedNotifs.map((notif, index) => (
                  <div
                    key={notif.id}
                    className={`notification priority-${getNotificationPriority(
                      notif.message
                    )}`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="notification-icon">
                      {getNotificationIcon(notif.message)}
                    </div>

                    <div className="notification-content">
                      <p className="notification-message">{notif.message}</p>
                      <span className="notification-time">
                        {new Date().toLocaleDateString()} • Just now
                      </span>
                    </div>

                    <button
                      className="mark-read-btn"
                      onClick={() => markRead(notif.id)}
                      title="Mark as read"
                    >
                      <span className="btn-icon">✓</span>
                    </button>
                  </div>
                ))}
              </div>

              {notifs.length > 5 && (
                <div className="show-more-section">
                  <button
                    className="show-more-btn"
                    onClick={() => setShowAll(!showAll)}
                  >
                    {showAll ? "Show Less" : `Show ${notifs.length - 5} More`}
                    <span className={`arrow ${showAll ? "up" : "down"}`}>
                      ▼
                    </span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

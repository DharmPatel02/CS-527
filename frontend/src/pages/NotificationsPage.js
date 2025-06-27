import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import "./NotificationPages.css";

export default function NotificationsPanel() {
  const [notifs, setNotifs] = useState([]);
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (!userId) return;

    // Fetch unread notifications
    const fetchNotifs = async () => {
      try {
        const res = await fetch(
          `http://localhost:8080/auth/notifications?userId=${userId}`,
          { credentials: 'include' }
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
  }, [userId]);

  const markRead = async (id) => {
    try {
      const res = await fetch(
        `http://localhost:8080/auth/notifications/${id}/read`,
        {
          method: 'POST',
          credentials: 'include'
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

  if (!userId || notifs.length === 0) return null;

  return (
    <>
    <nav className="top-nav">
        <div className="logo">VEHICLE SHOP</div>
        <div className="nav-links">
          <NavLink to="/summary">Home</NavLink>
          {/* <NavLink to="/summary/car">Car</NavLink>
          <NavLink to="/summary/bike">Bike</NavLink>
          <NavLink to="/summary/truck">Truck</NavLink>
          <input type="text" placeholder="Search..." className="search-bar" />
          <NavLink to={`/NotificationsPage/${myUserId}`}>Notifications</NavLink> */}
          <NavLink to="/profile">Profile</NavLink>
          <NavLink to="/cart">Cart</NavLink>
        </div>
      </nav>
    <div className="notifications">
      <h4>Alerts</h4>
      {notifs.map(n => (
        <div key={n.id} className="notification">
          <p>{n.message}</p>
          <button onClick={() => markRead(n.id)}>Mark read</button>
        </div>
      ))}
    </div>
    </>
  );
}


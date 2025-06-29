import React, { useState, useEffect } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import "./ProfilePage.css";
import "./EditProfilePopup.css";

// Success Popup Component
const SuccessPopup = ({ onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(), 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      style={{
        position: "fixed",
        top: "0",
        left: "0",
        right: "0",
        bottom: "0",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: "9999",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "25px",
          borderRadius: "16px",
          textAlign: "center",
          border: "2px solid #28a745",
          boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
          maxWidth: "300px",
          width: "80%",
          transform: "scale(1)",
        }}
      >
        <div
          style={{
            fontSize: "2.2rem",
            marginBottom: "12px",
            lineHeight: "1",
          }}
        >
          ✅
        </div>
        <h3
          style={{
            color: "#28a745",
            fontSize: "1.1rem",
            fontWeight: "600",
            margin: "0 0 8px 0",
            fontFamily: "inherit",
            letterSpacing: "0.5px",
          }}
        >
          Success!
        </h3>
        <p
          style={{
            color: "#2c3e50",
            fontSize: "0.95rem",
            fontWeight: "500",
            margin: "0 0 20px 0",
            fontFamily: "inherit",
            lineHeight: "1.4",
          }}
        >
          Profile updated successfully!
        </p>
        <button
          onClick={onClose}
          style={{
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            padding: "10px 24px",
            borderRadius: "20px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
            fontFamily: "inherit",
            transition: "all 0.2s ease",
            minWidth: "80px",
            display: "block",
            margin: "0 auto",
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = "#20c997";
            e.target.style.transform = "translateY(-1px)";
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = "#28a745";
            e.target.style.transform = "translateY(0)";
          }}
        >
          OK
        </button>
      </div>
    </div>
  );
};

const EditProfilePopup = ({ userData, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    first_name: userData.first_name || "",
    last_name: userData.last_name || "",
    address: userData.address || "",
    phone_number: userData.phone_number || "",
    email: userData.email || "",
    username: userData.username || "",
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors({
        ...fieldErrors,
        [name]: "",
      });
    }

    // Clear general error when user makes changes
    if (error) {
      setError("");
    }
  };

  const validateForm = () => {
    const errors = {};

    // Validate phone number format if provided
    if (
      formData.phone_number &&
      !/^\+?[\d\s\-\(\)]{10,}$/.test(formData.phone_number)
    ) {
      errors.phone_number = "Please enter a valid phone number";
    }

    // Validate names don't contain numbers if provided
    if (formData.first_name && /\d/.test(formData.first_name)) {
      errors.first_name = "First name should not contain numbers";
    }

    if (formData.last_name && /\d/.test(formData.last_name)) {
      errors.last_name = "Last name should not contain numbers";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      if (!token) throw new Error("No authentication token found");

      const response = await fetch(
        `http://localhost:8080/auth/editprofile/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Failed to update profile");
      }

      onSave(responseData);
      setShowSuccess(true);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    onClose();
  };

  return (
    <>
      <div className="edit-popup-overlay">
        <div className="edit-popup-content">
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
          <h2>Edit Profile</h2>
          {error && (
            <p style={{ color: "red", textAlign: "center" }}>{error}</p>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="Enter your first name"
                disabled={isSubmitting}
              />
              {fieldErrors.first_name && (
                <span className="field-error">{fieldErrors.first_name}</span>
              )}
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Enter your last name"
                disabled={isSubmitting}
              />
              {fieldErrors.last_name && (
                <span className="field-error">{fieldErrors.last_name}</span>
              )}
            </div>
            <div className="form-group">
              <label>Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter your full address"
                disabled={isSubmitting}
              />
              {fieldErrors.address && (
                <span className="field-error">{fieldErrors.address}</span>
              )}
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                placeholder="+1 (555) 123-4567"
                disabled={isSubmitting}
              />
              {fieldErrors.phone_number && (
                <span className="field-error">{fieldErrors.phone_number}</span>
              )}
            </div>
            <div className="popup-buttons">
              <button
                type="submit"
                className="save-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                className="cancel-btn"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
      {showSuccess && <SuccessPopup onClose={handleSuccessClose} />}
    </>
  );
};

const ProfilePage = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const navigate = useNavigate();
  const myUserId = localStorage.getItem("userId");

  // Function to determine the correct home route based on user role
  const getHomeRoute = () => {
    const role = localStorage.getItem("role");
    const token = localStorage.getItem("token");

    if (!token) {
      return "/";
    }

    switch (role) {
      case "SELLER":
        return "/SellerDashboard";
      case "BUYER":
        return "/summary";
      case "ADMIN":
        return "/admin";
      case "CUSTOMER_REPRESENTATIVE":
        return "/customer-representative";
      default:
        return "/";
    }
  };

  const handleHomeClick = (e) => {
    e.preventDefault();
    const homeRoute = getHomeRoute();
    navigate(homeRoute);
  };

  const getImageUrl = (item) => {
    if (item.images) {
      if (Array.isArray(item.images) && typeof item.images[0] === "string")
        return item.images[0];
      if (
        Array.isArray(item.images) &&
        item.images[0] &&
        (item.images[0].url || item.images[0].src)
      )
        return item.images[0].url || item.images[0].src;
    }
    if (item.imageUrl) return item.imageUrl;
    if (item.image) return item.image;
    return "https://via.placeholder.com/300x200?text=No+Image";
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("No token found, redirecting to login");
      navigate("/");
      return;
    }

    const fetchUserData = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const token = localStorage.getItem("token");

        if (!userId || !token) throw new Error("Authentication data missing");

        const profileResponse = await fetch(
          `http://localhost:8080/auth/profile/${userId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            credentials: "include",
          }
        );

        if (!profileResponse.ok) {
          const errorData = await profileResponse.json();
          throw new Error(
            errorData.message || `HTTP error! status: ${profileResponse.status}`
          );
        }

        const profileData = await profileResponse.json();

        setUserData({
          user_id: profileData.user_id || userId,
          username: profileData.username || "",
          email: profileData.email || "",
          role: profileData.role ? profileData.role.toLowerCase() : "",
          first_name: profileData.first_name || "",
          last_name: profileData.last_name || "",
          address: profileData.address || "",
          phone_number: profileData.phone_number || "",
          join_date: profileData.created_at || "",
        });
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
        if (err.message.includes("401") || err.message.includes("403")) {
          console.log("Authentication error, clearing storage");
          localStorage.clear();
          navigate("/");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

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
          `http://localhost:8080/auth/notifications?userId=${myUserId}`,
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
          throw new Error(`Failed to load notifications: ${res.status}`);
        }
      } catch (err) {
        console.error("Error fetching notifications:", err);
        setError("Failed to load notifications.");
      }
    };

    fetchNotifs();
    const intervalId = setInterval(fetchNotifs, 30000);
    return () => clearInterval(intervalId);
  }, [myUserId, navigate]);

  const markRead = async (id) => {
    try {
      const res = await fetch(
        `http://localhost:8080/auth/notifications/${id}/read`,
        {
          method: "POST",
          credentials: "include",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      if (res.ok) {
        setNotifs((prev) => prev.filter((n) => n.id !== id));
      } else {
        throw new Error(`Failed to mark notification read: ${res.status}`);
      }
    } catch (err) {
      console.error("Error marking notification read:", err);
      setError("Failed to mark notification as read.");
    }
  };

  const fetchOrders = async () => {
    setLoadingOrders(true);
    setError(null);
    try {
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");

      if (!userId || !token) throw new Error("Authentication data missing");

      const ordersResponse = await fetch(
        `http://localhost:8080/auth/auction-items/buyer/${userId}/orders`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        }
      );

      if (!ordersResponse.ok) {
        const errorText = await ordersResponse.text();
        throw new Error(
          `Failed to fetch orders: ${ordersResponse.status} ${errorText}`
        );
      }

      const ordersData = await ordersResponse.json();
      setOrders(ordersData);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(err.message);
      if (err.message.includes("401") || err.message.includes("403")) {
        console.log("Authentication error, clearing storage");
        localStorage.clear();
        navigate("/");
      }
    } finally {
      setLoadingOrders(false);
    }
  };

  const toggleOrders = () => {
    if (!showOrders) {
      fetchOrders();
    }
    setShowOrders(!showOrders);
  };

  const handleProfileUpdate = (updatedData) => {
    setUserData((prev) => ({ ...prev, ...updatedData }));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    navigate("/HomePage");
  };

  if (loading) {
    return (
      <div className="loading-container">
        <p>Loading profile data...</p>
      </div>
    );
  }

  if (error && !showOrders) {
    return (
      <div className="error-container">
        <p>Error: {error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="error-container">
        <p>No user data available</p>
      </div>
    );
  }

  const isNotSeller = userData.role?.toLowerCase() !== "seller";

  return (
    <div className="page-container">
      <nav className="top-nav">
        <div className="logo">VEHICLE SHOP</div>
        <div className="nav-links">
          <a href="#" onClick={handleHomeClick} className="nav-link">
            Home
          </a>
          <NavLink to="/summary/car">Car</NavLink>
          <NavLink to="/summary/bike">Bike</NavLink>
          <NavLink to="/summary/truck">Truck</NavLink>
          <input type="text" placeholder="Search..." className="search-bar" />
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

      <div className="profile-header-section">
        <h1 className="profile-title">USER PROFILE</h1>
        <p className="profile-subtitle">
          Manage your account information and view your auction activity
        </p>
      </div>

      <div className="profile-container">
        <div className="profile-content">
          <div className="profile-cards">
            <div className="profile-card">
              <h3 className="card-title">Account Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">User ID</span>
                  <span className="info-value">{userData.user_id}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Username</span>
                  <span className="info-value">{userData.username}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Email</span>
                  <span className="info-value">{userData.email}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Account Type</span>
                  <span className="info-value role-badge role-{userData.role.toLowerCase()}">
                    {userData.role.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            <div className="profile-card">
              <h3 className="card-title">Personal Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">First Name</span>
                  <span className="info-value">
                    {userData.first_name || "Not provided"}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Last Name</span>
                  <span className="info-value">
                    {userData.last_name || "Not provided"}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Address</span>
                  <span className="info-value">
                    {userData.address || "Not provided"}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Phone Number</span>
                  <span className="info-value">
                    {userData.phone_number || "Not provided"}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="profile-actions">
            <button
              className="edit-profile-btn"
              onClick={() => setShowEditPopup(true)}
            >
              EDIT PROFILE
            </button>
            {isNotSeller && (
              <button className="my-orders-btn" onClick={toggleOrders}>
                {showOrders ? "HIDE ORDERS" : "MY ORDERS"}
              </button>
            )}
            <button className="logout-btn" onClick={handleLogout}>
              LOGOUT
            </button>
          </div>

          {isNotSeller && showOrders && (
            <div className="orders-section">
              <div className="orders-header">
                <h2 className="orders-title">MY ORDERS</h2>
                <p className="orders-subtitle">
                  View your winning auction items
                </p>
              </div>
              {loadingOrders ? (
                <div className="loading-message">
                  <div className="loading-icon">Loading...</div>
                  <p>Loading your orders...</p>
                </div>
              ) : error ? (
                <div className="no-results-message">
                  <div className="no-results-icon">Error</div>
                  <h4>Error loading orders</h4>
                  <p>{error}</p>
                </div>
              ) : orders.length > 0 ? (
                <div className="orders-list">
                  {orders.map((order) => (
                    <div className="order-card" key={order.auction_id}>
                      <div className="order-image">
                        <img src={getImageUrl(order)} alt={order.item_name} />
                      </div>
                      <div className="order-content">
                        <div className="order-header">
                          <span className="auction-id">
                            Auction #{order.auction_id}
                          </span>
                          <span className="winning-badge">WON</span>
                        </div>
                        <h3 className="order-title">{order.item_name}</h3>
                        <p className="order-description">{order.description}</p>
                        <div className="order-details">
                          <div className="order-detail">
                            <span className="detail-label">Category</span>
                            <span className="detail-value category-{order.category}">
                              {order.category?.toUpperCase()}
                            </span>
                          </div>
                          <div className="order-detail">
                            <span className="detail-label">Winning Amount</span>
                            <span className="detail-value price">
                              £{order.current_bid?.toLocaleString() || "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-results-message">
                  <div className="no-results-icon">No Results</div>
                  <h4>No orders found</h4>
                  <p>
                    You haven't won any auctions yet. Start bidding to see your
                    orders here!
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
        {showEditPopup && (
          <EditProfilePopup
            userData={userData}
            onClose={() => setShowEditPopup(false)}
            onSave={handleProfileUpdate}
          />
        )}
      </div>
    </div>
  );
};

export default ProfilePage;

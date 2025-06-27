// import React, { useState, useEffect } from "react";
// import { useNavigate, NavLink } from "react-router-dom";
// import "./ProfilePage.css";
// import "./EditProfilePopup.css";

// // Success Popup Component
// const SuccessPopup = ({ onClose }) => {
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       onClose();
//     }, 3000);
//     return () => clearTimeout(timer);
//   }, [onClose]);

//   return (
//     <div className="edit-popup-overlay">
//       <div
//         className="edit-popup-content"
//         style={{ textAlign: "center", padding: "15px" }}
//       >
//         <p style={{ color: "#4caf50", fontWeight: "bold" }}>
//           Profile updated successfully!
//         </p>
//       </div>
//     </div>
//   );
// };

// const EditProfilePopup = ({ userData, onClose, onSave }) => {
//   const [formData, setFormData] = useState({
//     first_name: userData.first_name || "",
//     last_name: userData.last_name || "",
//     address: userData.address || "",
//     phone_number: userData.phone_number || "",
//     email: userData.email || "",
//     username: userData.username || "",
//   });
//   const [showSuccess, setShowSuccess] = useState(false);
//   const [error, setError] = useState("");

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     try {
//       const token = localStorage.getItem("token");
//       const userId = localStorage.getItem("userId");

//       if (!token) {
//         throw new Error("No authentication token found");
//       }

//       const response = await fetch(
//         `http://localhost:8080/auth/editprofile/${userId}`,
//         {
//           method: "PUT",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//           body: JSON.stringify(formData),
//         }
//       );

//       const responseData = await response.json();

//       if (!response.ok) {
//         throw new Error(responseData.message || "Failed to update profile");
//       }

//       onSave(responseData);
//       setShowSuccess(true);
//     } catch (err) {
//       console.error("Error updating profile:", err);
//       setError("Failed to update profile: " + err.message);
//     }
//   };

//   const handleSuccessClose = () => {
//     setShowSuccess(false);
//     onClose();
//   };

//   return (
//     <>
//       <div className="edit-popup-overlay">
//         <div className="edit-popup-content">
//           <button className="close-btn" onClick={onClose}>
//             ×
//           </button>
//           <h2>Edit Profile</h2>
//           {error && (
//             <p style={{ color: "red", textAlign: "center" }}>{error}</p>
//           )}
//           <form onSubmit={handleSubmit}>
//             {/* <div className="form-group">
//               <label>Username</label>
//               <input
//                 type="text"
//                 name="username"
//                 value={formData.username}
//                 onChange={handleChange}
//                 placeholder="Username"
//                 required
//               />
//             </div> */}
//             {/* <div className="form-group">
//               <label>Email</label>
//               <input
//                 type="email"
//                 name="email"
//                 value={formData.email}
//                 onChange={handleChange}
//                 placeholder="Email"
//                 required
//               />
//             </div> */}
//             <div className="form-group">
//               <label>First Name</label>
//               <input
//                 type="text"
//                 name="first_name"
//                 value={formData.first_name}
//                 onChange={handleChange}
//                 placeholder="First Name"
//               />
//             </div>
//             <div className="form-group">
//               <label>Last Name</label>
//               <input
//                 type="text"
//                 name="last_name"
//                 value={formData.last_name}
//                 onChange={handleChange}
//                 placeholder="Last Name"
//               />
//             </div>
//             <div className="form-group">
//               <label>Address</label>
//               <input
//                 type="text"
//                 name="address"
//                 value={formData.address}
//                 onChange={handleChange}
//                 placeholder="Address"
//               />
//             </div>
//             <div className="form-group">
//               <label>Phone Number</label>
//               <input
//                 type="text"
//                 name="phone_number"
//                 value={formData.phone_number}
//                 onChange={handleChange}
//                 placeholder="Phone Number"
//               />
//             </div>
//             <div className="popup-buttons">
//               <button type="submit" className="save-btn">
//                 Save
//               </button>
//               <button type="button" className="cancel-btn" onClick={onClose}>
//                 Cancel
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//       {showSuccess && <SuccessPopup onClose={handleSuccessClose} />}
//     </>
//   );
// };

// const ProfilePage = () => {
//   const navigate = useNavigate();
//   const [showOrders, setShowOrders] = useState(false);
//   const [userData, setUserData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [orders, setOrders] = useState([]);
//   const [showEditPopup, setShowEditPopup] = useState(false);

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (!token) {
//       console.log("No token found, redirecting to login");
//       navigate("/");
//       return;
//     }

//     const fetchUserData = async () => {
//       try {
//         const userId = localStorage.getItem("userId");
//         const token = localStorage.getItem("token");

//         if (!userId || !token) {
//           throw new Error("Authentication data missing");
//         }

//         const profileResponse = await fetch(
//           `http://localhost:8080/auth/profile/${userId}`,
//           {
//             method: "GET",
//             headers: {
//               "Content-Type": "application/json",
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );

//         if (!profileResponse.ok) {
//           const errorData = await profileResponse.json();
//           throw new Error(
//             errorData.message || `HTTP error! status: ${profileResponse.status}`
//           );
//         }

//         const profileData = await profileResponse.json();

//         const ordersResponse = await fetch(
//           `http://localhost:8080/orders/user/${userId}`,
//           {
//             method: "GET",
//             headers: {
//               "Content-Type": "application/json",
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );

//         let ordersData = [];
//         if (ordersResponse.ok) {
//           ordersData = await ordersResponse.json();
//         } else {
//           console.warn("Failed to fetch orders:", ordersResponse.status);
//         }

//         setUserData({
//           user_id: profileData.user_id || userId,
//           username: profileData.username || "",
//           email: profileData.email || "",
//           role: profileData.role ? profileData.role.toLowerCase() : "",
//           first_name: profileData.first_name || "",
//           last_name: profileData.last_name || "",
//           address: profileData.address || "",
//           phone_number: profileData.phone_number || "",
//           join_date: profileData.created_at || "",
//         });

//         setOrders(ordersData);
//       } catch (err) {
//         console.error("Error fetching data:", err);
//         setError(err.message);
//         if (err.message.includes("401") || err.message.includes("403")) {
//           console.log("Authentication error, clearing storage");
//           localStorage.clear();
//           navigate("/");
//         }
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUserData();
//   }, [navigate]);

//   const handleProfileUpdate = (updatedData) => {
//     setUserData((prev) => ({
//       ...prev,
//       ...updatedData,
//     }));
//   };

//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("userId");
//     localStorage.removeItem("username");
//     localStorage.removeItem("role");
//     navigate("/");
//   };

//   const toggleOrders = () => {
//     setShowOrders(!showOrders);
//   };

//   if (loading) {
//     return (
//       <div className="loading-container">
//         <p>Loading profile data...</p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="error-container">
//         <p>Error: {error}</p>
//         <button onClick={() => window.location.reload()}>Retry</button>
//       </div>
//     );
//   }

//   if (!userData) {
//     return (
//       <div className="error-container">
//         <p>No user data available</p>
//       </div>
//     );
//   }

//   return (
//     <div>
//       <nav className="top-nav">
//         <div className="logo">VEHICLE SHOP</div>
//         <div className="nav-links">
//           <NavLink to="/summary">Home</NavLink>
//           <NavLink to="/summary/car">Car</NavLink>
//           <NavLink to="/summary/bike">Bike</NavLink>
//           <NavLink to="/summary/truck">Truck</NavLink>
//           <input type="text" placeholder="Search..." className="search-bar" />
//           <NavLink to={`/NotificationsPage/${myUserId}`}>Notifications</NavLink>
//           <NavLink to="/profile">Profile</NavLink>
//           <NavLink to="/cart">Cart</NavLink>
//         </div>
//       </nav>

//       <div className="profile-container">
//         <div className="profile-header">
//           <h1>USER PROFILE</h1>
//         </div>
//         <div className="profile-content">
//           <div className="profile-info">
//             <div className="info-item">
//               <span className="info-label">User ID:</span>
//               <span className="info-value">{userData.user_id}</span>
//             </div>
//             <div className="info-item">
//               <span className="info-label">Username:</span>
//               <span className="info-value">{userData.username}</span>
//             </div>
//             <div className="info-item">
//               <span className="info-label">Email:</span>
//               <span className="info-value">{userData.email}</span>
//             </div>
//             <div className="info-item">
//               <span className="info-label">Account Type:</span>
//               <span className="info-value">{userData.role.toUpperCase()}</span>
//             </div>
//             <div className="info-item">
//               <span className="info-label">First Name:</span>
//               <span className="info-value">{userData.first_name}</span>
//             </div>
//             <div className="info-item">
//               <span className="info-label">Last Name:</span>
//               <span className="info-value">{userData.last_name}</span>
//             </div>
//             <div className="info-item">
//               <span className="info-label">Address:</span>
//               <span className="info-value">{userData.address}</span>
//             </div>
//             <div className="info-item">
//               <span className="info-label">Phone Number:</span>
//               <span className="info-value">{userData.phone_number}</span>
//             </div>
//             {/* <div className="info-item">
//               <span className="info-label">Member Since:</span>
//               <span className="info-value">{userData.join_date}</span>
//             </div> */}
//           </div>
//           <div className="profile-actions">
//             <button
//               className="edit-profile-btn"
//               onClick={() => setShowEditPopup(true)}
//             >
//               EDIT PROFILE
//             </button>
//             <button className="my-orders-btn" onClick={toggleOrders}>
//               {showOrders ? "HIDE ORDERS" : "MY ORDERS"}
//             </button>
//             <button className="logout-btn" onClick={handleLogout}>
//               LOGOUT
//             </button>
//           </div>

//           {showOrders && (
//             <div className="orders-section">
//               <h2>MY ORDERS</h2>
//               {orders.length > 0 ? (
//                 <div className="orders-list">
//                   {orders.map((order) => (
//                     <div className="order-item" key={order.id}>
//                       <div className="order-header">
//                         <span className="order-id">Order #{order.id}</span>
//                         <span className="order-date">{order.date}</span>
//                       </div>
//                       <div className="order-details">
//                         <span className="order-name">{order.item}</span>
//                         <span className="order-price">
//                           £{order.price?.toLocaleString() || "N/A"}
//                         </span>
//                       </div>
//                       <div className="order-status">
//                         Status:{" "}
//                         <span
//                           className={`status-${
//                             order.status?.toLowerCase()?.replace(" ", "-") ||
//                             "unknown"
//                           }`}
//                         >
//                           {order.status || "Status not available"}
//                         </span>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <p className="no-orders">No orders found</p>
//               )}
//             </div>
//           )}
//         </div>
//         {showEditPopup && (
//           <EditProfilePopup
//             userData={userData}
//             onClose={() => setShowEditPopup(false)}
//             onSave={handleProfileUpdate}
//           />
//         )}
//       </div>
//     </div>
//   );
// };

// export default ProfilePage;

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
    <div className="edit-popup-overlay">
      <div
        className="edit-popup-content"
        style={{ textAlign: "center", padding: "15px" }}
      >
        <p style={{ color: "#4caf50", fontWeight: "bold" }}>
          Profile updated successfully!
        </p>
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
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
                placeholder="First Name"
              />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Last Name"
              />
            </div>
            <div className="form-group">
              <label>Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Address"
              />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="text"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                placeholder="Phone Number"
              />
            </div>
            <div className="popup-buttons">
              <button type="submit" className="save-btn">
                Save
              </button>
              <button type="button" className="cancel-btn" onClick={onClose}>
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
  const navigate = useNavigate();
  const [showOrders, setShowOrders] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState([]);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [notifs, setNotifs] = useState([]);

  const myUserId = localStorage.getItem("userId");

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
    <div>
      <nav className="top-nav">
        <div className="logo">VEHICLE SHOP</div>
        <div className="nav-links">
          <NavLink to="/summary">Home</NavLink>
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

      <div className="profile-container">
        <div className="profile-header">
          <h1>USER PROFILE</h1>
        </div>
        <div className="profile-content">
          <div className="profile-info">
            <div className="info-item">
              <span className="info-label">User ID:</span>
              <span className="info-value">{userData.user_id}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Username:</span>
              <span className="info-value">{userData.username}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Email:</span>
              <span className="info-value">{userData.email}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Account Type:</span>
              <span className="info-value">{userData.role.toUpperCase()}</span>
            </div>
            <div className="info-item">
              <span className="info-label">First Name:</span>
              <span className="info-value">{userData.first_name}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Last Name:</span>
              <span className="info-value">{userData.last_name}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Address:</span>
              <span className="info-value">{userData.address}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Phone Number:</span>
              <span className="info-value">{userData.phone_number}</span>
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
              <h2>MY ORDERS</h2>
              {loadingOrders ? (
                <p>Loading orders...</p>
              ) : error ? (
                <p className="no-orders">Error: {error}</p>
              ) : orders.length > 0 ? (
                <div className="orders-list">
                  {orders.map((order) => (
                    <div className="order-item" key={order.auction_id}>
                      <img
                        className="order-img"
                        src={getImageUrl(order)}
                        alt={order.item_name}
                        style={{
                          width: "150px",
                          height: "100px",
                          objectFit: "cover",
                        }}
                      />
                      <div className="order-details">
                        <div className="order-header">
                          <span className="order-id">
                            Auction #{order.auction_id}
                          </span>
                        </div>
                        <span className="order-name">
                          <strong>Item:</strong> {order.item_name}
                        </span>
                        <span className="order-description">
                          <strong>Description:</strong> {order.description}
                        </span>
                        <span className="order-category">
                          <strong>Category:</strong> {order.category}
                        </span>
                        <span className="order-price">
                          <strong>Winning Amount:</strong> £
                          {order.current_bid?.toLocaleString() || "N/A"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-orders">No orders found</p>
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

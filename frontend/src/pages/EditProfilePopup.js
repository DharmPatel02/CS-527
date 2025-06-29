import React, { useState } from "react";

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const user_id = localStorage.getItem("user_id");

      const response = await fetch(
        `http://localhost:8080/auth/editprofile/${user_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update profile");
      }

      const updatedData = await response.json();
      onSave(updatedData);
      setShowSuccess(true);
    } catch (err) {
      console.error("Error updating profile:", err);
      alert(`Failed to update profile: ${err.message}`);
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
          <button
            className="close-btn"
            onClick={onClose}
            disabled={isSubmitting}
          >
            ×
          </button>
          <h2>Edit Profile</h2>
          <form onSubmit={handleSubmit}>
            {/* <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div> */}
            {/* <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div> */}
            <div className="form-group">
              <label htmlFor="first_name">First Name</label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="last_name">Last Name</label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="address">Address</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone_number">Phone Number</label>
              <input
                type="tel"
                id="phone_number"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                pattern="[0-9]{10}"
                title="Please enter a 10-digit phone number"
              />
            </div>
            <div className="popup-buttons">
              <button
                type="submit"
                className="save-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save"}
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

      {showSuccess && (
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
              padding: "40px",
              borderRadius: "20px",
              textAlign: "center",
              border: "3px solid #28a745",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
              maxWidth: "400px",
              width: "90%",
            }}
          >
            <div
              style={{
                fontSize: "3rem",
                marginBottom: "20px",
              }}
            >
              ✅
            </div>
            <h2
              style={{
                color: "#28a745",
                fontSize: "1.5rem",
                fontWeight: "bold",
                margin: "0 0 20px 0",
                fontFamily: "inherit",
              }}
            >
              SUCCESS!
            </h2>
            <p
              style={{
                color: "#2c3e50",
                fontSize: "1.2rem",
                fontWeight: "bold",
                margin: "0 0 30px 0",
                fontFamily: "inherit",
              }}
            >
              Profile updated successfully!
            </p>
            <button
              onClick={handleSuccessClose}
              style={{
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                padding: "15px 30px",
                borderRadius: "25px",
                fontSize: "16px",
                fontWeight: "bold",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
              onMouseOver={(e) => (e.target.style.backgroundColor = "#20c997")}
              onMouseOut={(e) => (e.target.style.backgroundColor = "#28a745")}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default EditProfilePopup;
// const EditProfilePopup = ({ userData, onClose, onSave }) => {
//   const [formData, setFormData] = useState({
//     first_Name: userData.firstName,
//     last_Name: userData.lastName,
//     address: userData.address,
//     phone_Number: userData.phoneNumber,
//     email: userData.email,
//     username: userData.username,
//   });
//   const [showSuccess, setShowSuccess] = useState(false);

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const token = localStorage.getItem("token");
//       const userId = localStorage.getItem("userId");

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

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || "Failed to update profile");
//       }

//       const updatedData = await response.json();
//       onSave(updatedData);
//       setShowSuccess(true);
//     } catch (err) {
//       console.error("Error updating profile:", err);
//       alert("Failed to update profile: " + err.message);
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
//           <form onSubmit={handleSubmit}>
//             <div className="form-group">
//               <label htmlFor="username">Username</label>
//               <input
//                 type="text"
//                 id="username"
//                 name="username"
//                 value={formData.username}
//                 onChange={handleChange}
//               />
//             </div>
//             <div className="form-group">
//               <label htmlFor="email">Email</label>
//               <input
//                 type="email"
//                 id="email"
//                 name="email"
//                 value={formData.email}
//                 onChange={handleChange}
//               />
//             </div>
//             <div className="form-group">
//               <label htmlFor="firstName">First Name</label>
//               <input
//                 type="text"
//                 id="firstName"
//                 name="firstName"
//                 value={formData.firstName}
//                 onChange={handleChange}
//               />
//             </div>
//             <div className="form-group">
//               <label htmlFor="lastName">Last Name</label>
//               <input
//                 type="text"
//                 id="last_Name"
//                 name="lastName"
//                 value={formData.last_Name}
//                 onChange={handleChange}
//               />
//             </div>
//             <div className="form-group">
//               <label htmlFor="address">Address</label>
//               <input
//                 type="text"
//                 id="address"
//                 name="address"
//                 value={formData.address}
//                 onChange={handleChange}
//               />
//             </div>
//             <div className="form-group">
//               <label htmlFor="phoneNumber">Phone Number</label>
//               <input
//                 type="text"
//                 id="phoneNumber"
//                 name="phoneNumber"
//                 value={formData.phoneNumber}
//                 onChange={handleChange}
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
// import React, { useState, useEffect } from "react";
// import { useNavigate, NavLink } from "react-router-dom";
// import "./ProfilePage.css";

// // Success Popup Component
// const SuccessPopup = ({ onClose }) => {
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       onClose();
//     }, 3000);
//     return () => clearTimeout(timer);
//   }, [onClose]);

//   return (
//     <div className="success-popup-overlay">
//       <div className="success-popup-content">
//         <p>Profile updated successfully!</p>
//       </div>
//     </div>
//   );
// };

// // Edit Profile Popup Component
// const EditProfilePopup = ({ userData, onClose, onSave }) => {
//   const [formData, setFormData] = useState({
//     firstName: userData.firstName,
//     lastName: userData.lastName,
//     address: userData.address,
//     phoneNumber: userData.phoneNumber,
//     email: userData.email,
//     username: userData.username,
//   });
//   const [showSuccess, setShowSuccess] = useState(false);

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const token = localStorage.getItem("token");
//       const username = userData.username;

//       const response = await fetch(
//         `http://localhost:8080/auth/editprofile/${username}`,
//         {
//           method: "PUT",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//           body: JSON.stringify(formData),
//         }
//       );

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || "Failed to update profile");
//       }

//       const updatedData = await response.json();
//       onSave(updatedData);
//       setShowSuccess(true);
//     } catch (err) {
//       console.error("Error updating profile:", err);
//       alert("Failed to update profile: " + err.message);
//     }
//   };

//   const handleSuccessClose = () => {
//     setShowSuccess(false);
//     onClose();
//   };

//   return (
//     <>
//       <div className="popup-overlay">
//         <div className="popup-content">
//           <button className="close-btn" onClick={onClose}>
//             ×
//           </button>
//           <h2>Edit Profile</h2>
//           <div className="edit-form">
//             <input
//               type="text"
//               name="username"
//               value={formData.username}
//               onChange={handleChange}
//               placeholder="Username"
//             />
//             <input
//               type="email"
//               name="email"
//               value={formData.email}
//               onChange={handleChange}
//               placeholder="Email"
//             />
//             <input
//               type="text"
//               name="firstName"
//               value={formData.firstName}
//               onChange={handleChange}
//               placeholder="First Name"
//             />
//             <input
//               type="text"
//               name="lastName"
//               value={formData.lastName}
//               onChange={handleChange}
//               placeholder="Last Name"
//             />
//             <input
//               type="text"
//               name="address"
//               value={formData.address}
//               onChange={handleChange}
//               placeholder="Address"
//             />
//             <input
//               type="text"
//               name="phoneNumber"
//               value={formData.phoneNumber}
//               onChange={handleChange}
//               placeholder="Phone Number"
//             />
//             <div className="popup-actions">
//               <button onClick={handleSubmit}>Save</button>
//               <button onClick={onClose}>Cancel</button>
//             </div>
//           </div>
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
//           userId: profileData.user_id || userId,
//           username: profileData.username || "",
//           email: profileData.email || "",
//           role: profileData.role ? profileData.role.toLowerCase() : "",
//           firstName: profileData.first_name || "",
//           lastName: profileData.last_name || "",
//           address: profileData.address || "",
//           phoneNumber: profileData.phone_number || "",
//           joinDate: profileData.created_at || "",
//         });

//         setOrders(ordersData);
//       } catch (err) {
//         console.error("Error fetching data:", err);
//         setError(err.message);
//         if (err.message.includes("401") || err.message.includes("403")) {
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
//               <span className="info-value">{userData.userId}</span>
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
//               <span className="info-value">{userData.firstName}</span>
//             </div>
//             <div className="info-item">
//               <span className="info-label">Last Name:</span>
//               <span className="info-value">{userData.lastName}</span>
//             </div>
//             <div className="info-item">
//               <span className="info-label">Address:</span>
//               <span className="info-value">{userData.address}</span>
//             </div>
//             <div className="info-item">
//               <span className="info-label">Phone Number:</span>
//               <span className="info-value">{userData.phoneNumber}</span>
//             </div>
//             <div className="info-item">
//               <span className="info-label">Member Since:</span>
//               <span className="info-value">{userData.joinDate}</span>
//             </div>
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

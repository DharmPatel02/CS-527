// // import React, { useState, useEffect } from 'react';
// // import { useNavigate, NavLink } from 'react-router-dom';
// // import './SellerDashboardStyle.css';

// // const SellerDashboard = () => {
// //   const navigate = useNavigate();
// //   const [items, setItems] = useState([]);
// //   const [newItem, setNewItem] = useState({
// //     item_name: '',
// //     description: '',
// //     starting_price: '',
// //     bid_increment: '',
// //     start_time: '',
// //     closing_time: '',
// //     category: '',
// //     imageFiles: [],
// //     min_price: '', // Added for reserve price
// //   });
// //   const [editingId, setEditingId] = useState(null);
// //   const [alert, setAlert] = useState('');

// //   // Redirect non-sellers to login
// //   useEffect(() => {
// //     if (localStorage.getItem('role') !== 'SELLER') {
// //       navigate('/login');
// //     }
// //   }, [navigate]);

// //   // Fetch seller's auctions
// //   useEffect(() => {
// //     async function loadItems() {
// //       try {
// //         const sellerId = localStorage.getItem("userId");
// //         const res = await fetch(
// //           `http://localhost:8080/auth/auction-items/summarySeller/${sellerId}`,
// //           {
// //             credentials: "include",
// //             headers: {
// //               "Authorization": `Bearer ${localStorage.getItem('token')}` // Added for consistency
// //             }
// //           }
// //         );
// //         if (!res.ok) throw new Error(`Status ${res.status}`);
// //         const data = await res.json();
// //         setItems(data);
// //       } catch (err) {
// //         console.error(err);
// //         setAlert("Failed to load auctions.");
// //       }
// //     }
// //     loadItems();
// //   }, []);

// //   const handleChange = (e) => {
// //     const { name, value } = e.target;
// //     setNewItem((prev) => ({ ...prev, [name]: value }));
// //   };

// //   const handleFileChange = (e) => {
// //     const files = Array.from(e.target.files);
// //     setNewItem((prev) => ({ ...prev, imageFiles: files }));
// //   };

// //   const handleEdit = (item) => {
// //     setEditingId(item.auction_id);
// //     setNewItem({
// //       item_name: item.item_name,
// //       description: item.description,
// //       starting_price: item.starting_price.toString(),
// //       bid_increment: item.bid_increment.toString(),
// //       closing_time: new Date(item.closing_time).toISOString().slice(0, 16),
// //       category: item.category,
// //       imageFiles: [],
// //       min_price: item.min_price ? item.min_price.toString() : '',
// //     });
// //     window.scrollTo({ top: 0, behavior: 'smooth' });
// //   };

// //   const handleCancel = () => {
// //     setEditingId(null);
// //     setNewItem({
// //       item_name: '',
// //       description: '',
// //       starting_price: '',
// //       bid_increment: '',
// //       start_time: '',
// //       closing_time: '',
// //       category: '',
// //       imageFiles: [],
// //       min_price: '',
// //     });
// //     setAlert('');
// //   };

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
// //     setAlert("");

// //     const sellerId = Number(localStorage.getItem('userId'));
// //     const startPrice = parseFloat(newItem.starting_price);
// //     const minPrice = newItem.min_price ? parseFloat(newItem.min_price) : null;
// //     const baseUrl = 'http://localhost:8080/auth/auction-items';
// //     const url = editingId
// //       ? `${baseUrl}/${sellerId}/update`
// //       : `${baseUrl}/${sellerId}/upload`;
// //     const method = editingId ? 'PUT' : 'POST';

// //     // Validation: Ensure min_price is >= starting_price if provided
// //     if (minPrice && minPrice < startPrice) {
// //       setAlert("Minimum price must be greater than or equal to the starting price.");
// //       return;
// //     }

// //     // Build FormData
// //     const formData = new FormData();
// //     if (editingId) {
// //       formData.append('auction_id', editingId);
// //     }
// //     formData.append('seller_id', sellerId);
// //     formData.append('item_name', newItem.item_name);
// //     formData.append('description', newItem.description);
// //     formData.append('starting_price', startPrice);
// //     formData.append('current_bid', startPrice);
// //     formData.append('bid_increment', parseFloat(newItem.bid_increment));
// //     formData.append(
// //       'start_time',
// //       new Date(newItem.start_time).toISOString()
// //     );
// //     formData.append('closing_time', new Date(newItem.closing_time).toISOString());
// //     formData.append('category', newItem.category);
// //     if (minPrice) {
// //       formData.append('min_price', minPrice);
// //     }
// //     newItem.imageFiles.forEach((file) => {
// //       formData.append('images', file);
// //     });

// //     console.log(`${editingId ? 'Updating' : 'Uploading'} to ${url}`, Array.from(formData.entries()));

// //     try {
// //       const res = await fetch(url, {
// //         method,
// //         body: formData,
// //         credentials: 'include',
// //         headers: {
// //           // Do not set Content-Type for FormData; the browser sets it automatically with the correct boundary
// //           "Authorization": `Bearer ${localStorage.getItem('token')}` // Added for consistency
// //         }
// //       });

// //       // Log the response status and headers for debugging
// //       console.log(`Response status: ${res.status}`);
// //       console.log(`Response headers:`, res.headers.get('Content-Type'));

// //       if (res.status === 403) {
// //         setAlert("Permission denied. Please log in again.");
// //         return;
// //       }
// //       if (!res.ok) {
// //         const errorText = await res.text(); // Use text() to avoid JSON parsing errors
// //         throw new Error(`Status ${res.status}: ${errorText}`);
// //       }

// //       // Check if the response is JSON
// //       const contentType = res.headers.get('Content-Type');
// //       let result;
// //       if (contentType && contentType.includes('application/json')) {
// //         result = await res.json();
// //       } else {
// //         const text = await res.text();
// //         throw new Error(`Expected JSON response, but received: ${text}`);
// //       }

// //       setAlert(editingId ? 'Item updated successfully.' : 'Item uploaded successfully.');
// //       if (editingId) {
// //         setItems((prev) => prev.map((i) => (i.auction_id === editingId ? result : i)));
// //       } else {
// //         setItems((prev) => [...prev, result]);
// //       }
// //       handleCancel();
// //     } catch (err) {
// //       console.error('Submit error:', err);
// //       setAlert(`${editingId ? 'Update failed' : 'Upload failed'}: ${err.message}`);
// //     }
// //   };

// //   const now = new Date();
// //   const active = items.filter((i) => new Date(i.closing_time) > now);
// //   const closed = items.filter((i) => new Date(i.closing_time) <= now);

// //   // Function to determine the winner for closed auctions
// //   const determineWinner = (item) => {
// //     const finalBid = parseFloat(item.current_bid);
// //     const reservePrice = item.min_price ? parseFloat(item.min_price) : null;

// //     if (reservePrice && finalBid < reservePrice) {
// //       return '- (Reserve(Minimum price) not met)';
// //     }

// //     return item.buyer_username || '-';
// //   };

// //   return (
// //     <div className="seller-dashboard">
// //       <nav className="top-nav">
// //         <div className="nav-links">
// //           <NavLink to="/profile" className="profile">
// //             Profile
// //           </NavLink>
// //         </div>
// //       </nav>
// //       <h2>{editingId ? 'Edit Auction Item' : 'Add Auction Item'}</h2>
// //       {alert && <div className="alert">{alert}</div>}

// //       <form onSubmit={handleSubmit} className="new-item-form">
// //         <input
// //           name="item_name"
// //           placeholder="Item Name"
// //           value={newItem.item_name}
// //           onChange={handleChange}
// //           required
// //         />
// //         <textarea
// //           name="description"
// //           placeholder="Description"
// //           value={newItem.description}
// //           onChange={handleChange}
// //           required
// //         />
// //         <input
// //           name="starting_price"
// //           type="number"
// //           placeholder="Starting Price"
// //           value={newItem.starting_price}
// //           onChange={handleChange}
// //           required
// //         />
// //         <input
// //           name="bid_increment"
// //           type="number"
// //           placeholder="Bid Increment"
// //           value={newItem.bid_increment}
// //           onChange={handleChange}
// //           required
// //         />
// //         <input
// //           name="min_price"
// //           type="number"
// //           placeholder="Minimum Price (Optional)"
// //           value={newItem.min_price}
// //           onChange={handleChange}
// //         />
// //         <label>Starting Time:</label>
// //         <input
// //           name="start_time"
// //           type="datetime-local"
// //           value={newItem.start_time}
// //           onChange={handleChange}
// //           required
// //         />
// //         <label>Closing Time:</label>

// //         <input
// //           name="closing_time"
// //           type="datetime-local"
// //           value={newItem.closing_time}
// //           onChange={handleChange}
// //           required
// //         />
// //         <select
// //           name="category"
// //           value={newItem.category}
// //           onChange={handleChange}
// //           required
// //         >
// //           <option value="">--Select Category--</option>
// //           <option value="car">Car</option>
// //           <option value="bike">Bike</option>
// //           <option value="truck">Truck</option>
// //         </select>
// //         <div className="file-input-section">
// //           <label>Upload Images:</label>
// //           <input
// //             type="file"
// //             multiple
// //             accept="image/*"
// //             onChange={handleFileChange}
// //           />
// //           {newItem.imageFiles.length > 0 && (
// //             <div className="selected-files">
// //               <p>Selected files:</p>
// //               <ul>
// //                 {newItem.imageFiles.map((file, index) => (
// //                   <li key={index}>{file.name}</li>
// //                 ))}
// //               </ul>
// //             </div>
// //           )}
// //         </div>
// //         <div className="form-buttons">
// //           <button type="submit">
// //             {editingId ? 'Update Item' : 'Upload Item'}
// //           </button>
// //           {editingId && (
// //             <button type="button" onClick={handleCancel}>
// //               Cancel
// //             </button>
// //           )}
// //         </div>
// //       </form>

// //       <h3>Active Auctions</h3>
// //       <table className="items-table">
// //         <thead>
// //           <tr>
// //             <th>Item</th>
// //             <th>Category</th>
// //             <th>Current Bid</th>
// //             <th>Minimum Price</th>
// //             <th>Closes</th>
// //             <th>Images</th>
// //           </tr>
// //         </thead>
// //         <tbody>
// //           {active.length > 0 ? (
// //             active.map((item) => (
// //               <tr key={item.auction_id}>
// //                 <td>{item.item_name}</td>
// //                 <td>{item.category}</td>
// //                 <td>${item.current_bid}</td>
// //                 <td>{item.min_price ? `$${item.min_price}` : '-'}</td>
// //                 <td>{new Date(item.closing_time).toLocaleString()}</td>
// //                 <td>
// //                   {Array.isArray(item.images) &&
// //                     item.images.map((u, k) => (
// //                       <img
// //                         key={k}
// //                         src={u}
// //                         alt={item.item_name}
// //                         className="table-image"
// //                       />
// //                     ))}
// //                 </td>
// //               </tr>
// //             ))
// //           ) : (
// //             <tr>
// //               <td colSpan={6}>No active auctions.</td>
// //             </tr>
// //           )}
// //         </tbody>
// //       </table>

// //       <h3>Closed Auctions</h3>
// //       <table className="items-table">
// //         <thead>
// //           <tr>
// //             <th>Item</th>
// //             <th>Category</th>
// //             <th>Final Bid</th>
// //             <th>Minimum Price</th>
// //             <th>Closed</th>
// //             <th>Winner</th>
// //             <th>Images</th>
// //           </tr>
// //         </thead>
// //         <tbody>
// //           {closed.length > 0 ? (
// //             closed.map((item) => (
// //               <tr key={item.auction_id}>
// //                 <td>{item.item_name}</td>
// //                 <td>{item.category}</td>
// //                 <td>${item.current_bid}</td>
// //                 <td>{item.min_price ? `$${item.min_price}` : '-'}</td>
// //                 <td>{new Date(item.closing_time).toLocaleString()}</td>
// //                 <td>{determineWinner(item)}</td>
// //                 <td>
// //                   {Array.isArray(item.images) &&
// //                     item.images.map((u, k) => (
// //                       <img
// //                         key={k}
// //                         src={u}
// //                         alt={item.item_name}
// //                         className="table-image"
// //                       />
// //                     ))}
// //                 </td>
// //               </tr>
// //             ))
// //           ) : (
// //             <tr>
// //               <td colSpan={7}>No closed auctions.</td>
// //             </tr>
// //           )}
// //         </tbody>
// //       </table>
// //     </div>
// //   );
// // };

// // export default SellerDashboard;

// import React, { useState, useEffect } from "react";
// import { useNavigate, NavLink } from "react-router-dom";
// import "./SellerDashboardStyle.css";

// const SellerDashboard = () => {
//   const navigate = useNavigate();
//   const [items, setItems] = useState([]);
//   const [notifs, setNotifs] = useState([]); // State for notifications

//   const [newItem, setNewItem] = useState({
//     item_name: "",
//     description: "",
//     starting_price: "",
//     bid_increment: "",
//     start_time: "",
//     closing_time: "",
//     category: "",
//     imageFiles: [],
//     min_price: "",
//   });
//   const [editingId, setEditingId] = useState(null);
//   const [alert, setAlert] = useState("");
//   const myUserId = localStorage.getItem("userId");

//   // Redirect non-sellers to login
//   useEffect(() => {
//     if (localStorage.getItem("role") !== "SELLER") {
//       navigate("/login");
//     }
//   }, [navigate]);

//   // Fetch seller's auctions
//   useEffect(() => {
//     async function loadItems() {
//       try {
//         const sellerId = localStorage.getItem("userId");
//         const res = await fetch(
//           `http://localhost:8080/auth/auction-items/summarySeller/${sellerId}`,
//           {
//             credentials: "include",
//             headers: {
//               Authorization: `Bearer ${localStorage.getItem("token")}`,
//             },
//           }
//         );
//         if (!res.ok) throw new Error(`Status ${res.status}`);
//         const data = await res.json();
//         console.log("Backend response from /summarySeller:", data); // Debug log
//         setItems(data);
//       } catch (err) {
//         console.error(err);
//         setAlert("Failed to load auctions.");
//       }
//     }
//     loadItems();
//   }, []);

//   useEffect(() => {
//     if (!myUserId) {
//       navigate("/login");
//       return;
//     }

//     const fetchNotifs = async () => {
//       try {
//         const res = await fetch(
//           `http://localhost:8080/auth/notifications?userId=${myUserId}`,
//           {
//             credentials: "include",
//             headers: {
//               Authorization: `Bearer ${localStorage.getItem("token")}`,
//             },
//           }
//         );
//         if (res.ok) {
//           const data = await res.json();
//           setNotifs(data);
//         } else {
//           console.error("Failed to load notifications:", res.status);
//         }
//       } catch (err) {
//         console.error("Error fetching notifications:", err);
//       }
//     };

//     fetchNotifs();
//     // Poll every 30 seconds
//     const intervalId = setInterval(fetchNotifs, 30000);
//     return () => clearInterval(intervalId);
//   }, [myUserId, navigate]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setNewItem((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleFileChange = (e) => {
//     const files = Array.from(e.target.files);
//     setNewItem((prev) => ({ ...prev, imageFiles: files }));
//   };

//   const handleEdit = (item) => {
//     setEditingId(item.auction_id);
//     setNewItem({
//       item_name: item.item_name,
//       description: item.description,
//       starting_price: item.starting_price.toString(),
//       bid_increment: item.bid_increment.toString(),
//       start_time: item.start_time
//         ? new Date(item.start_time).toISOString().slice(0, 16)
//         : "",
//       closing_time: new Date(item.closing_time).toISOString().slice(0, 16),
//       category: item.category,
//       imageFiles: [],
//       min_price: item.min_price ? item.min_price.toString() : "",
//     });
//     window.scrollTo({ top: 0, behavior: "smooth" });
//   };

//   const handleCancel = () => {
//     setEditingId(null);
//     setNewItem({
//       item_name: "",
//       description: "",
//       starting_price: "",
//       bid_increment: "",
//       start_time: "",
//       closing_time: "",
//       category: "",
//       imageFiles: [],
//       min_price: "",
//     });
//     setAlert("");
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setAlert("");

//     const sellerId = Number(localStorage.getItem("userId"));
//     const startPrice = parseFloat(newItem.starting_price);
//     const minPrice = newItem.min_price ? parseFloat(newItem.min_price) : null;
//     const startTime = newItem.start_time
//       ? new Date(newItem.start_time).toISOString()
//       : null;
//     const closingTime = new Date(newItem.closing_time).toISOString();
//     const baseUrl = "http://localhost:8080/auth/auction-items";
//     const url = editingId
//       ? `${baseUrl}/${sellerId}/update`
//       : `${baseUrl}/${sellerId}/upload`;
//     const method = editingId ? "PUT" : "POST";

//     // Validation: Ensure min_price is >= starting_price if provided
//     if (minPrice && minPrice < startPrice) {
//       setAlert(
//         "Minimum price must be greater than or equal to the starting price."
//       );
//       return;
//     }

//     // Validation: Ensure start_time is before closing_time
//     if (startTime && new Date(startTime) >= new Date(closingTime)) {
//       setAlert("Start time must be before closing time.");
//       return;
//     }

//     // Validation: Ensure start_time and closing_time are in the future
//     const now = new Date();
//     if (startTime && new Date(startTime) <= now) {
//       setAlert("Start time must be in the future.");
//       return;
//     }
//     if (new Date(closingTime) <= now) {
//       setAlert("Closing time must be in the future.");
//       return;
//     }

//     // Build FormData
//     const formData = new FormData();
//     if (editingId) {
//       formData.append("auction_id", editingId);
//     }
//     formData.append("seller_id", sellerId);
//     formData.append("item_name", newItem.item_name);
//     formData.append("description", newItem.description);
//     formData.append("starting_price", startPrice);
//     formData.append("current_bid", startPrice);
//     formData.append("bid_increment", parseFloat(newItem.bid_increment));
//     if (startTime) {
//       formData.append("start_time", startTime);
//     }
//     formData.append("closing_time", closingTime);
//     formData.append("category", newItem.category);
//     if (minPrice) {
//       formData.append("min_price", minPrice);
//     }
//     newItem.imageFiles.forEach((file) => {
//       formData.append("images", file);
//     });

//     console.log(
//       `${editingId ? "Updating" : "Uploading"} to ${url}`,
//       Array.from(formData.entries())
//     );

//     try {
//       const res = await fetch(url, {
//         method,
//         body: formData,
//         credentials: "include",
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("token")}`,
//         },
//       });

//       console.log(`Response status: ${res.status}`);
//       console.log(`Response headers:`, res.headers.get("Content-Type"));

//       if (res.status === 403) {
//         setAlert("Permission denied. Please log in again.");
//         return;
//       }
//       if (!res.ok) {
//         const errorText = await res.text();
//         throw new Error(`Status ${res.status}: ${errorText}`);
//       }

//       // Handle cases where response body might be empty
//       let result = {};
//       const contentType = res.headers.get("Content-Type");
//       if (contentType && contentType.includes("application/json")) {
//         result = await res.json();
//       } else {
//         result = { auction_id: editingId || Date.now(), ...newItem };
//       }

//       setAlert(
//         editingId ? "Item updated successfully." : "Item uploaded successfully."
//       );
//       if (editingId) {
//         setItems((prev) =>
//           prev.map((i) =>
//             i.auction_id === editingId ? { ...i, ...result } : i
//           )
//         );
//       } else {
//         setItems((prev) => [...prev, result]);
//       }
//       handleCancel();
//     } catch (err) {
//       console.error("Submit error:", err);
//       setAlert(
//         `${editingId ? "Update failed" : "Upload failed"}: ${err.message}`
//       );
//     }
//   };

//   const now = new Date();
//   const active = items.filter(
//     (i) =>
//       new Date(i.closing_time) > now &&
//       (!i.start_time || new Date(i.start_time) <= now)
//   );
//   const closed = items.filter((i) => new Date(i.closing_time) <= now);

//   // Function to determine the winner for closed auctions
//   const determineWinner = (item) => {
//     const finalBid = parseFloat(item.current_bid);
//     const reservePrice = item.min_price ? parseFloat(item.min_price) : null;

//     if (reservePrice && finalBid < reservePrice) {
//       return "- (Reserve not met)";
//     }

//     return item.buyer_username || "No offers made";
//   };

//   return (
//     <div className="seller-dashboard">
//       <nav className="top-nav">
//         <div className="nav-links seller-pro">
//           <NavLink to={`/NotificationsPage/${myUserId}`}>
//             Notifications{" "}
//             {notifs.length > 0 && (
//               <span className="notif-badge">{notifs.length}</span>
//             )}
//           </NavLink>
//           <NavLink to="/profile">Profile</NavLink>

//         </div>
//       </nav>
//       <h2>{editingId ? "Edit Auction Item" : "Add Auction Item"}</h2>
//       {alert && (
//         <div
//           className={`alert ${alert.includes("success") ? "success" : "error"}`}
//         >
//           {alert}
//         </div>
//       )}

//       <form onSubmit={handleSubmit} className="new-item-form">
//         <input
//           name="item_name"
//           placeholder="Item Name"
//           value={newItem.item_name}
//           onChange={handleChange}
//           required
//         />
//         <textarea
//           name="description"
//           placeholder="Description"
//           value={newItem.description}
//           onChange={handleChange}
//           required
//         />
//         <input
//           name="starting_price"
//           type="number"
//           placeholder="Starting Price"
//           value={newItem.starting_price}
//           onChange={handleChange}
//           required
//         />
//         <input
//           name="bid_increment"
//           type="number"
//           placeholder="Bid Increment"
//           value={newItem.bid_increment}
//           onChange={handleChange}
//           required
//         />
//         <input
//           name="min_price"
//           type="number"
//           placeholder="Minimum Price (Optional)"
//           value={newItem.min_price}
//           onChange={handleChange}
//         />
//         <label>Starting Time:</label>
//         <input
//           name="start_time"
//           type="datetime-local"
//           value={newItem.start_time}
//           onChange={handleChange}
//         />
//         <label>Closing Time:</label>
//         <input
//           name="closing_time"
//           type="datetime-local"
//           value={newItem.closing_time}
//           onChange={handleChange}
//           required
//         />
//         <select
//           name="category"
//           value={newItem.category}
//           onChange={handleChange}
//           required
//         >
//           <option value="">--Select Category--</option>
//           <option value="car">Car</option>
//           <option value="bike">Bike</option>
//           <option value="truck">Truck</option>
//         </select>
//         <div className="file-input-section">
//           <label>Upload Images:</label>
//           <input
//             type="file"
//             multiple
//             accept="image/*"
//             onChange={handleFileChange}
//           />
//           {newItem.imageFiles.length > 0 && (
//             <div className="selected-files">
//               <p>Selected files:</p>
//               <ul>
//                 {newItem.imageFiles.map((file, index) => (
//                   <li key={index}>{file.name}</li>
//                 ))}
//               </ul>
//             </div>
//           )}
//         </div>
//         <div className="form-buttons">
//           <button type="submit">
//             {editingId ? "Update Item" : "Update Item"}
//           </button>
//           {editingId && (
//             <button type="button" onClick={handleCancel}>
//               Cancel
//             </button>
//           )}
//         </div>
//       </form>

//       <h3>Active Auctions</h3>
//       <table className="items-table">
//         <thead>
//           <tr>
//             <th>Item</th>
//             <th>Category</th>
//             <th>Current Bid</th>
//             <th>Minimum Price</th>
//             {/* <th>Start Time</th> */}
//             <th>Closes</th>
//             <th>Images</th>
//           </tr>
//         </thead>
//         <tbody>
//           {active.length > 0 ? (
//             active.map((item) => (
//               <tr key={item.auction_id}>
//                 <td>{item.item_name}</td>
//                 <td>{item.category}</td>
//                 <td>£{item.current_bid || item.starting_price}</td>
//                 <td>
//                   {item.min_price ? `£${item.min_price}` : "No reserve set"}
//                 </td>
//                 {/* <td>{item.start_time ? new Date(item.start_time).toLocaleString() : 'Immediate'}</td> */}
//                 <td>{new Date(item.closing_time).toLocaleString()}</td>
//                 <td>
//                   {Array.isArray(item.images) && item.images.length > 0
//                     ? item.images.map((u, k) => (
//                         <img
//                           key={k}
//                           src={u}
//                           alt={item.item_name}
//                           className="table-image"
//                         />
//                       ))
//                     : "-"}
//                 </td>
//               </tr>
//             ))
//           ) : (
//             <tr>
//               <td colSpan={7}>No active auctions.</td>
//             </tr>
//           )}
//         </tbody>
//       </table>

//       <h3>Closed Auctions</h3>
//       <table className="items-table">
//         <thead>
//           <tr>
//             <th>Item</th>
//             <th>Category</th>
//             <th>Final Bid</th>
//             <th>Minimum Price</th>
//             <th>Start Time</th>
//             <th>Closed</th>
//             <th>Winner</th>
//             <th>Images</th>
//           </tr>
//         </thead>
//         <tbody>
//           {closed.length > 0 ? (
//             closed.map((item) => (
//               <tr key={item.auction_id}>
//                 <td>{item.item_name}</td>
//                 <td>{item.category}</td>
//                 <td>£{item.current_bid || item.starting_price}</td>
//                 <td>
//                   {item.min_price ? `£${item.min_price}` : "No reserve set"}
//                 </td>
//                 <td>
//                   {item.start_time
//                     ? new Date(item.start_time).toLocaleString()
//                     : "Immediate"}
//                 </td>
//                 <td>{new Date(item.closing_time).toLocaleString()}</td>
//                 <td>{determineWinner(item)}</td>
//                 <td>
//                   {Array.isArray(item.images) && item.images.length > 0
//                     ? item.images.map((u, k) => (
//                         <img
//                           key={k}
//                           src={u}
//                           alt={item.item_name}
//                           className="table-image"
//                         />
//                       ))
//                     : "-"}
//                 </td>
//               </tr>
//             ))
//           ) : (
//             <tr>
//               <td colSpan={8}>No closed auctions.</td>
//             </tr>
//           )}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default SellerDashboard;

import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import './SellerDashboardStyle.css';

const SellerDashboard = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [notifs, setNotifs] = useState([]);
  const [newItem, setNewItem] = useState({
    item_name: '',
    description: '',
    starting_price: '',
    bid_increment: '',
    start_time: '',
    closing_time: '',
    category: '',
    imageFiles: [],
    min_price: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [alert, setAlert] = useState('');
  const myUserId = localStorage.getItem("userId");

  // Redirect non-sellers to login
  useEffect(() => {
    if (localStorage.getItem('role') !== 'SELLER') {
      navigate('/login');
    }
  }, [navigate]);

  // Fetch seller's auctions
  useEffect(() => {
    async function loadItems() {
      try {
        const sellerId = localStorage.getItem("userId");
        const res = await fetch(
          `http://localhost:8080/auth/auction-items/summarySeller/${sellerId}`,
          {
            credentials: "include",
            headers: {
              "Authorization": `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();
        console.log('Backend response from /summarySeller:', data);
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
      starting_price: item.starting_price ? item.starting_price.toString() : '',
      bid_increment: item.bid_increment.toString(),
      start_time: item.start_time ? new Date(item.start_time).toISOString().slice(0, 16) : '',
      closing_time: new Date(item.closing_time).toISOString().slice(0, 16),
      category: item.category,
      imageFiles: [],
      min_price: item.min_price ? item.min_price.toString() : '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setEditingId(null);
    setNewItem({
      item_name: '',
      description: '',
      starting_price: '',
      bid_increment: '',
      start_time: '',
      closing_time: '',
      category: '',
      imageFiles: [],
      min_price: '',
    });
    setAlert('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert("");

    const sellerId = Number(localStorage.getItem('userId'));
    const startPrice = newItem.starting_price ? parseFloat(newItem.starting_price) : null;
    const minPrice = newItem.min_price ? parseFloat(newItem.min_price) : null;
    // const startTime = newItem.start_time ? new Date(newItem.start_time).toISOString() : null;
    // const closingTime = new Date(newItem.closing_time).toISOString();

    let startTime = null;
    if (newItem.start_time.trim() !== '') {
      const startDate = new Date(newItem.start_time);
      startDate.setHours(startDate.getHours() - 4);
      startTime = startDate.toISOString();
    }
    const closingDate = new Date(newItem.closing_time);
    closingDate.setHours(closingDate.getHours() - 4);
    const closingTime = closingDate.toISOString();
    const baseUrl = 'http://localhost:8080/auth/auction-items';
    const url = editingId
      ? `${baseUrl}/${sellerId}/update`
      : `${baseUrl}/${sellerId}/upload`;
    const method = editingId ? 'PUT' : 'POST';

    // Validation: Ensure min_price is >= starting_price if both are provided
    if (startPrice !== null && minPrice !== null && minPrice < startPrice) {
      setAlert("Minimum price must be greater than or equal to the starting price.");
      return;
    }

    // Validation: Ensure start_time is before closing_time
    if (startTime && new Date(startTime) >= new Date(closingTime)) {
      setAlert("Start time must be before closing time.");
      return;
    }

    // Validation: Ensure start_time and closing_time are in the future
    const now = new Date();
    if (startTime && new Date(startTime) <= now) {
      setAlert("Start time must be in the future.");
      return;
    }
    // if (new Date(closingTime) <= now) {
    //   setAlert("Closing time must be in the future.");
    //   return;
    // }

    // Build FormData
    const formData = new FormData();
    if (editingId) {
      formData.append('auction_id', editingId);
    }
    formData.append('seller_id', sellerId);
    formData.append('item_name', newItem.item_name);
    formData.append('description', newItem.description);
    if (startPrice !== null) {
      formData.append('starting_price', startPrice);
      formData.append('current_bid', startPrice);
    } else {
      formData.append('current_bid', 0); // Default current_bid if no starting_price
    }
    formData.append('bid_increment', parseFloat(newItem.bid_increment));
    formData.append('start_time', startTime ?? null);
    formData.append('closing_time', closingTime);
    formData.append('category', newItem.category);
    if (minPrice !== null) {
      formData.append('min_price', minPrice);
    }
    newItem.imageFiles.forEach((file) => {
      formData.append('images', file);
    });

    console.log(`${editingId ? 'Updating' : 'Uploading'} to ${url}`, Array.from(formData.entries()));

    try {
      const res = await fetch(url, {
        method,
        body: formData,
        credentials: 'include',
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        }
      });

      console.log(`Response status: ${res.status}`);
      console.log(`Response headers:`, res.headers.get('Content-Type'));

      if (res.status === 403) {
        setAlert("Permission denied. Please log in again.");
        return;
      }
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Status ${res.status}: ${errorText}`);
      }

      let result = {};
      const contentType = res.headers.get('Content-Type');
      if (contentType && contentType.includes('application/json')) {
        result = await res.json();
      } else {
        result = { auction_id: editingId || Date.now(), ...newItem, starting_price: startPrice || 0 };
      }

      setAlert(editingId ? 'Item updated successfully.' : 'Item uploaded successfully.');
      if (editingId) {
        setItems((prev) => prev.map((i) => (i.auction_id === editingId ? { ...i, ...result } : i)));
      } else {
        setItems((prev) => [...prev, result]);
      }
      handleCancel();
    } catch (err) {
      console.error('Submit error:', err);
      setAlert(`${editingId ? 'Update failed' : 'Upload failed'}: ${err.message}`);
    }
  };

  const now = new Date();
  const active = items.filter(
    (i) =>
      new Date(i.closing_time) > now &&
      (!i.start_time || new Date(i.start_time) <= now)
  );
  const closed = items.filter((i) => new Date(i.closing_time) <= now);

  const determineWinner = (item) => {
    const finalBid = parseFloat(item.current_bid);
    const reservePrice = item.min_price ? parseFloat(item.min_price) : null;

    if (reservePrice && finalBid < reservePrice) {
      return '- (Reserve not met)';
    }

    return item.buyer_username || 'No offers made';
  };

  return (
    <div className="seller-dashboard">
      <nav className="top-nav">
        <div className="nav-links seller-pro">
          <NavLink to={`/NotificationsPage/${myUserId}`}>
            Notifications {notifs.length > 0 && <span className="notif-badge">{notifs.length}</span>}
          </NavLink>
          <NavLink to="/profile">
            Profile
          </NavLink>
        </div>
      </nav>
      <h2>{editingId ? 'Edit Auction Item' : 'Add Auction Item'}</h2>
      {alert && <div className={`alert ${alert.includes('success') ? 'success' : 'error'}`}>{alert}</div>}

      <form onSubmit={handleSubmit} className="new-item-form">
        <input
          name="item_name"
          placeholder="Item Name"
          value={newItem.item_name}
          onChange={handleChange}
          required
        />
        <textarea
          name="description"
          placeholder="Description"
          value={newItem.description}
          onChange={handleChange}
          required
        />
        <input
          name="starting_price"
          type="number"
          placeholder="Starting Price (Optional)"
          value={newItem.starting_price}
          onChange={handleChange}
        />
        <input
          name="bid_increment"
          type="number"
          placeholder="Bid Increment"
          value={newItem.bid_increment}
          onChange={handleChange}
          required
        />
        <input
          name="min_price"
          type="number"
          placeholder="Minimum Price (Optional)"
          value={newItem.min_price}
          onChange={handleChange}
        />
        <label>Starting Time (Optional):</label>
        <input
          name="start_time"
          type="datetime-local"
          value={newItem.start_time}
          onChange={handleChange}
        />
        <label>Closing Time:</label>
        <input
          name="closing_time"
          type="datetime-local"
          value={newItem.closing_time}
          onChange={handleChange}
          required
        />
        <select
          name="category"
          value={newItem.category}
          onChange={handleChange}
          required
        >
          <option value="">--Select Category--</option>
          <option value="car">Car</option>
          <option value="bike">Bike</option>
          <option value="truck">Truck</option>
        </select>
        <div className="file-input-section">
          <label>Upload Images:</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
          />
          {newItem.imageFiles.length > 0 && (
            <div className="selected-files">
              <p>Selected files:</p>
              <ul>
                {newItem.imageFiles.map((file, index) => (
                  <li key={index}>{file.name}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="form-buttons">
          <button type="submit">
            {editingId ? 'Update Item' : 'Add Item'}
          </button>
          {editingId && (
            <button type="button" onClick={handleCancel}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <h3>Active Auctions</h3>
      <table className="items-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Category</th>
            <th>Current Bid</th>
            {/* <th>Starting Price</th> */}
            <th>Minimum Price</th>
            <th>Closes</th>
            <th>Images</th>
            {/* <th>Actions</th> */}
          </tr>
        </thead>
        <tbody>
          {active.length > 0 ? (
            active.map((item) => (
              <tr key={item.auction_id}>
                <td>{item.item_name}</td>
                <td>{item.category}</td>
                <td>£{item.current_bid || 0}</td>
                {/* <td>{item.startPrice ? `£${item.starting_price}` : 'Not set'}</td> */}
                <td>{item.min_price ? `£${item.min_price}` : 'No reserve set'}</td>
                <td>{new Date(item.closing_time).toLocaleString()}</td>
                <td>
                  {Array.isArray(item.images) && item.images.length > 0 ? (
                    item.images.map((u, k) => (
                      <img
                        key={k}
                        src={u}
                        alt={item.item_name}
                        className="table-image"
                      />
                    ))
                  ) : (
                    '-'
                  )}
                </td>
                {/* <td>
                  <button onClick={() => handleEdit(item)}>Edit</button>
                </td> */}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={8}>No active auctions.</td>
            </tr>
          )}
        </tbody>
      </table>

      <h3>Closed Auctions</h3>
      <table className="items-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Category</th>
            <th>Final Bid</th>
            {/* <th>Starting Price</th> */}
            <th>Minimum Price</th>
            {/* <th>Start Time</th> */}
            <th>Closed</th>
            <th>Winner</th>
            <th>Images</th>
          </tr>
        </thead>
        <tbody>
          {closed.length > 0 ? (
            closed.map((item) => (
              <tr key={item.auction_id}>
                <td>{item.item_name}</td>
                <td>{item.category}</td>
                <td>£{item.current_bid || 0}</td>
                {/* <td>{item.startingPrice ? `£${item.starting_price}` : 'Not set'}</td> */}
                <td>{item.min_price ? `£${item.min_price}` : 'No reserve set'}</td>
                {/* <td>{item.start_time ? new Date(item.start_time).toLocaleString() : 'Immediate'}</td> */}
                <td>{new Date(item.closing_time).toLocaleString()}</td>
                <td>{determineWinner(item)}</td>
                <td>
                  {Array.isArray(item.images) && item.images.length > 0 ? (
                    item.images.map((u, k) => (
                      <img
                        key={k}
                        src={u}
                        alt={item.item_name}
                        className="table-image"
                      />
                    ))
                  ) : (
                    '-'
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={9}>No closed auctions.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SellerDashboard;
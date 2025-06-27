// // src/pages/SummaryPage.jsx

// import React, { useEffect, useState } from "react";
// import { NavLink, useNavigate } from "react-router-dom";
// import "./CategoryPage.css";

// export default function SummaryPage({ addToCart }) {
//   const [auctions, setAuctions] = useState([]);
//   const [notifs, setNotifs] = useState([]);
//   const [alert, setAlert] = useState("");
//   const [searchTerm, setSearchTerm] = useState("");
//   const navigate = useNavigate();
//   const myUserId = localStorage.getItem("userId");

//   // 1. Auth guard
//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     const role = localStorage.getItem("role");
//     if (!token || role !== "BUYER") {
//       console.log("Invalid token or role, redirecting to login");
//       navigate("/");
//     }
//   }, [navigate]);

//   // 2. Fetch all auctions
//   useEffect(() => {
//     const fetchAuctions = async () => {
//       try {
//         const token = localStorage.getItem("token");
//         const res = await fetch(
//           "http://localhost:8080/auth/auction-items/summary",
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//             credentials: "include",
//           }
//         );
//         if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
//         const data = await res.json();
//         setAuctions(data);
//       } catch (err) {
//         console.error("Fetch error:", err);
//         setAlert("Failed to load auctions.");
//       }
//     };
//     fetchAuctions();
//   }, []);

//   // 3. Fetch notifications
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
//           setNotifs(await res.json());
//         }
//       } catch (err) {
//         console.error("Error fetching notifications:", err);
//       }
//     };
//     //     if (res.ok) {
//     //       const data = await res.json();
//     //       setNotifs(data);
//     //     } else {
//     //       console.error("Failed to load notifications:", res.status);
//     //     }
//     //   } catch (err) {
//     //     console.error("Error fetching notifications:", err);
//     //   }
//     // };
//     fetchNotifs();
//     const intervalId = setInterval(fetchNotifs, 30000);
//     return () => clearInterval(intervalId);
//   }, [myUserId, navigate]);

//   // 4. Mark notification as read (not shown here, but kept for future use)
//   const markRead = async (id) => {
//     try {
//       const res = await fetch(
//         `http://localhost:8080/auth/notifications/${id}/read`,
//         {
//           method: "POST",
//           credentials: "include",
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         }
//       );
//       if (res.ok) {
//         setNotifs((prev) => prev.filter((n) => n.id !== id));
//       } else {
//         console.error("Failed to mark notification read:", res.status);
//       }
//     } catch (err) {
//       console.error("Error marking notification read:", err);
//     }
//   };

//   // 5. Subscribe for start notifications
//   // const notifyMe = async (auctionId) => {
//   //   console.log("Notifying for buyerId:", myUserId, "auctionId:", auctionId);
//   //   try {
//   //     const token = localStorage.getItem("token");
//   //     console.log("Token used for request:", token);
//   //     if (!token) {
//   //       setAlert("Please log in to subscribe to notifications.");
//   //       return;
//   //     }

//   //     const res = await fetch(
//   //       `http://localhost:8080/auth/auction-items/${myUserId}/${auctionId}/notify`,
//   //       {
//   //         method: "POST",
//   //         credentials: "include",
//   //         headers: {
//   //           Authorization: `Bearer ${token}`,
//   //         },
//   //       }
//   //     );
//   //     const errorText = await res.text();
//   //     if (res.ok) {
//   //       console.log("Notification subscription successful");
//   //       setAlert("Notification set");
//   //     } else {
//   //       console.error("Response status:", res.status);
//   //       console.error("Response headers:", [...res.headers.entries()]);
//   //       console.error("Response body:", errorText);
//   //       console.error(
//   //         `Failed to subscribe to notification: ${res.status} ${errorText}`
//   //       );
//   //       setAlert("Notification set");
//   //     }
//   //   } catch (err) {
//   //     console.error("Error subscribing to notification:", err);
//   //     setAlert("Notification set");
//   //   }
//   // };

//   // 5. Subscribe for start notifications
//   const notifyMe = async (auctionId) => {
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) {
//         setAlert("Please log in to subscribe.");
//         return;
//       }
//       await fetch(
//         `http://localhost:8080/auth/auction-items/${myUserId}/${auctionId}/notify`,
//         {
//           method: "POST",
//           credentials: "include",
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
//       setAlert("Notification set");
//     } catch (err) {
//       console.error("Error subscribing to notification:", err);
//       setAlert("Notification set");
//     }
//   };

//   // const getImageUrl = (item) => {
//   //   if (item.images) {
//   //     if (Array.isArray(item.images) && typeof item.images[0] === "string") {
//   //       return item.images[0];
//   //     }
//   //     if (
//   //       Array.isArray(item.images) &&
//   //       item.images[0] &&
//   //       (item.images[0].url || item.images[0].src)
//   //     ) {
//   //       return item.images[0].url || item.images[0].src;
//   //     }
//   //   }
//   //   if (item.imageUrl) return item.imageUrl;
//   //   if (item.image) return item.image;
//   //   return "https://via.placeholder.com/300x200?text=No+Image";
//   // };

//   // const now = new Date();
//   // const running = auctions.filter(
//   //   (a) =>
//   //     new Date(a.closingTime) > now &&
//   //     (!a.startTime || new Date(a.startTime) <= now)
//   // );
//   // const upcoming = auctions.filter(
//   //   (a) => a.startTime && new Date(a.startTime) > now
//   // );

//   // const byCategoryRunning = running.reduce((acc, item) => {
//   //   const cat = item.category || "Uncategorized";
//   //   acc[cat] = acc[cat] || [];
//   //   acc[cat].push(item);
//   //   return acc;
//   // }, {});

//   // const byCategoryUpcoming = upcoming.reduce((acc, item) => {
//   //   const cat = item.category || "Uncategorized";
//   //   acc[cat] = acc[cat] || [];
//   //   acc[cat].push(item);
//   //   return acc;
//   // }, {});
//   // 6. Helper to pick an image
//   const getImageUrl = (item) => {
//     if (item.images?.length) {
//       const img = item.images[0];
//       return typeof img === "string" ? img : img.url || img.src;
//     }
//     return (
//       item.imageUrl ||
//       item.image ||
//       "https://via.placeholder.com/300x200?text=No+Image"
//     );
//   };

//   // // 7. Partition upcoming vs running
//   // const now = new Date();
//   // const upcoming = auctions.filter(
//   //   (a) => a.startTime && new Date(a.startTime) > now
//   // );
//   // const running = auctions.filter(
//   //   (a) =>
//   //     new Date(a.closingTime) > now &&
//   //     (!a.startTime || new Date(a.startTime) <= now)
//   // );

//   // // 8. Apply search filter
//   // const filteredUpcoming = upcoming.filter((a) =>
//   //   a.itemName.toLowerCase().includes(searchTerm.toLowerCase())
//   // );
//   // const filteredRunning = running.filter((a) =>
//   //   a.itemName.toLowerCase().includes(searchTerm.toLowerCase())
//   // );
//   // 7. Partition upcoming vs running
//   const now = new Date();
//   const upcoming = auctions.filter(
//     (a) => a.startTime && new Date(a.startTime) > now
//   );
//   const running = auctions.filter(
//     (a) =>
//       new Date(a.closingTime) > now &&
//       (!a.startTime || new Date(a.startTime) <= now)
//   );

//   // 8. Apply search filter
//   const filteredUpcoming = upcoming.filter((a) =>
//     a.itemName.toLowerCase().includes(searchTerm.toLowerCase())
//   );
//   const filteredRunning = running.filter((a) =>
//     a.itemName.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   // // 9. Group by category
//   // const groupByCategory = (list) =>
//   //   list.reduce((acc, i) => {
//   //     const cat = i.category || "Uncategorized";
//   //     (acc[cat] = acc[cat] || []).push(i);
//   //     return acc;
//   //   }, {});

//   // const byCategoryUpcoming = groupByCategory(filteredUpcoming);
//   // const byCategoryRunning = groupByCategory(filteredRunning);

//   // 9. Group by category
//   const groupByCategory = (list) =>
//     list.reduce((acc, i) => {
//       const cat = i.category || "Uncategorized";
//       (acc[cat] = acc[cat] || []).push(i);
//       return acc;
//     }, {});

//   const byCategoryUpcoming = groupByCategory(filteredUpcoming);
//   const byCategoryRunning = groupByCategory(filteredRunning);

//   return (
//     <div>
//       <nav className="top-nav">
//         <div className="logo">VEHICLE SHOP</div>
//         <div className="nav-links">
//           <NavLink to="/summary">Home</NavLink>
//           <NavLink to="/summary/car">Car</NavLink>
//           <NavLink to="/summary/bike">Bike</NavLink>
//           <NavLink to="/summary/truck">Truck</NavLink>

//           {/* Search */}
//           <input
//             type="text"
//             placeholder="Search items..."
//             className="search-bar"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />

//           <NavLink to={`/NotificationsPage/${myUserId}`}>
//             Notifications{" "}
//             {notifs.length > 0 && (
//               <span className="notif-badge">{notifs.length}</span>
//             )}
//           </NavLink>
//           <NavLink to="/profile">Profile</NavLink>
//           <NavLink to="/cart">Cart</NavLink>
//         </div>
//       </nav>

//       {/* {alert && (
//         <div
//           className={`alert ${
//             alert.includes("Failed") || alert.includes("Error")
//               ? "error"
//               : "success"
//           }`}
//         >
//           {alert}
//         </div>
//       )} */}

//       {/* Alerts */}
//       {alert && (
//         <div
//           className={`alert ${alert.includes("Failed") ? "error" : "success"}`}
//         >
//           {alert}
//         </div>
//       )}

//       {/*
//       <h4 className="title-auction">Upcoming Auctions</h4>

//       {upcoming.length === 0 ? (
//         <p>No upcoming auctions are scheduled.</p>
//       ) : (
//         Object.entries(byCategoryUpcoming).map(([cat, items]) => (
//           <section key={cat}>
//             <div className="item-list">
//               {items.map((item) => (
//                 <div className="card" key={item.auctionId}>
//                   <img
//                     className="card-img"
//                     src={getImageUrl(item)}
//                     alt={item.itemName}
//                   /> */}

//       {/* Upcoming Auctions */}
//       <h4 className="title-auction">
//         Upcoming Auctions {searchTerm && `matching “${searchTerm}”`}
//       </h4>
//       {filteredUpcoming.length === 0 ? (
//         <p>No upcoming auctions{searchTerm ? ` match “${searchTerm}”` : "."}</p>
//       ) : (
//         Object.entries(byCategoryUpcoming).map(([cat, items]) => (
//           <section key={cat}>
//             {/* <h5>{cat}</h5> */}
//             <div className="item-list">
//               {items.map((item) => (
//                 <div className="card" key={item.auctionId}>
//                   <img
//                     className="card-img"
//                     src={getImageUrl(item)}
//                     alt={item.itemName}
//                   />
//                   <div className="card-body">
//                     <h2>{item.itemName}</h2>
//                     <p className="card-desc">{item.description}</p>
//                     <div className="card-info">
//                       <span>Starting Price: £{item.currentBid}</span>
//                       <span>Category: {item.category}</span>
//                     </div>
//                     <div className="card-footer">
//                       <span>
//                         Starts: {new Date(item.startTime).toLocaleString()}
//                       </span>
//                       <button
//                         className="notify-me"
//                         onClick={() => notifyMe(item.auctionId)}
//                       >
//                         NOTIFY ME
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </section>
//         ))
//       )}

//       {/* <h4 className="title-auction">All Running Auctions</h4>

//       {running.length === 0 ? (
//         <p>No auctions are currently running.</p>
//       ) : (
//         Object.entries(byCategoryRunning).map(([cat, items]) => (
//           <section key={cat}>
//             <div className="item-list">
//               {items.map((item) => (
//                 <div className="card" key={item.auctionId}>
//                   <img
//                     className="card-img"
//                     src={getImageUrl(item)}
//                     alt={item.itemName}
//                   /> */}
//       {/* Running Auctions */}
//       <h4 className="title-auction">
//         All Running Auctions {searchTerm && `matching “${searchTerm}”`}
//       </h4>
//       {filteredRunning.length === 0 ? (
//         <p>No running auctions{searchTerm ? ` match “${searchTerm}”` : "."}</p>
//       ) : (
//         Object.entries(byCategoryRunning).map(([cat, items]) => (
//           <section key={cat}>
//             {/* <h5>{cat}</h5> */}
//             <div className="item-list">
//               {items.map((item) => (
//                 <div className="card" key={item.auctionId}>
//                   <img
//                     className="card-img"
//                     src={getImageUrl(item)}
//                     alt={item.itemName}
//                   />
//                   <div className="card-body">
//                     <h2>{item.itemName}</h2>
//                     <p className="card-desc">{item.description}</p>
//                     <div className="card-info">
//                       <span>
//                         Current Bid: £
//                         {item.currentBid !== undefined
//                           ? item.currentBid
//                           : item.starting_price}
//                       </span>
//                       <span>Category: {item.category}</span>
//                     </div>

//                     <div className="card-footer">
//                       <span>
//                         Closing: {new Date(item.closingTime).toLocaleString()}
//                       </span>
//                       <div>
//                         <button
//                           className="view-deal"
//                           onClick={() =>
//                             navigate(
//                               `/summary/${item.category}/${
//                                 item.auction_id || item.id
//                               }`
//                             )
//                           }
//                         >
//                           VIEW DEAL
//                         </button>
//                         <button
//                           className="qa-button"
//                           onClick={() =>
//                             navigate(`/questions/${item.auction_id}`)
//                           }
//                         >
//                           Q&A
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </section>
//         ))
//       )}
//     </div>
//   );
// }
// // import React, { useEffect, useState } from "react";
// // import { NavLink, useNavigate } from "react-router-dom";
// // import "./CategoryPage.css";

// // export default function SummaryPage({ addToCart }) {
// //   const [auctions, setAuctions] = useState([]);
// //   const [notifs, setNotifs] = useState([]); // State for notifications
// //   const [alert, setAlert] = useState(""); // State for success/error messages
// //   const navigate = useNavigate();

// //   const myUserId = localStorage.getItem("userId");

// //   // Check if user is logged in
// //   useEffect(() => {
// //     const token = localStorage.getItem("token");
// //     if (!token) {
// //       navigate("/");
// //     }
// //   }, [navigate]);

// //   // Load all auctions
// //   useEffect(() => {
// //     const fetchAuctions = async () => {
// //       try {
// //         const token = localStorage.getItem("token");
// //         const res = await fetch(
// //           "http://localhost:8080/auth/auction-items/summary",
// //           {
// //             headers: {
// //               Authorization: `Bearer ${token}`,
// //             },
// //             credentials: "include",
// //           }
// //         );
// //         if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
// //         const data = await res.json();
// //         setAuctions(data);
// //       } catch (err) {
// //         console.error("Fetch error:", err);
// //         setAlert("Failed to load auctions.");
// //       }
// //     };
// //     fetchAuctions();
// //   }, []);

// //   // Fetch notifications
// //   useEffect(() => {
// //     if (!myUserId) {
// //       navigate("/login");
// //       return;
// //     }

// //     const fetchNotifs = async () => {
// //       try {
// //         const res = await fetch(
// //           `http://localhost:8080/auth/notifications?userId=${myUserId}`,
// //           {
// //             credentials: "include",
// //             headers: {
// //               Authorization: `Bearer ${localStorage.getItem("token")}`,
// //             },
// //           }
// //         );
// //         if (res.ok) {
// //           const data = await res.json();
// //           setNotifs(data);
// //         } else {
// //           console.error("Failed to load notifications:", res.status);
// //         }
// //       } catch (err) {
// //         console.error("Error fetching notifications:", err);
// //       }
// //     };

// //     fetchNotifs();
// //     // Poll every 30 seconds
// //     const intervalId = setInterval(fetchNotifs, 30000);
// //     return () => clearInterval(intervalId);
// //   }, [myUserId, navigate]);

// //   // Mark notification as read
// //   const markRead = async (id) => {
// //     try {
// //       const res = await fetch(
// //         `http://localhost:8080/auth/notifications/${id}/read`,
// //         {
// //           method: "POST",
// //           credentials: "include",
// //           headers: {
// //             Authorization: `Bearer ${localStorage.getItem("token")}`,
// //           },
// //         }
// //       );
// //       if (res.ok) {
// //         setNotifs((prev) => prev.filter((n) => n.id !== id));
// //       } else {
// //         console.error("Failed to mark notification read:", res.status);
// //       }
// //     } catch (err) {
// //       console.error("Error marking notification read:", err);
// //     }
// //   };

// //   // Notify me when auction starts
// //   const notifyMe = async (auctionId) => {
// //     try {
// //       const res = await fetch(
// //         `http://localhost:8080/auth/notifications/subscribe`,
// //         {
// //           method: "POST",
// //           credentials: "include",
// //           headers: {
// //             Authorization: `Bearer ${localStorage.getItem("token")}`,
// //             "Content-Type": "application/json",
// //           },
// //           body: JSON.stringify({
// //             userId: myUserId,
// //             auctionId: auctionId,
// //             event: "auction_start", // Indicate we want to be notified when the auction starts
// //           }),
// //         }
// //       );
// //       if (res.ok) {
// //         setAlert("You will be notified when this auction starts!");
// //       } else {
// //         const errorText = await res.text();
// //         setAlert(`Failed to subscribe to notification: ${errorText}`);
// //       }
// //     } catch (err) {
// //       console.error("Error subscribing to notification:", err);
// //       setAlert("Error subscribing to notification.");
// //     }
// //   };

// //   const getImageUrl = (item) => {
// //     if (item.images) {
// //       if (Array.isArray(item.images) && typeof item.images[0] === "string") {
// //         return item.images[0];
// //       }
// //       if (
// //         Array.isArray(item.images) &&
// //         item.images[0] &&
// //         (item.images[0].url || item.images[0].src)
// //       ) {
// //         return item.images[0].url || item.images[0].src;
// //       }
// //     }
// //     if (item.imageUrl) return item.imageUrl;
// //     if (item.image) return item.image;
// //     return "https://via.placeholder.com/300x200?text=No+Image";
// //   };

// //   const now = new Date();
// //   // Running auctions: closingTime is in the future and startTime is in the past or null
// //   const running = auctions.filter(
// //     (a) =>
// //       new Date(a.closingTime) > now &&
// //       (!a.startTime || new Date(a.startTime) <= now)
// //   );
// //   // Upcoming auctions: startTime is in the future
// //   const upcoming = auctions.filter(
// //     (a) => a.startTime && new Date(a.startTime) > now
// //   );

// //   const byCategoryRunning = running.reduce((acc, item) => {
// //     const cat = item.category || "Uncategorized";
// //     acc[cat] = acc[cat] || [];
// //     acc[cat].push(item);
// //     return acc;
// //   }, {});

// //   const byCategoryUpcoming = upcoming.reduce((acc, item) => {
// //     const cat = item.category || "Uncategorized";
// //     acc[cat] = acc[cat] || [];
// //     acc[cat].push(item);
// //     return acc;
// //   }, {});

// //   return (
// //     <div>
// //       <nav className="top-nav">
// //         <div className="logo">VEHICLE SHOP</div>
// //         <div className="nav-links">
// //           <NavLink to="/summary">Home</NavLink>
// //           <NavLink to="/summary/car">Car</NavLink>
// //           <NavLink to="/summary/bike">Bike</NavLink>
// //           <NavLink to="/summary/truck">Truck</NavLink>
// //           <input type="text" placeholder="Search..." className="search-bar" />
// //           <NavLink to={`/NotificationsPage/${myUserId}`}>
// //             Notifications{" "}
// //             {notifs.length > 0 && (
// //               <span className="notif-badge">{notifs.length}</span>
// //             )}
// //           </NavLink>
// //           <NavLink to="/profile">Profile</NavLink>
// //           <NavLink to="/cart">Cart</NavLink>
// //         </div>
// //       </nav>

// //       {alert && (
// //         <div
// //           className={`alert ${
// //             alert.includes("Failed") || alert.includes("Error")
// //               ? "error"
// //               : "success"
// //           }`}
// //         >
// //           {alert}
// //         </div>
// //       )}

// //       <h4 className="title-auction">Upcoming Auctions</h4>

// //       {upcoming.length === 0 ? (
// //         <p>No upcoming auctions are scheduled.</p>
// //       ) : (
// //         Object.entries(byCategoryUpcoming).map(([cat, items]) => (
// //           <section key={cat}>
// //             <div className="item-list">
// //               {items.map((item) => (
// //                 <div className="card" key={item.auctionId}>
// //                   <img
// //                     className="card-img"
// //                     src={getImageUrl(item)}
// //                     alt={item.itemName}
// //                   />
// //                   <div className="card-body">
// //                     <h2>{item.itemName}</h2>
// //                     <p className="card-desc">{item.description}</p>
// //                     <div className="card-info">
// //                       <span>Starting Price: £{item.currentBid}</span>
// //                       <span>Category: {item.category}</span>
// //                     </div>

// //                     <div className="card-footer">
// //                       <span>
// //                         Starts: {new Date(item.startTime).toLocaleString()}
// //                       </span>
// //                       <button
// //                         className="notify-me"
// //                         onClick={() => notifyMe(item.auctionId)}
// //                       >
// //                         NOTIFY ME
// //                       </button>
// //                     </div>
// //                   </div>
// //                 </div>
// //               ))}
// //             </div>
// //           </section>
// //         ))
// //       )}

// //       <h4 className="title-auction">All Running Auctions</h4>

// //       {running.length === 0 ? (
// //         <p>No auctions are currently running.</p>
// //       ) : (
// //         Object.entries(byCategoryRunning).map(([cat, items]) => (
// //           <section key={cat}>
// //             <div className="item-list">
// //               {items.map((item) => (
// //                 <div className="card" key={item.auctionId}>
// //                   <img
// //                     className="card-img"
// //                     src={getImageUrl(item)}
// //                     alt={item.itemName}
// //                   />
// //                   <div className="card-body">
// //                     <h2>{item.itemName}</h2>
// //                     <p className="card-desc">{item.description}</p>
// //                     <div className="card-info">
// //                       <span>
// //                         Current Bid: £
// //                         {item.currentBid !== undefined
// //                           ? item.currentBid
// //                           : item.starting_price}
// //                       </span>
// //                       <span>Category: {item.category}</span>
// //                     </div>

// //                     <div className="card-footer">
// //                       <span>
// //                         Closing: {new Date(item.closingTime).toLocaleString()}
// //                       </span>
// //                       <div>
// //                         <button
// //                           className="view-deal"
// //                           onClick={() =>
// //                             navigate(
// //                               `/summary/${item.category}/${item.auction_id}`
// //                             )
// //                           }
// //                         >
// //                           VIEW DEAL
// //                         </button>
// //                         <button
// //                           className="qa-button"
// //                           // onClick={() =>
// //                           //   navigate(`/questions/${item.auctionId || item.id}`)
// //                           // }
// //                           onClick={() =>
// //                             navigate(
// //                               `/questions/${
// //                                 item.auctionId || item.auction_id || item.id
// //                               }`
// //                             )
// //                           }
// //                         >
// //                           Q&A
// //                         </button>
// //                       </div>
// //                     </div>
// //                   </div>
// //                 </div>
// //               ))}
// //             </div>
// //           </section>
// //         ))
// //       )}

// //       {/* <h1>Upcoming Auctions</h1>

// //       {upcoming.length === 0 ? (
// //         <p>No upcoming auctions are scheduled.</p>
// //       ) : (
// //         Object.entries(byCategoryUpcoming).map(([cat, items]) => (
// //           <section key={cat}>
// //             <div className="item-list">
// //               {items.map((item) => (
// //                 <div className="card" key={item.auctionId}>
// //                   <img
// //                     className="card-img"
// //                     src={getImageUrl(item)}
// //                     alt={item.itemName}
// //                   />
// //                   <div className="card-body">
// //                     <h2>{item.itemName}</h2>
// //                     <p className="card-desc">{item.description}</p>
// //                     <div className="card-info">
// //                       <span>
// //                         Starting Price: £{item.currentBid}
// //                       </span>
// //                       <span>Category: {item.category}</span>
// //                     </div>

// //                     <div className="card-footer">
// //                       <span>
// //                         Starts: {new Date(item.startTime).toLocaleString()}
// //                       </span>
// //                       <button
// //                         className="notify-me"
// //                         onClick={() => notifyMe(item.auctionId)}
// //                       >
// //                         NOTIFY ME
// //                       </button>
// //                     </div>
// //                   </div>
// //                 </div>
// //               ))}
// //             </div>
// //           </section>
// //         ))
// //       )} */}
// //     </div>
// //   );
// // }
// // import React, { useEffect, useState } from "react";
// // import { NavLink, useNavigate } from "react-router-dom";
// // import "./CategoryPage.css";

// // export default function SummaryPage({ addToCart }) {
// //   const [auctions, setAuctions] = useState([]);
// //   const navigate = useNavigate();

// //   // Check if user is logged in
// //   useEffect(() => {
// //     const token = localStorage.getItem("token");
// //     if (!token) {
// //       navigate("/");
// //     }
// //   }, [navigate]);

// //   // Load all auctions
// //   useEffect(() => {
// //     const fetchAuctions = async () => {
// //       try {
// //         const token = localStorage.getItem("token");
// //         const res = await fetch(
// //           "http://localhost:8080/auth/auction-items/summary",
// //           {
// //             headers: {
// //               Authorization: `Bearer ${token}`,
// //             },
// //           }
// //         );
// //         if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
// //         const data = await res.json();
// //         setAuctions(data);
// //       } catch (err) {
// //         console.error("Fetch error:", err);
// //       }
// //     };
// //     fetchAuctions();
// //   }, []);

// //   const getImageUrl = (item) => {
// //     if (item.images) {
// //       if (Array.isArray(item.images) && typeof item.images[0] === "string") {
// //         return item.images[0];
// //       }
// //       if (
// //         Array.isArray(item.images) &&
// //         item.images[0] &&
// //         (item.images[0].url || item.images[0].src)
// //       ) {
// //         return item.images[0].url || item.images[0].src;
// //       }
// //     }
// //     if (item.imageUrl) return item.imageUrl;
// //     if (item.image) return item.image;
// //     return "https://via.placeholder.com/300x200?text=No+Image";
// //   };

// //   const now = new Date();
// //   const running = auctions.filter(
// //     (a) => new Date(a.closingTime || a.closing_time) > now
// //   );

// //   const byCategory = running.reduce((acc, item) => {
// //     const cat = item.category || "Uncategorized";
// //     acc[cat] = acc[cat] || [];
// //     acc[cat].push(item);
// //     return acc;
// //   }, {});

// //   return (
// //     <div>
// //       <nav className="top-nav">
// //         <div className="logo">VEHICLE SHOP</div>
// //         <div className="nav-links">
// //           <NavLink to="/summary">Home</NavLink>
// //           <NavLink to="/summary/car">Car</NavLink>
// //           <NavLink to="/summary/bike">Bike</NavLink>
// //           <NavLink to="/summary/truck">Truck</NavLink>
// //           <input type="text" placeholder="Search..." className="search-bar" />
// //           <NavLink to="/NotificationsPage">Notifications</NavLink>
// //           <NavLink to="/profile">Profile</NavLink>
// //           <NavLink to="/cart">Cart</NavLink>
// //         </div>
// //       </nav>

// //       <h1>All Running Auctions</h1>

// //       {running.length === 0 ? (
// //         <p>No auctions are currently running.</p>
// //       ) : (
// //         Object.entries(byCategory).map(([cat, items]) => (
// //           <section key={cat}>
// //             <div className="item-list">
// //               {items.map((item) => (
// //                 <div className="card" key={item.auctionId || item.id}>
// //                   <img
// //                     className="card-img"
// //                     src={getImageUrl(item)}
// //                     alt={item.itemName || item.item_name}
// //                   />
// //                   <div className="card-body">
// //                     <h2>{item.itemName || item.item_name}</h2>
// //                     <p className="card-desc">{item.description}</p>
// //                     <div className="card-info">
// //                       <span>
// //                         Current Bid: £
// //                         {item.currentBid !== undefined
// //                           ? item.currentBid
// //                           : item.starting_price}
// //                       </span>
// //                       <span>Category: {item.category}</span>
// //                     </div>

// //                     <div className="card-footer">
// //                       <span>
// //                         Closing:{" "}
// //                         {new Date(
// //                           item.closingTime || item.closing_time
// //                         ).toLocaleString()}
// //                       </span>
// //                       <div>
// //                         <button
// //                           className="view-deal"
// //                           onClick={() =>
// //                             navigate(
// //                               `/summary/${item.category}/${
// //                                 item.auctionId || item.id
// //                               }`
// //                             )
// //                           }
// //                         >
// //                           VIEW DEAL
// //                         </button>
// //                         <button
// //                           className="qa-button"
// //                           onClick={() =>
// //                             navigate(
// //                               // `/getallquessans/${item.auction_id || item.id}`
// //                               `/questions/${item.auctionId || item.id}`
// //                             )
// //                           }
// //                         >
// //                           Q&A
// //                         </button>
// //                       </div>
// //                     </div>
// //                   </div>
// //                 </div>
// //               ))}
// //             </div>
// //           </section>
// //         ))
// //       )}
// //     </div>
// //   );
// // }
// // import React, { useEffect, useState } from "react";
// // import { NavLink, useNavigate } from "react-router-dom";
// // import "./CategoryPage.css";

// // export default function SummaryPage({ addToCart }) {
// //   const [auctions, setAuctions] = useState([]);
// //   const navigate = useNavigate();

// //   // Check if user is logged in
// //   useEffect(() => {
// //     const token = localStorage.getItem("token");
// //     if (!token) {
// //       navigate("/");
// //     }
// //   }, [navigate]);

// //   // Load all auctions
// //   useEffect(() => {
// //     const fetchAuctions = async () => {
// //       try {
// //         const token = localStorage.getItem("token");
// //         const res = await fetch(
// //           "http://localhost:8080/auth/auction-items/summary",
// //           {
// //             headers: {
// //               Authorization: `Bearer ${token}`,
// //             },
// //           }
// //         );
// //         if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
// //         const data = await res.json();
// //         setAuctions(data);
// //       } catch (err) {
// //         console.error("Fetch error:", err);
// //       }
// //     };
// //     fetchAuctions();
// //   }, []);

// //   const getImageUrl = (item) => {
// //     if (item.images) {
// //       if (Array.isArray(item.images) && typeof item.images[0] === "string") {
// //         return item.images[0];
// //       }
// //       if (
// //         Array.isArray(item.images) &&
// //         item.images[0] &&
// //         (item.images[0].url || item.images[0].src)
// //       ) {
// //         return item.images[0].url || item.images[0].src;
// //       }
// //     }
// //     if (item.imageUrl) return item.imageUrl;
// //     if (item.image) return item.image;
// //     return "https://via.placeholder.com/300x200?text=No+Image";
// //   };

// //   const now = new Date();
// //   const running = auctions.filter(
// //     (a) => new Date(a.closingTime || a.closing_time) > now
// //   );

// //   const byCategory = running.reduce((acc, item) => {
// //     const cat = item.category || "Uncategorized";
// //     acc[cat] = acc[cat] || [];
// //     acc[cat].push(item);
// //     return acc;
// //   }, {});

// //   return (
// //     <div>
// //       <nav className="top-nav">
// //         <div className="logo">VEHICLE SHOP</div>
// //         <div className="nav-links">
// //           <NavLink to="/summary">Home</NavLink>
// //           <NavLink to="/summary/car">Car</NavLink>
// //           <NavLink to="/summary/bike">Bike</NavLink>
// //           <NavLink to="/summary/truck">Truck</NavLink>
// //           <input type="text" placeholder="Search..." className="search-bar" />
// //           <NavLink to="/NotificationsPage">Notifications</NavLink>
// //           <NavLink to="/profile">Profile</NavLink>
// //           <NavLink to="/cart">Cart</NavLink>
// //         </div>
// //       </nav>

// //       <h1>All Running Auctions</h1>

// //       {running.length === 0 ? (
// //         <p>No auctions are currently running.</p>
// //       ) : (
// //         Object.entries(byCategory).map(([cat, items]) => (
// //           <section key={cat}>
// //             <div className="item-list">
// //               {items.map((item) => (
// //                 <div className="card" key={item.auctionId || item.id}>
// //                   <img
// //                     className="card-img"
// //                     src={getImageUrl(item)}
// //                     alt={item.itemName || item.item_name}
// //                   />
// //                   <div className="card-body">
// //                     <h2>{item.itemName || item.item_name}</h2>
// //                     <p className="card-desc">{item.description}</p>
// //                     <div className="card-info">
// //                       <span>
// //                         Current Bid: £{item.currentBid !== undefined ? item.currentBid : item.starting_price}
// //                       </span>
// //                       <span>Category: {item.category}</span>
// //                     </div>

// //                     <div className="card-footer">
// //                       <span>
// //                         Closing:{" "}
// //                         {new Date(
// //                           item.closingTime || item.closing_time
// //                         ).toLocaleString()}
// //                       </span>
// //                       <button
// //                         className="view-deal"
// //                         onClick={() =>
// //                           navigate(
// //                             `/summary/${item.category}/${item.auctionId || item.id
// //                             }`
// //                           )
// //                         }
// //                       >
// //                         VIEW DEAL
// //                       </button>
// //                     </div>
// //                   </div>
// //                 </div>
// //               ))}
// //             </div>
// //           </section>
// //         ))
// //       )}
// //     </div>
// //   );
// // }

// import React, { useEffect, useState } from "react";
// import { NavLink, useNavigate } from "react-router-dom";
// import "./CategoryPage.css";

// export default function SummaryPage({ addToCart }) {
//   const [auctions, setAuctions] = useState([]);
//   const [notifs, setNotifs] = useState([]);
//   const [alert, setAlert] = useState("");
//   const [searchTerm, setSearchTerm] = useState("");
//   const navigate = useNavigate();
//   const myUserId = localStorage.getItem("userId");

//   // 1. Auth guard
//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     const role = localStorage.getItem("role");
//     if (!token || role !== "BUYER") {
//       console.log("Invalid token or role, redirecting to login");
//       navigate("/");
//     }
//   }, [navigate]);

//   // 2. Fetch all auctions
//   useEffect(() => {
//     const fetchAuctions = async () => {
//       try {
//         const token = localStorage.getItem("token");
//         const res = await fetch(
//           "http://localhost:8080/auth/auction-items/summary",
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//             credentials: "include",
//           }
//         );
//         if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
//         const data = await res.json();
//         console.log("Fetched auctions in SummaryPage:", data); // Log the fetched data
//         setAuctions(data);
//       } catch (err) {
//         console.error("Fetch error:", err);
//         setAlert("Failed to load auctions.");
//       }
//     };
//     fetchAuctions();
//   }, []);

//   // 3. Fetch notifications
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
//           setNotifs(await res.json());
//         }
//       } catch (err) {
//         console.error("Error fetching notifications:", err);
//       }
//     };
//     fetchNotifs();
//     const intervalId = setInterval(fetchNotifs, 30000);
//     return () => clearInterval(intervalId);
//   }, [myUserId, navigate]);

//   const markRead = async (id) => {
//     try {
//       const res = await fetch(
//         `http://localhost:8080/auth/notifications/${id}/read`,
//         {
//           method: "POST",
//           credentials: "include",
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         }
//       );
//       if (res.ok) {
//         setNotifs((prev) => prev.filter((n) => n.id !== id));
//       } else {
//         console.error("Failed to mark notification read:", res.status);
//       }
//     } catch (err) {
//       console.error("Error marking notification read:", err);
//     }
//   };

//   const notifyMe = async (auctionId) => {
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) {
//         setAlert("Please log in to subscribe.");
//         return;
//       }
//       await fetch(
//         `http://localhost:8080/auth/auction-items/${myUserId}/${auctionId}/notify`,
//         {
//           method: "POST",
//           credentials: "include",
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
//       setAlert("Notification set");
//     } catch (err) {
//       console.error("Error subscribing to notification:", err);
//       setAlert("Notification set");
//     }
//   };

//   const getImageUrl = (item) => {
//     if (item.images?.length) {
//       const img = item.images[0];
//       return typeof img === "string" ? img : img.url || img.src;
//     }
//     return (
//       item.imageUrl ||
//       item.image ||
//       "https://via.placeholder.com/300x200?text=No+Image"
//     );
//   };

//   // 7. Partition upcoming vs running
//   const now = new Date();
//   const upcoming = auctions.filter((a) => {
//     const hasFutureStartTime = a.startTime && new Date(a.startTime) > now;
//     console.log(
//       `Item: ${a.itemName}, StartTime: ${a.startTime}, Upcoming: ${hasFutureStartTime}`
//     );
//     return hasFutureStartTime;
//   });
//   const running = auctions.filter((a) => {
//     const isRunning =
//       (a.closingTime ? new Date(a.closingTime) > now : true) &&
//       (!a.startTime || new Date(a.startTime) <= now);
//     console.log(
//       `Item: ${a.itemName}, ClosingTime: ${a.closingTime}, StartTime: ${a.startTime}, Running: ${isRunning}`
//     );
//     return isRunning;
//   });

//   // 8. Apply search filter
//   const filteredUpcoming = upcoming.filter((a) =>
//     a.itemName?.toLowerCase().includes(searchTerm.toLowerCase())
//   );
//   const filteredRunning = running.filter((a) =>
//     a.itemName?.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   // 9. Group by category
//   const groupByCategory = (list) =>
//     list.reduce((acc, i) => {
//       const cat = i.category || "Uncategorized";
//       (acc[cat] = acc[cat] || []).push(i);
//       return acc;
//     }, {});

//   const byCategoryUpcoming = groupByCategory(filteredUpcoming);
//   const byCategoryRunning = groupByCategory(filteredRunning);

//   return (
//     <div>
//       <nav className="top-nav">
//         <div className="logo">VEHICLE SHOP</div>
//         <div className="nav-links">
//           <NavLink to="/summary">Home</NavLink>
//           <NavLink to="/summary/car">Car</NavLink>
//           <NavLink to="/summary/bike">Bike</NavLink>
//           <NavLink to="/summary/truck">Truck</NavLink>
//           <input
//             type="text"
//             placeholder="Search items..."
//             className="search-bar"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//           <NavLink to={`/NotificationsPage/${myUserId}`}>
//             Notifications{" "}
//             {notifs.length > 0 && (
//               <span className="notif-badge">{notifs.length}</span>
//             )}
//           </NavLink>
//           <NavLink to="/profile">Profile</NavLink>
//           <NavLink to="/cart">Cart</NavLink>
//         </div>
//       </nav>

//       {alert && (
//         <div
//           className={`alert ${alert.includes("Failed") ? "error" : "success"}`}
//         >
//           {alert}
//         </div>
//       )}

//       <h4 className="title-auction">
//         Upcoming Auctions {searchTerm && `matching “${searchTerm}”`}
//       </h4>
//       {filteredUpcoming.length === 0 ? (
//         <p>No upcoming auctions{searchTerm ? ` match “${searchTerm}”` : "."}</p>
//       ) : (
//         Object.entries(byCategoryUpcoming).map(([cat, items]) => (
//           <section key={cat}>
//             <h5>{cat}</h5> {/* Display the category name */}
//             <div className="item-list">
//               {items.map((item) => (
//                 <div className="card" key={item.auctionId}>
//                   <img
//                     className="card-img"
//                     src={getImageUrl(item)}
//                     alt={item.itemName}
//                   />
//                   <div className="card-body">
//                     <h2>{item.itemName}</h2>
//                     <p className="card-desc">{item.description}</p>
//                     <div className="card-info">
//                       <span>Starting Price: £{item.currentBid}</span>
//                       <span>Category: {item.category}</span>
//                     </div>
//                     <div className="card-footer">
//                       <span>
//                         Starts: {new Date(item.startTime).toLocaleString()}
//                       </span>
//                       <button
//                         className="notify-me"
//                         onClick={() => notifyMe(item.auctionId)}
//                       >
//                         NOTIFY ME
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </section>
//         ))
//       )}

//       <h4 className="title-auction">
//         All Running Auctions {searchTerm && `matching “${searchTerm}”`}
//       </h4>
//       {filteredRunning.length === 0 ? (
//         <p>No running auctions{searchTerm ? ` match “${searchTerm}”` : "."}</p>
//       ) : (
//         Object.entries(byCategoryRunning).map(([cat, items]) => (
//           <section key={cat}>
//             <h5>{cat}</h5> {/* Display the category name */}
//             <div className="item-list">
//               {items.map((item) => (
//                 <div className="card" key={item.auctionId}>
//                   <img
//                     className="card-img"
//                     src={getImageUrl(item)}
//                     alt={item.itemName}
//                   />
//                   <div className="card-body">
//                     <h2>{item.itemName}</h2>
//                     <p className="card-desc">{item.description}</p>
//                     <div className="card-info">
//                       <span>
//                         Current Bid: £
//                         {item.currentBid !== undefined
//                           ? item.currentBid
//                           : item.starting_price}
//                       </span>
//                       <span>Category: {item.category}</span>
//                     </div>
//                     <div className="card-footer">
//                       <span>
//                         Closing: {new Date(item.closingTime).toLocaleString()}
//                       </span>
//                       <div>
//                         <button
//                           className="view-deal"
//                           onClick={() =>
//                             navigate(
//                               `/summary/${item.category}/${
//                                 item.auction_id || item.id
//                               }`
//                             )
//                           }
//                         >
//                           VIEW DEAL
//                         </button>
//                         <button
//                           className="qa-button"
//                           onClick={() =>
//                             navigate(`/questions/${item.auction_id}`)
//                           }
//                         >
//                           Q&A
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </section>
//         ))
//       )}
//     </div>
//   );
// }

import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./CategoryPage.css";

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
    const role = localStorage.getItem("role");
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
        const res = await fetch(
          "http://localhost:8080/auth/auction-items/summary",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            credentials: "include",
          }
        );
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
          `http://localhost:8080/auth/notifications?userId=${myUserId}`,
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
        `http://localhost:8080/auth/notifications/${id}/read`,
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
        `http://localhost:8080/auth/auction-items/${myUserId}/${auctionId}/notify`,
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
      return typeof img === "string" ? img : img.url || img.src;
    }
    return (
      item.imageUrl ||
      item.image ||
      "https://via.placeholder.com/300x200?text=No+Image"
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
    <div>
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
          {/* <NavLink to="/cart">Cart</NavLink> */}
        </div>
      </nav>

      {/* Alerts */}
      {alert && (
        <div
          className={`alert ${alert.includes("Failed") ? "error" : "success"}`}
        >
          {alert}
        </div>
      )}

      {/* //Upcoming Auctions
      <h4 className="title-auction">
        Upcoming Auctions {searchTerm && `matching “${searchTerm}”`}
      </h4>
      {filteredUpcoming.length === 0 ? (
        <p>No upcoming auctions{searchTerm ? ` match “${searchTerm}”` : "."}</p>
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
      )} */}

      {/* Running Auctions */}
      <h4 className="title-auction">
        All Running Auctions {searchTerm && `matching “${searchTerm}”`}
      </h4>
      {filteredRunning.length === 0 ? (
        <p>No running auctions{searchTerm ? ` match “${searchTerm}”` : "."}</p>
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
                        {item.currentBid !== undefined ? item.currentBid : item.startingPrice}
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
                          onClick={() =>
                            navigate(
                              `/${item.auctionId}`
                            )
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
                </div>
              ))}
            </div>
          </section>
        ))
      )}
      {/* Upcoming Auctions */}
      <h4 className="title-auction">
        Upcoming Auctions {searchTerm && `matching “${searchTerm}”`}
      </h4>
      {filteredUpcoming.length === 0 ? (
        <p>No upcoming auctions{searchTerm ? ` match “${searchTerm}”` : "."}</p>
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

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, NavLink } from "react-router-dom";
import "./ItemDetails.css";
import { API_ENDPOINTS } from "../config/api";

const ItemDetail = () => {
  const { itemId } = useParams();
  const navigate = useNavigate();

  const [auction, setAuction] = useState(null);
  const [currentBid, setCurrentBid] = useState(0);
  const [currentBidOwner, setCurrentBidOwner] = useState(null);
  const [autoBidLimit, setAutoBidLimit] = useState("");
  const [alert, setAlert] = useState("");
  const [reservePrice, setReservePrice] = useState(0);
  const [userRole, setUserRole] = useState(null);

  const myUserId = Number(localStorage.getItem("userId"));

  // Fetch user role
  const fetchUserRole = useCallback(async () => {
    try {
      const res = await fetch(
        `${API_ENDPOINTS.BASE_URL}/auth/profile/${myUserId}`,
        {
          credentials: "include",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (!res.ok) throw new Error(`Fetch role failed: ${res.status}`);
      const data = await res.json();
      setUserRole(data.role?.toLowerCase() || "");
    } catch (err) {
      console.error("Error fetching user role:", err);
      setAlert("Unable to verify user permissions.");
    }
  }, [myUserId]);

  // Load auction summary
  const fetchAuction = useCallback(async () => {
    try {
      const res = await fetch(API_ENDPOINTS.AUCTION_ITEMS_SUMMARY, {
        credentials: "include",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
      const data = await res.json();
      const item = data.find((i) => String(i.auctionId || i.id) === itemId);
      if (!item) throw new Error("Item not found");
      setAuction(item);

      // Initialize bid/reserve
      const initBid = Number(
        item.currentBid ?? item.starting_price ?? item.startingPrice ?? 0
      );
      setCurrentBid(initBid);
      setCurrentBidOwner(item.currentBidUserId ?? null);
      setReservePrice(
        Number(item.reserve_price ?? item.reservePrice ?? initBid)
      );

      // Log auction data for debugging
      console.log("Fetched auction:", item);
    } catch (err) {
      console.error(err);
      setAlert("Unable to load item details.");
    }
  }, [itemId]);

  useEffect(() => {
    if (!myUserId) {
      setAlert("Please log in to view this page.");
      navigate("/login");
      return;
    }
    fetchUserRole();
    fetchAuction();
    const interval = setInterval(fetchAuction, 10000);
    return () => clearInterval(interval);
  }, [fetchAuction, fetchUserRole, myUserId, navigate]);

  if (!auction) {
    return <div className="item-detail">Loading item details…</div>;
  }

  // Parse times & increments
  const startTime = new Date(auction.start_time ?? auction.startTime);
  const closeTime = new Date(auction.closing_time ?? auction.closingTime);
  const now = new Date();
  const rawInc = auction.bid_increment ?? auction.bidIncrement;
  const increment = Number(rawInc) > 0 ? Number(rawInc) : 0;

  // Update auction record on server
  const updateAuctionTable = async (newBid, newReserve) => {
    const token = localStorage.getItem("token");
    if (!myUserId || !token) {
      setAlert("You must be logged in to update the auction.");
      navigate("/login");
      return false;
    }
    const payload = {
      auction_id: Number(itemId),
      current_bid: newBid,
      reserve_price: newReserve,
    };
    try {
      const res = await fetch(
        `${API_ENDPOINTS.BASE_URL}/auth/auction-items/update`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );
      return res.ok;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  // Place a single bid
  const placeBidController = async (newBid, newReserve) => {
    const token = localStorage.getItem("token");
    if (!myUserId || !token) {
      setAlert("You must be logged in to place a bid.");
      navigate("/login");
      return false;
    }
    const payload = {
      auction_id: Number(itemId),
      buyer_id: myUserId,
      bid_time: new Date().toISOString(),
      bid_amount: newBid,
      reserve_price: newReserve,
    };
    try {
      const res = await fetch(`${API_ENDPOINTS.BASE_URL}/auth/bids`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (res.ok) return true;

      // Check if response has JSON content
      const contentType = res.headers.get("Content-Type");
      let errorMessage = `Failed to place bid: ${res.status} ${res.statusText}`;
      if (contentType && contentType.includes("application/json")) {
        const errorData = await res.json();
        errorMessage = errorData.message || errorMessage;
        console.error("Bid error response:", errorData);
      } else {
        const text = await res.text();
        errorMessage = text || errorMessage;
        console.error("Bid non-JSON response:", { status: res.status, text });
      }

      if (res.status === 403) {
        setAlert(
          errorMessage ||
            "You’re not authorized to bid on this item. Please check your account permissions."
        );
      } else {
        setAlert(errorMessage);
      }
      return false;
    } catch (err) {
      console.error("Bid request error:", err);
      setAlert("Failed to place bid: " + err.message);
      return false;
    }
  };

  // Handler for the “Place Bid” button
  const placeBid = async () => {
    // Log user and auction state for debugging
    console.log("User ID:", myUserId, "Role:", userRole);
    console.log("Auction:", { id: itemId, seller_id: auction.seller_id });

    // Check user role
    if (userRole === "seller") {
      setAlert("Sellers are not allowed to place bids.");
      return;
    }

    // No bidding on your own auction
    if (myUserId === Number(auction.seller_id ?? auction.sellerId)) {
      setAlert("You cannot bid on your own auction.");
      return;
    }

    // Not before auction has started
    if (now < startTime) {
      setAlert("Auction hasn't started yet.");
      return;
    }

    // Not after it has closed
    if (now > closeTime) {
      setAlert("This auction has already closed.");
      return;
    }

    // Compute new bid/reserve
    const newBid = currentBid + increment;
    const newReserve = autoBidLimit
      ? Number(autoBidLimit)
      : reservePrice + increment;

    // Send bid
    if (await placeBidController(newBid, newReserve)) {
      setCurrentBid(newBid);
      setCurrentBidOwner(myUserId);
      setAlert("Bid placed successfully");

      // Update table & refresh reserve
      if (await updateAuctionTable(newBid, newReserve)) {
        setReservePrice(newReserve);
      } else {
        // Rollback on failure
        setCurrentBid(currentBid);
        await fetchAuction();
      }

      // Brief delay then redirect
      setTimeout(() => navigate("/summary"), 1000);
    }
  };

  // Auto-bid setter
  const setAutoBid = async () => {
    const limit = Number(autoBidLimit);
    if (
      !Number.isInteger(limit) ||
      limit <= currentBid ||
      limit % increment !== 0
    ) {
      setAlert(
        `Auto-bid must be a multiple of £${increment} and > £${currentBid}`
      );
      return;
    }
    setAlert(`Auto-bid active until £${limit}`);
    if (await updateAuctionTable(currentBid, limit)) {
      setReservePrice(limit);
    } else {
      setAutoBidLimit("");
      await fetchAuction();
    }
  };

  // Get image URL with base prefixing for relative paths
  const getImageUrl = (item) => {
    if (item?.images?.length) {
      const img = item.images[0];
      if (typeof img === "string") {
        if (img.startsWith("/")) return `${API_ENDPOINTS.BASE_URL}${img}`;
        if (img.includes("localhost:8080")) {
          return img.replace("http://localhost:8080", API_ENDPOINTS.BASE_URL);
        }
        return img;
      }
      if (img && img.id && (item.id || item.itemId)) {
        const itemIdForPath = item.id || item.itemId;
        return `${API_ENDPOINTS.BASE_URL}/auth/auction-items/${itemIdForPath}/images/${img.id}`;
      }
      return img?.url || img?.src;
    }
    return (
      item?.imageUrl ||
      item?.image ||
      "https://via.placeholder.com/300x200?text=No+Image"
    );
  };

  // Format closing display
  const isToday = closeTime.toDateString() === now.toDateString();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const isTomorrow = closeTime.toDateString() === tomorrow.toDateString();
  const closingDisplay = isToday
    ? "Today"
    : isTomorrow
    ? "Tomorrow"
    : closeTime.toLocaleDateString();

  // Disable button if you're already top bidder OR auction not yet started OR seller
  const isDisabled =
    currentBidOwner === myUserId || now < startTime || userRole === "seller";

  return (
    <>
      <nav className="top-nav">
        <div className="logo">VEHICLE SHOP</div>
        <div className="nav-links">
          <NavLink to="/summary">Home</NavLink>
          <NavLink to="/summary/car">Car</NavLink>
          <NavLink to="/summary/bike">Bike</NavLink>
          <NavLink to="/summary/truck">Truck</NavLink>
        </div>
      </nav>

      <div className="item-detail">
        {alert && (
          <div
            className={`alert ${
              alert.includes("Failed") || alert.includes("not authorized")
                ? "error"
                : "success"
            }`}
          >
            {alert}
          </div>
        )}

        <img
          className="itemdetail-img"
          src={getImageUrl(auction)}
          alt={auction.item_name ?? auction.itemName}
        />

        <div className="detail-content">
          <h1>{auction.item_name ?? auction.itemName}</h1>
          <p>
            <strong>Description:</strong> {auction.description}
          </p>
          <p>
            <strong>Current Bid:</strong> £{currentBid}
          </p>
          <p>
            <strong>Closes:</strong> {closingDisplay}
          </p>
          <p>
            <strong>Status:</strong>{" "}
            {now < startTime
              ? "Not started"
              : now > closeTime
              ? "Closed"
              : "Open for bidding"}
          </p>

          <button
            className="place-bid-button"
            onClick={placeBid}
            disabled={isDisabled}
          >
            {userRole === "seller"
              ? "Sellers Cannot Bid"
              : currentBidOwner === myUserId
              ? "You Are the Highest Bidder"
              : now < startTime
              ? "Not Yet Open"
              : "Place Bid"}
          </button>

          <div className="auto-bid">
            <label>
              Auto-Bid Limit
              <input
                type="number"
                value={autoBidLimit}
                onChange={(e) => setAutoBidLimit(e.target.value)}
                placeholder={`${currentBid + increment}`}
              />
            </label>
            {/* <button onClick={setAutoBid}>Set Auto-Bid</button> */}
          </div>
        </div>
      </div>
    </>
  );
};

export default ItemDetail;
// import React, { useEffect, useState, useCallback } from "react";
// import { useParams, useNavigate, NavLink } from "react-router-dom";
// import "./ItemDetails.css";

// const ItemDetail = () => {
//   const { itemId } = useParams();
//   const navigate = useNavigate();

//   const [auction, setAuction] = useState(null);
//   const [currentBidOwner, setCurrentBidOwner] = useState(null);
//   const [autoBidLimit, setAutoBidLimit] = useState("");
//   const [alert, setAlert] = useState("");
//   const [reservePrice, setReservePrice] = useState(0);

//   const myUserId = Number(localStorage.getItem("userId"));

//   // Load auction summary
//   const fetchAuction = useCallback(async () => {
//     try {
//       const res = await fetch(
//         "API_ENDPOINTS.AUCTION_ITEMS_SUMMARY",
//         {
//           credentials: "include",
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         }
//       );
//       if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
//       const data = await res.json();
//       const item = data.find(
//         (i) => String(i.auctionId || i.auction_id || i.id) === itemId
//       );
//       if (!item) throw new Error("Item not found");
//       setAuction(item);

//       // Initialize bid owner and reserve price
//       setCurrentBidOwner(item.currentBidUserId ?? null);
//       setReservePrice(
//         Number(item.reserve_price ?? item.reservePrice ?? item.current_bid)
//       );
//     } catch (err) {
//       console.error(err);
//       setAlert("Unable to load item details.");
//     }
//   }, [itemId]);

//   useEffect(() => {
//     if (!myUserId) {
//       setAlert("Please log in to view this page.");
//       navigate("/login");
//       return;
//     }
//     fetchAuction();
//     const interval = setInterval(fetchAuction, 10000);
//     return () => clearInterval(interval);
//   }, [fetchAuction, myUserId, navigate]);

//   if (!auction) {
//     return <div className="item-detail">Loading item details…</div>;
//   }

//   // Parse times & increments
//   const startTime = new Date(auction.start_time ?? auction.startTime);
//   const closeTime = new Date(auction.closing_time ?? auction.closingTime);
//   const now = new Date();
//   const rawInc = auction.bid_increment ?? auction.bidIncrement;
//   const increment = Number(rawInc) > 0 ? Number(rawInc) : 0;

//   // Helper: update auction record on server
//   const updateAuctionTable = async (newBid, newReserve) => {
//     const token = localStorage.getItem("token");
//     if (!myUserId || !token) {
//       setAlert("You must be logged in to update the auction.");
//       navigate("/login");
//       return false;
//     }
//     const payload = {
//       auction_id: Number(itemId),
//       current_bid: newBid,
//       reserve_price: newReserve,
//     };
//     try {
//       const res = await fetch(
//         "API_ENDPOINTS.AUCTION_ITEMS/update",
//         {
//           method: "PUT",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//           credentials: "include",
//           body: JSON.stringify(payload),
//         }
//       );
//       return res.ok;
//     } catch (err) {
//       console.error(err);
//       return false;
//     }
//   };

//   // Place a single bid
//   const placeBidController = async (newBid, newReserve) => {
//     const token = localStorage.getItem("token");
//     if (!myUserId || !token) {
//       setAlert("You must be logged in to place a bid.");
//       navigate("/login");
//       return false;
//     }
//     const payload = {
//       auction_id: Number(itemId),
//       buyer_id: myUserId,
//       bid_time: new Date().toISOString(),
//       bid_amount: newBid,
//       reserve_price: newReserve,
//     };
//     try {
//       const res = await fetch("API_ENDPOINTS.BIDS", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         credentials: "include",
//         body: JSON.stringify(payload),
//       });
//       if (res.ok) return true;
//       if (res.status === 403) {
//         setAlert("You’re not authorized to bid on this item.");
//       } else {
//         const txt = await res.text();
//         setAlert(`Failed to place bid: ${txt || res.status}`);
//       }
//       return false;
//     } catch (err) {
//       console.error(err);
//       setAlert("Failed to place bid: " + err.message);
//       return false;
//     }
//   };

//   // Handler for the “Place Bid” button
//   const placeBid = async () => {
//     // a) No bidding on your own auction
//     if (myUserId === Number(auction.seller_id ?? auction.sellerId)) {
//       setAlert("You cannot bid on your own auction.");
//       return;
//     }

//     // b) Not before auction has started
//     if (now < startTime) {
//       setAlert("Auction hasn't started yet.");
//       return;
//     }

//     // c) Not after it has closed
//     if (now > closeTime) {
//       setAlert("This auction has already closed.");
//       return;
//     }

//     // Compute new bid/reserve using auction.current_bid
//     const newBid = auction.current_bid + increment;
//     const newReserve = autoBidLimit
//       ? Number(autoBidLimit)
//       : reservePrice + increment;

//     // Send bid
//     if (await placeBidController(newBid, newReserve)) {
//       setCurrentBidOwner(myUserId);
//       setAlert("Bid placed successfully");

//       // Update table & refresh reserve
//       if (await updateAuctionTable(newBid, newReserve)) {
//         setReservePrice(newReserve);
//       } else {
//         // Rollback on failure
//         await fetchAuction();
//       }

//       // Brief delay then redirect
//       setTimeout(() => navigate("/summary"), 1000);
//     }
//   };

//   // Auto-bid setter
//   const setAutoBid = async () => {
//     const limit = Number(autoBidLimit);
//     if (
//       !Number.isInteger(limit) ||
//       limit <= auction.current_bid ||
//       limit % increment !== 0
//     ) {
//       setAlert(
//         `Auto-bid must be a multiple of £${increment} and > £${auction.current_bid}`
//       );
//       return;
//     }
//     setAlert(`Auto-bid active until £${limit}`);
//     if (await updateAuctionTable(auction.current_bid, limit)) {
//       setReservePrice(limit);
//     } else {
//       setAutoBidLimit("");
//       await fetchAuction();
//     }
//   };

//   // Helper: get image URL
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

//   // Format closing display
//   const isToday = closeTime.toDateString() === now.toDateString();
//   const tomorrow = new Date(now);
//   tomorrow.setDate(now.getDate() + 1);
//   const isTomorrow = closeTime.toDateString() === tomorrow.toDateString();
//   const closingDisplay = isToday
//     ? "Today"
//     : isTomorrow
//     ? "Tomorrow"
//     : closeTime.toLocaleDateString();

//   // Disable button if you're already top bidder OR auction not yet started
//   const isDisabled = currentBidOwner === myUserId || now < startTime;

//   return (
//     <>
//       <nav className="top-nav">
//         <div className="logo">VEHICLE SHOP</div>
//         <div className="nav-links">
//           <NavLink to="/summary">Home</NavLink>
//           <NavLink to="/summary/car">Car</NavLink>
//           <NavLink to="/summary/bike">Bike</NavLink>
//           <NavLink to="/summary/truck">Truck</NavLink>
//         </div>
//       </nav>

//       <div className="item-detail">
//         {alert && (
//           <div
//             className={`alert ${
//               alert.includes("Failed") ? "error" : "success"
//             }`}
//           >
//             {alert}
//           </div>
//         )}

//         <img
//           className="itemdetail-img"
//           src={getImageUrl(auction)}
//           alt={auction.item_name ?? auction.itemName}
//         />

//         <div className="detail-content">
//           <h1>{auction.item_name ?? auction.itemName}</h1>
//           <p>
//             <strong>Description:</strong> {auction.description}
//           </p>
//           <p>
//             <strong>Current Bid:</strong> £{auction.current_bid}
//           </p>
//           <p>
//             <strong>Closes:</strong> {closingDisplay}
//           </p>
//           <p>
//             <strong>Status:</strong>{" "}
//             {now < startTime
//               ? "Not started"
//               : now > closeTime
//               ? "Closed"
//               : "Open for bidding"}
//           </p>

//           <button
//             className="place-bid-button"
//             onClick={placeBid}
//             disabled={isDisabled}
//           >
//             {currentBidOwner === myUserId
//               ? "You Are the Highest Bidder"
//               : now < startTime
//               ? "Not Yet Open"
//               : "Place Bid"}
//           </button>

//           <div className="auto-bid">
//             <label>
//               Auto-Bid Limit
//               <input
//                 type="number"
//                 value={autoBidLimit}
//                 onChange={(e) => setAutoBidLimit(e.target.value)}
//                 placeholder={`${auction.current_bid + increment}`}
//               />
//             </label>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default ItemDetail;

//below

// import React, { useEffect, useState, useCallback } from "react";
// import { useParams, useNavigate, NavLink } from "react-router-dom";
// import "./ItemDetails.css";

// const ItemDetail = () => {
//   const { itemId } = useParams();
//   const navigate = useNavigate();

//   const [auction, setAuction] = useState(null);
//   const [currentBid, setCurrentBid] = useState(0);
//   const [currentBidOwner, setCurrentBidOwner] = useState(null);
//   const [autoBidLimit, setAutoBidLimit] = useState("");
//   const [alert, setAlert] = useState("");
//   const [reservePrice, setReservePrice] = useState(0);

//   const myUserId = Number(localStorage.getItem("userId"));

//   // 1) Load auction summary
//   const fetchAuction = useCallback(async () => {
//     try {
//       const res = await fetch(
//         "API_ENDPOINTS.AUCTION_ITEMS_SUMMARY",
//         {
//           credentials: "include",
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         }
//       );
//       if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
//       const data = await res.json();
//       const item = data.find(
//         (i) => String(i.auctionId || i.auction_id || i.id) === itemId
//       );
//       if (!item) throw new Error("Item not found");
//       setAuction(item);

//       // initialize bid/reserve
//       const initBid = Number(
//         item.currentBid ?? item.starting_price ?? item.startingPrice ?? 0
//       );
//       setCurrentBid(initBid);
//       setCurrentBidOwner(item.currentBidUserId ?? null);
//       setReservePrice(
//         Number(item.reserve_price ?? item.reservePrice ?? initBid)
//       );
//     } catch (err) {
//       console.error(err);
//       setAlert("Unable to load item details.");
//     }
//   }, [itemId]);

//   useEffect(() => {
//     if (!myUserId) {
//       setAlert("Please log in to view this page.");
//       navigate("/login");
//       return;
//     }
//     fetchAuction();
//     const interval = setInterval(fetchAuction, 10000);
//     return () => clearInterval(interval);
//   }, [fetchAuction, myUserId, navigate]);

//   if (!auction) {
//     return <div className="item-detail">Loading item details…</div>;
//   }

//   // parse times & increments
//   const startTime = new Date(auction.start_time ?? auction.startTime);
//   const closeTime = new Date(auction.closing_time ?? auction.closingTime);
//   const now = new Date();
//   const rawInc = auction.bid_increment ?? auction.bidIncrement;
//   const increment = Number(rawInc) > 0 ? Number(rawInc) : 0;

//   // helper: update auction record on server
//   const updateAuctionTable = async (newBid, newReserve) => {
//     const token = localStorage.getItem("token");
//     if (!myUserId || !token) {
//       setAlert("You must be logged in to update the auction.");
//       navigate("/login");
//       return false;
//     }
//     const payload = {
//       auction_id: Number(itemId),
//       current_bid: newBid,
//       reserve_price: newReserve,
//     };
//     try {
//       const res = await fetch(
//         "API_ENDPOINTS.AUCTION_ITEMS/update",
//         {
//           method: "PUT",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//           credentials: "include",
//           body: JSON.stringify(payload),
//         }
//       );
//       return res.ok;
//     } catch (err) {
//       console.error(err);
//       return false;
//     }
//   };

//   // place a single bid
//   const placeBidController = async (newBid, newReserve) => {
//     const token = localStorage.getItem("token");
//     if (!myUserId || !token) {
//       setAlert("You must be logged in to place a bid.");
//       navigate("/login");
//       return false;
//     }
//     const payload = {
//       auction_id: Number(itemId),
//       buyer_id: myUserId,
//       bid_time: new Date().toISOString(),
//       bid_amount: newBid,
//       reserve_price: newReserve,
//     };
//     try {
//       const res = await fetch("API_ENDPOINTS.BIDS", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         credentials: "include",
//         body: JSON.stringify(payload),
//       });
//       if (res.ok) return true;
//       if (res.status === 403) {
//         setAlert("You’re not authorized to bid on this item.");
//       } else {
//         const txt = await res.text();
//         setAlert(`Failed to place bid: ${txt || res.status}`);
//       }
//       return false;
//     } catch (err) {
//       console.error(err);
//       setAlert("Failed to place bid: " + err.message);
//       return false;
//     }
//   };

//   // 2) Handler for the “Place Bid” button
//   const placeBid = async () => {
//     // a) no bidding on your own auction
//     if (myUserId === Number(auction.seller_id ?? auction.sellerId)) {
//       setAlert("You cannot bid on your own auction.");
//       return;
//     }

//     // b) not before auction has started
//     if (now < startTime) {
//       setAlert("Auction hasn't started yet.");
//       return;
//     }

//     // c) not after it has closed
//     if (now > closeTime) {
//       setAlert("This auction has already closed.");
//       return;
//     }

//     // compute new bid/reserve
//     const newBid = currentBid + increment;
//     const newReserve = autoBidLimit
//       ? Number(autoBidLimit)
//       : reservePrice + increment;

//     // send bid
//     if (await placeBidController(newBid, newReserve)) {
//       setCurrentBid(newBid);
//       setCurrentBidOwner(myUserId);
//       setAlert("Bid placed successfully");

//       // update table & refresh reserve
//       if (await updateAuctionTable(newBid, newReserve)) {
//         setReservePrice(newReserve);
//       } else {
//         // rollback on failure
//         setCurrentBid(currentBid);
//         await fetchAuction();
//       }

//       // brief delay then redirect
//       setTimeout(() => navigate("/summary"), 1000);
//     }
//   };

//   // 3) Auto-bid setter (unchanged)
//   const setAutoBid = async () => {
//     const limit = Number(autoBidLimit);
//     if (
//       !Number.isInteger(limit) ||
//       limit <= currentBid ||
//       limit % increment !== 0
//     ) {
//       setAlert(
//         `Auto-bid must be a multiple of £${increment} and > £${currentBid}`
//       );
//       return;
//     }
//     setAlert(`Auto-bid active until £${limit}`);
//     if (await updateAuctionTable(currentBid, limit)) {
//       setReservePrice(limit);
//     } else {
//       setAutoBidLimit("");
//       await fetchAuction();
//     }
//   };

//   // helper: get image URL
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

//   // format closing display
//   const isToday = closeTime.toDateString() === now.toDateString();
//   const tomorrow = new Date(now);
//   tomorrow.setDate(now.getDate() + 1);
//   const isTomorrow = closeTime.toDateString() === tomorrow.toDateString();
//   const closingDisplay = isToday
//     ? "Today"
//     : isTomorrow
//     ? "Tomorrow"
//     : closeTime.toLocaleDateString();

//   // disable button if you're already top bidder OR auction not yet started
//   const isDisabled = currentBidOwner === myUserId || now < startTime;

//   return (
//     <>
//       <nav className="top-nav">
//         <div className="logo">VEHICLE SHOP</div>
//         <div className="nav-links">
//           <NavLink to="/summary">Home</NavLink>
//           <NavLink to="/summary/car">Car</NavLink>
//           <NavLink to="/summary/bike">Bike</NavLink>
//           <NavLink to="/summary/truck">Truck</NavLink>
//         </div>
//       </nav>

//       <div className="item-detail">
//         {alert && (
//           <div
//             className={`alert ${
//               alert.includes("Failed") ? "error" : "success"
//             }`}
//           >
//             {alert}
//           </div>
//         )}

//         <img
//           className="itemdetail-img"
//           src={getImageUrl(auction)}
//           alt={auction.item_name ?? auction.itemName}
//         />

//         <div className="detail-content">
//           <h1>{auction.item_name ?? auction.itemName}</h1>
//           <p>
//             <strong>Description:</strong> {auction.description}
//           </p>
//           <p>
//             {/* <strong>Current Bid:</strong> £{currentBid} */}
//             <strong>Current Bid:</strong> £{auction.current_bid}
//           </p>
//           <p>
//             <strong>Closes:</strong> {closingDisplay}
//           </p>
//           <p>
//             <strong>Status:</strong>{" "}
//             {now < startTime
//               ? "Not started"
//               : now > closeTime
//               ? "Closed"
//               : "Open for bidding"}
//           </p>

//           <button
//             className="place-bid-button"
//             onClick={placeBid}
//             disabled={isDisabled}
//           >
//             {currentBidOwner === myUserId
//               ? "You Are the Highest Bidder"
//               : now < startTime
//               ? "Not Yet Open"
//               : "Place Bid"}
//           </button>

//           <div className="auto-bid">
//             <label>
//               Auto-Bid Limit
//               <input
//                 type="number"
//                 value={autoBidLimit}
//                 onChange={(e) => setAutoBidLimit(e.target.value)}
//                 placeholder={`${currentBid + increment}`}
//               />
//             </label>
//             {/* <button onClick={setAutoBid}>Set Auto-Bid</button> */}
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default ItemDetail;
//above
// import React, { useEffect, useState, useCallback } from "react";
// import { useParams, useNavigate, NavLink } from "react-router-dom";
// import "./ItemDetails.css";

// const ItemDetail = () => {
//   const { itemId } = useParams();
//   const navigate = useNavigate();

//   const [auction, setAuction] = useState(null);
//   const [currentBid, setCurrentBid] = useState(0);
//   const [currentBidOwner, setCurrentBidOwner] = useState(null);
//   const [autoBidLimit, setAutoBidLimit] = useState("");
//   const [alert, setAlert] = useState("");
//   const [reservePrice, setReservePrice] = useState(0);

//   const myUserId = Number(localStorage.getItem("userId"));

//   // 1) Load auction summary
//   const fetchAuction = useCallback(async () => {
//     try {
//       const res = await fetch(
//         "API_ENDPOINTS.AUCTION_ITEMS_SUMMARY",
//         {
//           credentials: "include",
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         }
//       );
//       if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
//       const data = await res.json();
//       const item = data.find(
//         (i) => String(i.auctionId || i.auction_id || i.id) === itemId
//       );
//       if (!item) throw new Error("Item not found");
//       setAuction(item);

//       // initialize bid/reserve
//       const initBid = Number(
//         item.currentBid ?? item.starting_price ?? item.startingPrice ?? 0
//       );
//       setCurrentBid(initBid);
//       setCurrentBidOwner(item.currentBidUserId ?? null);
//       setReservePrice(
//         Number(item.reserve_price ?? item.reservePrice ?? initBid)
//       );
//     } catch (err) {
//       console.error(err);
//       setAlert("Unable to load item details.");
//     }
//   }, [itemId]);

//   useEffect(() => {
//     if (!myUserId) {
//       setAlert("Please log in to view this page.");
//       navigate("/login");
//       return;
//     }
//     fetchAuction();
//     const interval = setInterval(fetchAuction, 10000);
//     return () => clearInterval(interval);
//   }, [fetchAuction, myUserId, navigate]);

//   if (!auction) {
//     return <div className="item-detail">Loading item details…</div>;
//   }

//   // parse times & increments
//   const startTime = new Date(auction.start_time ?? auction.startTime);
//   const closeTime = new Date(auction.closing_time ?? auction.closingTime);
//   const now = new Date();
//   const rawInc = auction.bid_increment ?? auction.bidIncrement;
//   const increment = Number(rawInc) > 0 ? Number(rawInc) : 0;

//   // helper: update auction record on server
//   const updateAuctionTable = async (newBid, newReserve) => {
//     const token = localStorage.getItem("token");
//     if (!myUserId || !token) {
//       setAlert("You must be logged in to update the auction.");
//       navigate("/login");
//       return false;
//     }
//     const payload = {
//       auction_id: Number(itemId),
//       current_bid: newBid,
//       reserve_price: newReserve,
//     };
//     try {
//       const res = await fetch(
//         "API_ENDPOINTS.AUCTION_ITEMS/update",
//         {
//           method: "PUT",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//           credentials: "include",
//           body: JSON.stringify(payload),
//         }
//       );
//       return res.ok;
//     } catch (err) {
//       console.error(err);
//       return false;
//     }
//   };

//   // place a single bid
//   const placeBidController = async (newBid, newReserve) => {
//     const token = localStorage.getItem("token");
//     if (!myUserId || !token) {
//       setAlert("You must be logged in to place a bid.");
//       navigate("/login");
//       return false;
//     }
//     const payload = {
//       auction_id: Number(itemId),
//       buyer_id: myUserId,
//       bid_time: new Date().toISOString(),
//       bid_amount: newBid,
//       reserve_price: newReserve,
//     };
//     try {
//       const res = await fetch("API_ENDPOINTS.BIDS", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         credentials: "include",
//         body: JSON.stringify(payload),
//       });
//       if (res.ok) return true;
//       if (res.status === 403) {
//         setAlert("You’re not authorized to bid on this item.");
//       } else {
//         const txt = await res.text();
//         setAlert(`Failed to place bid: ${txt || res.status}`);
//       }
//       return false;
//     } catch (err) {
//       console.error(err);
//       setAlert("Failed to place bid: " + err.message);
//       return false;
//     }
//   };

//   // 2) Handler for the “Place Bid” button
//   const placeBid = async () => {
//     // a) no bidding on your own auction
//     if (myUserId === Number(auction.seller_id ?? auction.sellerId)) {
//       setAlert("You cannot bid on your own auction.");
//       return;
//     }

//     // b) not before auction has started
//     if (now < startTime) {
//       setAlert("Auction hasn't started yet.");
//       return;
//     }

//     // c) not after it has closed
//     if (now > closeTime) {
//       setAlert("This auction has already closed.");
//       return;
//     }

//     // compute new bid/reserve
//     const newBid = currentBid + increment;
//     const newReserve = autoBidLimit
//       ? Number(autoBidLimit)
//       : reservePrice + increment;

//     // send bid
//     if (await placeBidController(newBid, newReserve)) {
//       setCurrentBid(newBid);
//       setCurrentBidOwner(myUserId);
//       setAlert("Bid placed successfully");

//       // update table & refresh reserve
//       if (await updateAuctionTable(newBid, newReserve)) {
//         setReservePrice(newReserve);
//       } else {
//         // rollback on failure
//         setCurrentBid(currentBid);
//         await fetchAuction();
//       }

//       // brief delay then redirect
//       setTimeout(() => navigate("/summary"), 1000);
//     }
//   };

//   // 3) Auto-bid setter (unchanged)
//   const setAutoBid = async () => {
//     const limit = Number(autoBidLimit);
//     if (
//       !Number.isInteger(limit) ||
//       limit <= currentBid ||
//       limit % increment !== 0
//     ) {
//       setAlert(
//         `Auto-bid must be a multiple of £${increment} and > £${currentBid}`
//       );
//       return;
//     }
//     setAlert(`Auto-bid active until £${limit}`);
//     if (await updateAuctionTable(currentBid, limit)) {
//       setReservePrice(limit);
//     } else {
//       setAutoBidLimit("");
//       await fetchAuction();
//     }
//   };

//   // helper: get image URL
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

//   // format closing display
//   const isToday = closeTime.toDateString() === now.toDateString();
//   const tomorrow = new Date(now);
//   tomorrow.setDate(now.getDate() + 1);
//   const isTomorrow = closeTime.toDateString() === tomorrow.toDateString();
//   const closingDisplay = isToday
//     ? "Today"
//     : isTomorrow
//     ? "Tomorrow"
//     : closeTime.toLocaleDateString();

//   // disable button if you're already top bidder OR auction not yet started
//   const isDisabled = currentBidOwner === myUserId || now < startTime;

//   return (
//     <>
//       <nav className="top-nav">
//         <div className="logo">VEHICLE SHOP</div>
//         <div className="nav-links">
//           <NavLink to="/summary">Home</NavLink>
//           <NavLink to="/summary/car">Car</NavLink>
//           <NavLink to="/summary/bike">Bike</NavLink>
//           <NavLink to="/summary/truck">Truck</NavLink>
//         </div>
//       </nav>

//       <div className="item-detail">
//         {alert && (
//           <div
//             className={`alert ${
//               alert.includes("Failed") ? "error" : "success"
//             }`}
//           >
//             {alert}
//           </div>
//         )}

//         <img
//           className="itemdetail-img"
//           src={getImageUrl(auction)}
//           alt={auction.item_name ?? auction.itemName}
//         />

//         <div className="detail-content">
//           <h1>{auction.item_name ?? auction.itemName}</h1>
//           <p>
//             <strong>Description:</strong> {auction.description}
//           </p>
//           <p>
//             <strong>Current Bid:</strong> £{auction.current_bid}
//           </p>
//           <p>
//             <strong>Closes:</strong> {closingDisplay}
//           </p>
//           <p>
//             <strong>Status:</strong>{" "}
//             {now < startTime
//               ? "Not started"
//               : now > closeTime
//               ? "Closed"
//               : "Open for bidding"}
//           </p>

//           <button
//             className="place-bid-button"
//             onClick={placeBid}
//             disabled={isDisabled}
//           >
//             {currentBidOwner === myUserId
//               ? "You Are the Highest Bidder"
//               : now < startTime
//               ? "Not Yet Open"
//               : "Place Bid"}
//           </button>

//           <div className="auto-bid">
//             <label>
//               Auto-Bid Limit
//               <input
//                 type="number"
//                 value={autoBidLimit}
//                 onChange={(e) => setAutoBidLimit(e.target.value)}
//                 placeholder={`${currentBid + increment}`}
//               />
//             </label>
//             {/* <button onClick={setAutoBid}>Set Auto-Bid</button> */}
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default ItemDetail;
// below

// import React, { useEffect, useState, useCallback } from "react";
// import { useParams, useNavigate, NavLink } from "react-router-dom";
// import "./ItemDetails.css";

// const ItemDetail = () => {
//   const { itemId } = useParams(); // Extract itemId from the URL
//   const navigate = useNavigate();

//   const [auction, setAuction] = useState(null);
//   const [currentBid, setCurrentBid] = useState(0);
//   const [currentBidOwner, setCurrentBidOwner] = useState(null);
//   const [autoBidLimit, setAutoBidLimit] = useState("");
//   const [alert, setAlert] = useState("");
//   const [reservePrice, setReservePrice] = useState(0);

//   // const myUserId = localStorage.getItem("userId");

//   // Fetch item summary
//   const myUserId = Number(localStorage.getItem("userId"));

//   // 1) Load auction summary
//   const fetchAuction = useCallback(async () => {
//     try {
//       const res = await fetch(
//         "API_ENDPOINTS.AUCTION_ITEMS_SUMMARY",
//         {
//           // credentials: "include",
//           // headers: {
//           //   Authorization: `Bearer ${localStorage.getItem("token")}`,
//           // },
//           credentials: "include",
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         }
//       );
//       if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
//       const data = await res.json();
//       const item = data.find(
//         (i) => String(i.auctionId || i.auction_id || i.id) === itemId
//       );
//       if (!item) throw new Error("Item not found");
//       setAuction(item);

//       // initialize bid/reserve
//       //     const initBid = Number(
//       //       item.currentBid ?? item.starting_price ?? item.startingPrice ?? 0
//       //     );
//       //     setCurrentBid(initBid);
//       //     setCurrentBidOwner(item.currentBidUserId ?? null);
//       //     setReservePrice(
//       //       Number(item.reserve_price ?? item.reservePrice ?? initialBid)
//       //     );
//       //   } catch (err) {
//       //     console.error(err);
//       //     setAlert("Unable to load item details.");
//       //   }
//       // }, [itemId]);
//       // initialize bid/reserve
//       const initBid = Number(
//         item.currentBid ?? item.starting_price ?? item.startingPrice ?? 0
//       );
//       setCurrentBid(initBid);
//       setCurrentBidOwner(item.currentBidUserId ?? null);
//       setReservePrice(
//         Number(item.reserve_price ?? item.reservePrice ?? initBid)
//       );
//     } catch (err) {
//       console.error(err);
//       setAlert("Unable to load item details.");
//     }
//   }, [itemId]);

//   useEffect(() => {
//     // const userId = localStorage.getItem("userId");
//     // if (!userId) {
//     if (!myUserId) {
//       setAlert("Please log in to view this page.");
//       navigate("/login");
//       return;
//     }
//     fetchAuction();

//     // Poll every 10 seconds to check for bid updates
//     //   const intervalId = setInterval(fetchAuction, 10000);
//     //   return () => clearInterval(intervalId);
//     // }, [fetchAuction, navigate]);
//     const interval = setInterval(fetchAuction, 10000);
//     return () => clearInterval(interval);
//   }, [fetchAuction, myUserId, navigate]);

//   if (!auction) {
//     return <div className="item-detail">Loading item details…</div>;
//   }

//   // parse times & increments
//   const startTime = new Date(auction.start_time ?? auction.startTime);
//   const closeTime = new Date(auction.closing_time ?? auction.closingTime);
//   const now = new Date();
//   const rawInc = auction.bid_increment ?? auction.bidIncrement;
//   const increment = Number(rawInc) > 0 ? Number(rawInc) : 0;

//   // Update the table with new current_bid and reserve_price
//   // const updateAuctionTable = async (newBid, newReservePrice) => {
//   //   const userId = Number(localStorage.getItem("userId"));
//   //   const token =
//   //     localStorage.getItem("token") || localStorage.getItem("authToken");
//   //   if (!userId || !token) {
//   // helper: update auction record on server
//   const updateAuctionTable = async (newBid, newReserve) => {
//     const token = localStorage.getItem("token");
//     if (!myUserId || !token) {
//       setAlert("You must be logged in to update the auction.");
//       navigate("/login");
//       return false;
//     }
//     const payload = {
//       auction_id: Number(itemId),
//       current_bid: newBid,
//       // reserve_price: newReservePrice,
//       reserve_price: newReserve,
//     };
//     try {
//       //   const res = await fetch(
//       //     "API_ENDPOINTS.AUCTION_ITEMS/update",
//       //     {
//       //       method: "PUT",
//       //       headers: {
//       //         "Content-Type": "application/json",
//       //         Authorization: `Bearer ${token}`,
//       //       },
//       //       body: JSON.stringify(payload),
//       //       credentials: "include",
//       //     }
//       //   );

//       //   if (res.ok) return true;

//       //   const txt = await res.text();
//       //   console.error(`PUT /auth/auction-items/update ${res.status}: ${txt}`);
//       //   return false;
//       const res = await fetch(
//         "API_ENDPOINTS.AUCTION_ITEMS/update",
//         {
//           method: "PUT",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//           credentials: "include",
//           body: JSON.stringify(payload),
//         }
//       );
//       return res.ok;
//     } catch (err) {
//       console.error(err);
//       return false;
//     }
//   };

//   // Place bid via server
//   // const placeBidController = async (newBid, newReservePrice) => {
//   //   const userId = Number(localStorage.getItem("userId"));
//   //   const token =
//   //     localStorage.getItem("token") || localStorage.getItem("authToken");
//   //   if (!userId || !token) {
//   // place a single bid
//   const placeBidController = async (newBid, newReserve) => {
//     const token = localStorage.getItem("token");
//     if (!myUserId || !token) {
//       setAlert("You must be logged in to place a bid.");
//       navigate("/login");
//       return false;
//     }
//     const payload = {
//       auction_id: Number(itemId),
//       buyer_id: myUserId,
//       bid_time: new Date().toISOString(),
//       bid_amount: newBid,
//       // reserve_price: newReservePrice,
//       reserve_price: newReserve,
//     };
//     try {
//       const res = await fetch("API_ENDPOINTS.BIDS", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         // body: JSON.stringify(payload),
//         // credentials: "include",
//         credentials: "include",
//         body: JSON.stringify(payload),
//       });
//       if (res.ok) return true;

//       // const txt = await res.text();
//       // console.error(`POST /auth/bids ${res.status}: ${txt}`);
//       // if (res.status === 403)
//       //   setAlert("You’re not authorized to bid on this item.");
//       // else setAlert(`Failed to place bid: ${txt || res.status}`);
//       if (res.status === 403) {
//         setAlert("You’re not authorized to bid on this item.");
//       } else {
//         const txt = await res.text();
//         setAlert(`Failed to place bid: ${txt || res.status}`);
//       }
//       return false;
//     } catch (err) {
//       console.error(err);
//       setAlert("Failed to place bid: " + err.message);
//       return false;
//     }
//   };

//   // // Handler for Place Bid
//   // const placeBid = async () => {
//   //   const userId = Number(localStorage.getItem("userId"));

//   //   // Check if the user is the seller (cannot bid on own auction)
//   //   if (Number(userId) === Number(auction.seller_id)) {
//   // 2) Handler for the “Place Bid” button
//   const placeBid = async () => {
//     // a) no bidding on your own auction
//     if (myUserId === Number(auction.seller_id ?? auction.sellerId)) {
//       setAlert("You cannot bid on your own auction.");
//       return;
//     }

//     // b) not before auction has started
//     if (now < startTime) {
//       setAlert("Auction hasn't started yet.");
//       return;
//     }

//     // c) not after it has closed
//     if (now > closeTime) {
//       setAlert("This auction has already closed.");
//       return;
//     }

//     // const baseBid =
//     //   currentBid === Number(auction.starting_price) ? currentBid : currentBid;
//     // const newBid = baseBid + increment;
//     // const newReservePrice = autoBidLimit
//     // compute new bid/reserve
//     const newBid = currentBid + increment;
//     const newReserve = autoBidLimit
//       ? Number(autoBidLimit)
//       : reservePrice + increment;

//     // send bid
//     if (await placeBidController(newBid, newReserve)) {
//       setCurrentBid(newBid);
//       setCurrentBidOwner(localStorage.getItem("userId"));
//       setAlert("Bid placed successfully");

//       // // Update the table with the new current_bid and reserve_price
//       // const updateSuccess = await updateAuctionTable(newBid, newReservePrice);
//       // if (updateSuccess) {
//       //   setReservePrice(newReservePrice);
//       //   setCurrentBidOwner(myUserId);
//       //   setAlert("Bid placed successfully");

//       // update table & refresh reserve
//       if (await updateAuctionTable(newBid, newReserve)) {
//         setReservePrice(newReserve);
//       } else {
//         // rollback on failure
//         setCurrentBid(currentBid);
//         await fetchAuction();
//       }

//       // Add a 1-second delay to show the "Bid placed successfully" message
//       // setTimeout(() => {
//       //   navigate("/summary");
//       // }, 1000);
//       // brief delay then redirect
//       setTimeout(() => navigate("/summary"), 1000);
//     }
//   };

//   // 3) Auto-bid setter (unchanged)
//   const setAutoBid = async () => {
//     const limit = Number(autoBidLimit);
//     // if (
//     //   !Number.isInteger(limit) ||
//     //   limit % increment !== 0 ||
//     //   limit <= currentBid
//     // ) {
//     //   setAlert(
//     //     `Auto-bid must be a multiple of £${increment} and > £${currentBid}`
//     //   );
//     if (
//       !Number.isInteger(limit) ||
//       limit <= currentBid ||
//       limit % increment !== 0
//     ) {
//       setAlert(
//         `Auto-bid must be a multiple of £${increment} and > £${currentBid}`
//       );
//       return;
//     }
//     setAlert(`Auto-bid active until £${limit}`);
//     if (await updateAuctionTable(currentBid, limit)) {
//       setReservePrice(limit);
//     } else {
//       setAutoBidLimit("");
//       await fetchAuction();
//     }
//   };

//   // Image URL handler
//   // helper: get image URL
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

//   // // Closing date label
//   // const closingDate = new Date(auction.closing_time ?? auction.closingTime);
//   // const today = new Date();
//   // const tomorrow = new Date(today);
//   // tomorrow.setDate(today.getDate() + 1);
//   // let closingDisplay = closingDate.toLocaleDateString();
//   // if (closingDate.toDateString() === today.toDateString())
//   //   closingDisplay = "Today";
//   // else if (closingDate.toDateString() === tomorrow.toDateString())
//   //   closingDisplay = "Tomorrow";

//   // // Owner text
//   // const ownerClass = currentBidOwner === myUserId ? "you" : "other";
//   // const ownerText = currentBidOwner === myUserId ? "you" : "another bidder";

//   // // Disable the Place Bid button if the current user is the highest bidder
//   // const isButtonDisabled = currentBidOwner === myUserId;
//   // format closing display
//   const isToday = closeTime.toDateString() === now.toDateString();
//   const tomorrow = new Date(now);
//   tomorrow.setDate(now.getDate() + 1);
//   const isTomorrow = closeTime.toDateString() === tomorrow.toDateString();
//   const closingDisplay = isToday
//     ? "Today"
//     : isTomorrow
//     ? "Tomorrow"
//     : closeTime.toLocaleDateString();

//   // disable button if you're already top bidder OR auction not yet started
//   const isDisabled = currentBidOwner === myUserId || now < startTime;

//   return (
//     <>
//       <nav className="top-nav">
//         <div className="logo">VEHICLE SHOP</div>
//         <div className="nav-links">
//           <NavLink to="/summary">Home</NavLink>
//           <NavLink to="/summary/car">Car</NavLink>
//           <NavLink to="/summary/bike">Bike</NavLink>
//           <NavLink to="/summary/truck">Truck</NavLink>
//         </div>
//       </nav>
//       {/* <div className="item-detail">
//         {alert && (
//           <div
//             className={`alert ${
//               alert.includes("Failed") || alert.includes("Error")
//                 ? "error"
//                 : "success"
//             }`}
//           >
//             {alert}
//           </div>
//         )}
//         <img
//           className="itemdetail-img"
//           src={getImageUrl(auction)}
//           alt={auction.item_name || auction.itemName}
//         />
//         <div className="detail-content">
//           <h1>{auction.item_name || auction.itemName}</h1>
//           <p>
//             <strong>Description:</strong> {auction.description}
//           </p>
//           <p>
//             <strong>Current Bid:</strong> £{currentBid}
//           </p>
//           <p>
//             <strong>Highest Bidder:</strong>{" "}
//             <span className={ownerClass}>{ownerText}</span>
//           </p>
//           <p>
//             <strong>Closing:</strong> {closingDisplay}
//           </p>

//           <button
//             className="place-bid-button"
//             onClick={placeBid}
//             disabled={isButtonDisabled}
//           >
//             {isButtonDisabled ? "You Are the Highest Bidder" : "Place Bid"}
//           </button> */}

//       <div className="item-detail">
//         {alert && (
//           <div
//             className={`alert ${
//               alert.includes("Failed") ? "error" : "success"
//             }`}
//           >
//             {alert}
//           </div>
//         )}

//         <img
//           className="itemdetail-img"
//           src={getImageUrl(auction)}
//           alt={auction.item_name ?? auction.itemName}
//         />

//         <div className="detail-content">
//           <h1>{auction.item_name ?? auction.itemName}</h1>
//           <p>
//             <strong>Description:</strong> {auction.description}
//           </p>
//           <p>
//             <strong>Current Bid:</strong> £{currentBid}
//           </p>
//           <p>
//             <strong>Closes:</strong> {closingDisplay}
//           </p>
//           <p>
//             <strong>Status:</strong>{" "}
//             {now < startTime
//               ? "Not started"
//               : now > closeTime
//               ? "Closed"
//               : "Open for bidding"}
//           </p>

//           <button
//             className="place-bid-button"
//             onClick={placeBid}
//             disabled={isDisabled}
//           >
//             {currentBidOwner === myUserId
//               ? "You Are the Highest Bidder"
//               : now < startTime
//               ? "Not Yet Open"
//               : "Place Bid"}
//           </button>

//           <div className="auto-bid">
//             <label>
//               Auto-Bid Limit
//               <input
//                 type="number"
//                 value={autoBidLimit}
//                 onChange={(e) => setAutoBidLimit(e.target.value)}
//                 placeholder={`${currentBid + increment}`}
//               />
//             </label>
//             {/* <button className="set-auto-bid-button" onClick={setAutoBid}>
//               Set Auto-Bid
//             </button>
//                 onChange={e => setAutoBidLimit(e.target.value)}
//                 placeholder={`${currentBid + increment}`}
//               /> */}
//             {/* </label> */}
//             {/* <button onClick={setAutoBid}>Set Auto-Bid</button> */}
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default ItemDetail;

//above

// import React, { useEffect, useState, useCallback } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { NavLink } from "react-router-dom";
// import "./ItemDetails.css";

// const ItemDetail = () => {
//   const { itemId } = useParams(); // Extract itemId from the URL
//   const navigate = useNavigate();

//   const [auction, setAuction] = useState(null);
//   const [currentBid, setCurrentBid] = useState(0);
//   const [currentBidOwner, setCurrentBidOwner] = useState(null);
//   const [autoBidLimit, setAutoBidLimit] = useState("");
//   const [alert, setAlert] = useState("");
//   const [reservePrice, setReservePrice] = useState(0);

//   // Fetch item summary
//   const fetchAuction = useCallback(async () => {
//     try {
//       const res = await fetch(
//         "API_ENDPOINTS.AUCTION_ITEMS_SUMMARY",
//         {
//           credentials: "include",
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         }
//       );
//       if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
//       const data = await res.json();
//       const item = data.find(
//         (i) => String(i.auctionId || i.auction_id || i.id) === itemId
//       );
//       if (!item) throw new Error("Item not found");
//       setAuction(item);
//       const initialBid = Number(item.currentBid ?? item.starting_price ?? 0);
//       setCurrentBid(initialBid);
//       setCurrentBidOwner(item.currentBidUserId ?? null);
//       setReservePrice(
//         Number(item.reserve_price ?? item.reservePrice ?? initialBid)
//       );
//     } catch (err) {
//       console.error(err);
//       setAlert("Unable to load item details.");
//     }
//   }, [itemId]);

//   useEffect(() => {
//     const userId = localStorage.getItem("userId");
//     if (!userId) {
//       setAlert("Please log in to view this page.");
//       navigate("/login");
//       return;
//     }
//     fetchAuction();
//   }, [fetchAuction, navigate]);

//   if (!auction) {
//     return <div className="item-detail">Loading item details…</div>;
//   }

//   const rawInc = auction.bid_increment ?? auction.bidIncrement;
//   const inc = Number(rawInc);
//   const increment = Number.isFinite(inc) && inc > 0 ? inc : 0;

//   // Update the table with new current_bid and reserve_price
//   const updateAuctionTable = async (newBid, newReservePrice) => {
//     const userId = Number(localStorage.getItem("userId"));
//     const token =
//       localStorage.getItem("token") || localStorage.getItem("authToken");
//     if (!userId || !token) {
//       setAlert("You must be logged in to update the auction.");
//       navigate("/login");
//       return false;
//     }

//     const payload = {
//       auction_id: Number(itemId),
//       current_bid: newBid,
//       reserve_price: newReservePrice,
//     };

//     try {
//       const res = await fetch(
//         "API_ENDPOINTS.AUCTION_ITEMS/update",
//         {
//           method: "PUT",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//           body: JSON.stringify(payload),
//           credentials: "include",
//         }
//       );

//       if (res.ok) return true;

//       const txt = await res.text();
//       console.error(`PUT /auth/auction-items/update ${res.status}: ${txt}`);
//       setAlert(`Failed to update auction table: ${txt || res.status}`);
//       return false;
//     } catch (err) {
//       console.error(err);
//       setAlert("Failed to update auction table: " + err.message);
//       return false;
//     }
//   };

//   // Place bid via server
//   const placeBidController = async (newBid, newReservePrice) => {
//     const userId = Number(localStorage.getItem("userId"));
//     const token =
//       localStorage.getItem("token") || localStorage.getItem("authToken");
//     if (!userId || !token) {
//       setAlert("You must be logged in to place a bid.");
//       navigate("/login");
//       return false;
//     }

//     const payload = {
//       auction_id: Number(itemId),
//       buyer_id: userId,
//       bid_time: new Date().toISOString(),
//       bid_amount: newBid,
//       reserve_price: newReservePrice,
//     };

//     try {
//       const res = await fetch("API_ENDPOINTS.BIDS", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify(payload),
//         credentials: "include",
//       });

//       if (res.ok) return true;

//       const txt = await res.text();
//       console.error(`POST /auth/bids ${res.status}: ${txt}`);
//       if (res.status === 403)
//         setAlert("You’re not authorized to bid on this item.");
//       else setAlert(`Failed to place bid: ${txt || res.status}`);
//       return false;
//     } catch (err) {
//       console.error(err);
//       setAlert("Failed to place bid: " + err.message);
//       return false;
//     }
//   };

//   // Handler for Place Bid (optimistic update)
//   const placeBid = async () => {
//     const userId = Number(localStorage.getItem("userId"));

//     // Check if the user is the seller (cannot bid on own auction)
//     if (Number(userId) === Number(auction.seller_id)) {
//       setAlert("You cannot bid on your own auction.");
//       return;
//     }

//     // Check if the auction is still open
//     const closingTime = new Date(auction.closing_time ?? auction.closingTime);
//     const currentTime = new Date();
//     if (currentTime > closingTime) {
//       setAlert("This auction has already closed.");
//       return;
//     }

//     const baseBid =
//       currentBid === Number(auction.starting_price) ? currentBid : currentBid;
//     const newBid = baseBid + increment;
//     const newReservePrice = autoBidLimit
//       ? Number(autoBidLimit)
//       : reservePrice + increment;

//     if (await placeBidController(newBid, newReservePrice)) {
//       setCurrentBid(newBid);
//       setCurrentBidOwner(localStorage.getItem("userId"));
//       setAlert(`You placed a bid: £${newBid}`);

//       // Update the table with the new current_bid and reserve_price
//       const updateSuccess = await updateAuctionTable(newBid, newReservePrice);
//       if (updateSuccess) {
//         setReservePrice(newReservePrice);
//         navigate("/summary");
//       } else {
//         setCurrentBid(baseBid);
//         setCurrentBidOwner(null);
//         await fetchAuction();
//       }
//     }
//   };

//   // Auto-bid setter
//   const setAutoBid = async () => {
//     const limit = Number(autoBidLimit);
//     if (
//       !Number.isInteger(limit) ||
//       limit % increment !== 0 ||
//       limit <= currentBid
//     ) {
//       setAlert(
//         `Auto-bid must be a multiple of £${increment} and > £${currentBid}`
//       );
//       return;
//     }
//     setAutoBidLimit(limit.toString());
//     setAlert(`Auto-bid active until £${limit}`);

//     const newReservePrice = limit;
//     const updateSuccess = await updateAuctionTable(currentBid, newReservePrice);
//     if (updateSuccess) {
//       setReservePrice(newReservePrice);
//     } else {
//       setAutoBidLimit("");
//       await fetchAuction();
//     }
//   };

//   // Image URL handler
//   const getImageUrl = (item) => {
//     if (item.images) {
//       if (Array.isArray(item.images) && typeof item.images[0] === "string") {
//         return item.images[0];
//       }
//       if (
//         Array.isArray(item.images) &&
//         item.images[0] &&
//         (item.images[0].url || item.images[0].src)
//       ) {
//         return item.images[0].url || item.images[0].src;
//       }
//     }
//     if (item.imageUrl) return item.imageUrl;
//     if (item.image) return item.image;
//     return "https://via.placeholder.com/300x200?text=No+Image";
//   };

//   // Closing date label
//   const closingDate = new Date(auction.closing_time ?? auction.closingTime);
//   const today = new Date();
//   const tomorrow = new Date(today);
//   tomorrow.setDate(today.getDate() + 1);
//   let closingDisplay = closingDate.toLocaleDateString();
//   if (closingDate.toDateString() === today.toDateString())
//     closingDisplay = "Today";
//   else if (closingDate.toDateString() === tomorrow.toDateString())
//     closingDisplay = "Tomorrow";

//   // Owner text
//   const myUserId = localStorage.getItem("userId");
//   const ownerClass = currentBidOwner === myUserId ? "you" : "other";
//   const ownerText = currentBidOwner === myUserId ? "you" : "another bidder";

//   return (
//     <>
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
//       <div className="item-detail">
//         {alert && (
//           <div
//             className={`alert ${
//               alert.includes("Failed") ? "error" : "success"
//             }`}
//           >
//             {alert}
//           </div>
//         )}
//         <img
//           className="itemdetail-img"
//           src={getImageUrl(auction)}
//           alt={auction.item_name || auction.itemName}
//         />
//         <div className="detail-content">
//           <h1>{auction.item_name || auction.itemName}</h1>
//           <p>
//             <strong>Description:</strong> {auction.description}
//           </p>
//           <p>
//             <strong>Current Bid:</strong> £{currentBid}
//           </p>
//           <p>
//             <strong>Closing:</strong> {closingDisplay}
//           </p>

//           <button className="place-bid-button" onClick={placeBid}>
//             Place Bid
//           </button>

//           <div className="auto-bid">
//             <label>
//               Auto-Bid Limit
//               <input
//                 type="number"
//                 value={autoBidLimit}
//                 onChange={(e) => setAutoBidLimit(e.target.value)}
//                 placeholder={`${currentBid + increment}`}
//               />
//             </label>
//             <button className="set-auto-bid-button" onClick={setAutoBid}>
//               Set Auto-Bid
//             </button>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default ItemDetail;
// import React, { useEffect, useState, useCallback } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { NavLink } from 'react-router-dom';
// import "./ItemDetails.css";

// const ItemDetail = () => {
//   const { itemId } = useParams();
//   const navigate = useNavigate();

//   const [auction, setAuction] = useState(null);
//   const [currentBid, setCurrentBid] = useState(0);
//   const [currentBidOwner, setCurrentBidOwner] = useState(null);
//   const [autoBidLimit, setAutoBidLimit] = useState('');
//   const [alert, setAlert] = useState('');
//   const [reservePrice, setReservePrice] = useState(0);

//   // Fetch item summary
//   const fetchAuction = useCallback(async () => {
//     try {
//       const res = await fetch("API_ENDPOINTS.AUCTION_ITEMS_SUMMARY", {
//         credentials: 'include',
//         headers: {
//           "Authorization": `Bearer ${localStorage.getItem('token')}`
//         }
//       });
//       if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
//       const data = await res.json();
//       const item = data.find(i => String(i.auctionId || i.id) === itemId);
//       if (!item) throw new Error('Item not found');
//       setAuction(item);
//       const initialBid = Number(item.currentBid ?? item.starting_price ?? 0);
//       setCurrentBid(initialBid);
//       setCurrentBidOwner(item.currentBidUserId ?? null);
//       setReservePrice(Number(item.reserve_price ?? item.reservePrice ?? initialBid));
//     } catch (err) {
//       console.error(err);
//       setAlert("Unable to load item details.");
//     }
//   }, [itemId]);

//   useEffect(() => {
//     const userId = localStorage.getItem('userId');
//     if (!userId) {
//       setAlert("Please log in to view this page.");
//       navigate('/login');
//       return;
//     }
//     fetchAuction();
//   }, [fetchAuction, navigate]);

//   if (!auction) {
//     return <div className="item-detail">Loading item details…</div>;
//   }

//   const rawInc = auction.bid_increment ?? auction.bidIncrement;
//   const inc = Number(rawInc);
//   const increment = Number.isFinite(inc) && inc > 0 ? inc : 0;

//   // Update the table with new current_bid and reserve_price
//   const updateAuctionTable = async (newBid, newReservePrice) => {
//     const userId = Number(localStorage.getItem('userId'));
//     const token = localStorage.getItem('token') || localStorage.getItem('authToken');
//     if (!userId || !token) {
//       setAlert("You must be logged in to update the auction.");
//       navigate('/login');
//       return false;
//     }

//     const payload = {
//       auction_id: Number(itemId),
//       current_bid: newBid,
//       reserve_price: newReservePrice
//     };

//     try {
//       const res = await fetch("API_ENDPOINTS.AUCTION_ITEMS/update", {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//           "Authorization": `Bearer ${token}`
//         },
//         body: JSON.stringify(payload),
//         credentials: 'include'
//       });

//       if (res.ok) return true;

//       const txt = await res.text();
//       console.error(`PUT /auth/auction-items/update ${res.status}: ${txt}`);
//       setAlert(`Failed to update auction table: ${txt || res.status}`);
//       return false;
//     } catch (err) {
//       console.error(err);
//       setAlert("Failed to update auction table: " + err.message);
//       return false;
//     }
//   };

//   // Place bid via server
//   const placeBidController = async (newBid, newReservePrice) => {
//     const userId = Number(localStorage.getItem('userId'));
//     const token = localStorage.getItem('token') || localStorage.getItem('authToken');
//     if (!userId || !token) {
//       setAlert("You must be logged in to place a bid.");
//       navigate('/login');
//       return false;
//     }

//     const payload = {
//       auction_id: Number(itemId),
//       buyer_id: userId,
//       bid_time: new Date().toISOString(),
//       bid_amount: newBid,
//       reserve_price: newReservePrice
//     };

//     try {
//       const res = await fetch("API_ENDPOINTS.BIDS", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           "Authorization": `Bearer ${token}`
//         },
//         body: JSON.stringify(payload),
//         credentials: 'include'
//       });

//       if (res.ok) return true;

//       const txt = await res.text();
//       console.error(`POST /auth/bids ${res.status}: ${txt}`);
//       if (res.status === 403) setAlert("You’re not authorized to bid on this item.");
//       else setAlert(`Failed to place bid: ${txt || res.status}`);
//       return false;
//     } catch (err) {
//       console.error(err);
//       setAlert("Failed to place bid: " + err.message);
//       return false;
//     }
//   };

//   // Handler for Place Bid (optimistic update)
//   const placeBid = async () => {
//     const userId = Number(localStorage.getItem('userId'));

//     // Check if the user is the seller (cannot bid on own auction)
//     if (Number(userId) === Number(auction.seller_id)) {
//       setAlert("You cannot bid on your own auction.");
//       return;
//     }

//     // Check if the auction is still open
//     const closingTime = new Date(auction.closing_time ?? auction.closingTime);
//     const currentTime = new Date();
//     if (currentTime > closingTime) {
//       setAlert("This auction has already closed.");
//       return;
//     }

//     const baseBid = currentBid === Number(auction.starting_price) ? currentBid : currentBid;
//     const newBid = baseBid + increment;
//     const newReservePrice = autoBidLimit ? Number(autoBidLimit) : (reservePrice + increment);

//     if (await placeBidController(newBid, newReservePrice)) {
//       setCurrentBid(newBid);
//       setCurrentBidOwner(localStorage.getItem('userId'));
//       setAlert(`You placed a bid: £${newBid}`);

//       // Update the table with the new current_bid and reserve_price
//       const updateSuccess = await updateAuctionTable(newBid, newReservePrice);
//       if (updateSuccess) {
//         setReservePrice(newReservePrice);
//         navigate('/summary');
//       } else {
//         setCurrentBid(baseBid);
//         setCurrentBidOwner(null);
//         await fetchAuction();
//       }
//     }
//   };

//   // Auto-bid setter
//   const setAutoBid = async () => {
//     const limit = Number(autoBidLimit);
//     if (!Number.isInteger(limit) || limit % increment !== 0 || limit <= currentBid) {
//       setAlert(`Auto-bid must be a multiple of £${increment} and > £${currentBid}`);
//       return;
//     }
//     setAutoBidLimit(limit.toString());
//     setAlert(`Auto-bid active until £${limit}`);

//     const newReservePrice = limit;
//     const updateSuccess = await updateAuctionTable(currentBid, newReservePrice);
//     if (updateSuccess) {
//       setReservePrice(newReservePrice);
//     } else {
//       setAutoBidLimit('');
//       await fetchAuction();
//     }
//   };

//   // Image URL handler (from reference code)
//   const getImageUrl = (item) => {
//     if (item.images) {
//       if (Array.isArray(item.images) && typeof item.images[0] === "string") {
//         return item.images[0];
//       }
//       if (
//         Array.isArray(item.images) &&
//         item.images[0] &&
//         (item.images[0].url || item.images[0].src)
//       ) {
//         return item.images[0].url || item.images[0].src;
//       }
//     }
//     if (item.imageUrl) return item.imageUrl;
//     if (item.image) return item.image;
//     return "https://via.placeholder.com/300x200?text=No+Image";
//   };

//   // Closing date label
//   const closingDate = new Date(auction.closing_time ?? auction.closingTime);
//   const today = new Date();
//   const tomorrow = new Date(today);
//   tomorrow.setDate(today.getDate() + 1);
//   let closingDisplay = closingDate.toLocaleDateString();
//   if (closingDate.toDateString() === today.toDateString()) closingDisplay = "Today";
//   else if (closingDate.toDateString() === tomorrow.toDateString()) closingDisplay = "Tomorrow";

//   // Owner text
//   const myUserId = localStorage.getItem('userId');
//   const ownerClass = currentBidOwner === myUserId ? 'you' : 'other';
//   const ownerText = currentBidOwner === myUserId ? 'you' : 'another bidder';

//   return (
//     <>
//      <nav className="top-nav">
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
//     <div className="item-detail">
//       <img
//         className="itemdetail-img"
//         src={getImageUrl(auction)}
//         alt={auction.item_name || auction.itemName}
//       />
//       <div className="detail-content">
//         <h1>{auction.item_name || auction.itemName}</h1>
//         <p><strong>Description:</strong>{auction.description}</p>
//         <p><strong>Current Bid:</strong> £{currentBid}</p>
//         <p><strong>Closing:</strong> {closingDisplay}</p>

//         <button className="place-bid-button" onClick={placeBid}>
//           Place Bid
//         </button>

//         <div className="auto-bid">
//           <label>
//             Auto-Bid Limit
//             {/* (multiples of £${increment}, current): */}
//             <input
//               type="number"
//               value={autoBidLimit}
//               onChange={e => setAutoBidLimit(e.target.value)}
//               placeholder={`${currentBid + increment}`}
//             />
//           </label>
//         </div>
//       </div>
//     </div>
//     </>
//   );
// };

// export default ItemDetail;

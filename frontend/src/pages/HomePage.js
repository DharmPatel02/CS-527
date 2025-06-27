import React, { useState } from "react";
import "./HomePage.css";
import LoginPopup from "./LoginPopup";
import ForgotPasswordPopup from "./ForgotPasswordPopup";
import PasswordRequests from "./PasswordRequests";

const HomePage = () => {
  const [openPopup, setOpenPopup] = useState(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showPasswordRequests, setShowPasswordRequests] = useState(false);

  return (
    <div className="homepage-container">
      <div className="auth-box">
        {/* Welcome Section with Logo */}
        <div className="welcome-section">
          <div className="logo-container">
            <span role="img" aria-label="hammer" className="bid-hammer-logo">
              🔨
            </span>
            <h1>Welcome to VehicleShop</h1>
          </div>
          <p>
            Your journey to finding the perfect vehicle starts here. Connect
            with trusted sellers and buyers in our secure marketplace.
          </p>
        </div>

        {/* Login Section */}
        <div className="login-section">
          <h2 className="login-title">Login to Your Account</h2>
          <div className="login-options">
            <button onClick={() => setOpenPopup("buyer")}>
              Login as Buyer
            </button>
            <button onClick={() => setOpenPopup("seller")}>
              Login as Seller
            </button>
            <button onClick={() => setOpenPopup("representative")}>
              Login as Customer Representative
            </button>
            {/* Added Admin Login Button */}
            <button onClick={() => setOpenPopup("admin")}>
              Login as Admin
            </button>
          </div>
        </div>
      </div>

      {/* Popup Handling */}
      {openPopup === "buyer" && (
        <LoginPopup userType="Buyer" onClose={() => setOpenPopup(null)}  onForgotPassword={() => setShowForgotPassword(true)}
        />
      )}
      {openPopup === "seller" && (
        <LoginPopup userType="Seller" onClose={() => setOpenPopup(null)} onForgotPassword={() => setShowForgotPassword(true)}/>
      )}
      {openPopup === "representative" && (
        <LoginPopup
          userType="Customer Representative"
          onClose={() => setOpenPopup(null)}
          redirectTo="/customer-representative"
        />
      )}
      {/* Added Admin Popup Handling */}
      {openPopup === "admin" && (
        <LoginPopup
          userType="Admin"
          onClose={() => setOpenPopup(null)}
          redirectTo="/admin"
        />
      )}
       {showForgotPassword && (
        <ForgotPasswordPopup onClose={() => setShowForgotPassword(false)} />
      )}
      {showPasswordRequests && (
        <PasswordRequests onClose={() => setShowPasswordRequests(false)} />
      )}
    </div>
  );
};

export default HomePage;
// import React, { useState } from "react";
// import "./HomePage.css";
// import LoginPopup from "./LoginPopup";

// const HomePage = () => {
//   const [openPopup, setOpenPopup] = useState(null);

//   return (
//     <div className="homepage-container">
//       <div className="auth-box">
//         {/* Welcome Section with Logo */}
//         <div className="welcome-section">
//           <div className="logo-container">
//             <span role="img" aria-label="hammer" className="bid-hammer-logo">
//               🔨
//             </span>
//             <h1>Welcome to VehicleShop</h1>
//           </div>
//           <p>
//             Your journey to finding the perfect vehicle starts here. Connect
//             with trusted sellers and buyers in our secure marketplace.
//           </p>
//         </div>

//         {/* Login Section */}
//         <div className="login-section">
//           <h2 className="login-title">Login to Your Account</h2>
//           <div className="login-options">
//             <button onClick={() => setOpenPopup("buyer")}>
//               Login as Buyer
//             </button>
//             <button onClick={() => setOpenPopup("seller")}>
//               Login as Seller
//             </button>
//             <button onClick={() => setOpenPopup("representative")}>
//               Login as Customer Representative
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Popup Handling */}
//       {openPopup === "buyer" && (
//         <LoginPopup userType="Buyer" onClose={() => setOpenPopup(null)} />
//       )}
//       {openPopup === "seller" && (
//         <LoginPopup userType="Seller" onClose={() => setOpenPopup(null)} />
//       )}
//       {openPopup === "representative" && (
//         <LoginPopup
//           userType="Customer Representative"
//           onClose={() => setOpenPopup(null)}
//           redirectTo="/customer-representative"
//         />
//       )}
//     </div>
//   );
// };

// export default HomePage;
// import React, { useState } from "react";
// import "./HomePage.css";
// import LoginPopup from "./LoginPopup";
// import carImage from "./carImage2.jpg";

// const HomePage = () => {
//   const [openPopup, setOpenPopup] = useState(null);

//   return (
//     <div className="homepage-container">
//       {/* Header Section */}
//       {/* <header className="header">
//         <div className="logo">VEHICLE SHOP</div>
//       </header> */}

//       {/* Main Content Section */}
//       <div className="content-wrapper">
//         <div className="content">
//           {/* Left Image Section */}
//           <div className="left-image-section">
//             <div className="image-wrapper hover-zoom">
//               <img src={carImage} alt="Luxury Car" />
//             </div>
//           </div>

//           {/* Right Content Section */}
//           <div className="right-content-section">
//             <h1>
//               <span className="highlight">Login To Car shop</span>
//             </h1>
//             {/* <p>
//                 Connect with trusted sellers or find eager buyers. Our platform
//                 makes car transactions simple, secure, and straightforward.
//               </p> */}

//             <div className="blocks-container">
//               <button
//                 className="login-button buyer-button hover-scale"
//                 onClick={() => setOpenPopup("buyer")}
//               >
//                 <span className="button-icon">🚗</span>
//                 Login as Buyer
//               </button>

//               <button
//                 className="login-button seller-button hover-scale"
//                 onClick={() => setOpenPopup("seller")}
//               >
//                 <span className="button-icon">💰</span>
//                 Login as Seller
//               </button>

//               <button
//                 className="login-button rep-button hover-scale"
//                 onClick={() => setOpenPopup("representative")}
//               >
//                 <span className="button-icon">👔</span>
//                 Customer Representative
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Popup Handling */}
//       {openPopup && (
//         <LoginPopup userType={openPopup} onClose={() => setOpenPopup(null)} />
//       )}
//     </div>
//   );
// };

// export default HomePage;
// import React, { useState } from "react";
// import "./HomePage.css";
// import LoginPopup from "./LoginPopup";
// import carImage from "./carImage2.jpg";

// const HomePage = () => {
//   const [openPopup, setOpenPopup] = useState(null);

//   return (
//     <div className="homepage-container">
//       {/* Header Section */}
//       <header className="header">
//         <div className="logo">VEHICLE SHOP</div>
//         {/* <div className="auth-links">
//           <button onClick={() => setOpenPopup("login")}>Login</button>
//           <button onClick={() => setOpenPopup("signup")}>Sign up</button>
//         </div> */}
//       </header>

//       {/* Main Content Section */}
//       <div className="content-wrapper">
//         <div className="content">
//           {/* Left Content Section */}
//           <div className="left-section">
//             <h1>
//               Find Your <span className="highlight">Perfect</span> Car Today
//             </h1>
//             <p>
//               Connect with trusted sellers or find eager buyers. Our platform
//               makes car transactions simple, secure, and straightforward.
//             </p>

//             {/* Login Options Blocks */}
//             <div className="blocks-container">
//               {/* <div className="main-block"> */}
//               <div className="block-row">
//                 <div
//                   className="back-item"
//                   onClick={() => setOpenPopup("buyer")}
//                 >
//                   Login as Buyer
//                 </div>
//               </div>

//               <div className="side-blocks">
//                 <div className="block-row">
//                   <div
//                     className="back-item"
//                     onClick={() => setOpenPopup("seller")}
//                   >
//                     Login as Seller
//                   </div>
//                   <div
//                     className="back-item"
//                     onClick={() => setOpenPopup("representative")}
//                   >
//                     Customer Representative
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Right Image Section */}
//           <div className="right-section">
//             <div className="image-wrapper">
//               <img src={carImage} alt="Luxury Car" />
//               {/* <div className="image-overlay">
//                 <h3>Premium Selection</h3>
//                 <p>Curated luxury vehicles from trusted dealers</p>
//               </div> */}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Popup Handling */}
//       {openPopup === "buyer" && (
//         <LoginPopup userType="Buyer" onClose={() => setOpenPopup(null)} />
//       )}

//       {openPopup === "seller" && (
//         <LoginPopup userType="Seller" onClose={() => setOpenPopup(null)} />
//       )}

//       {openPopup === "representative" && (
//         <LoginPopup
//           userType="Customer Representative"
//           onClose={() => setOpenPopup(null)}
//           redirectTo="/customer-representative"
//         />
//       )}

//       {/* Unified Popup Handler */}
//       {["login", "signup"].includes(openPopup) && (
//         <LoginPopup mode={openPopup} onClose={() => setOpenPopup(null)} />
//       )}
//     </div>
//   );
// };

// export default HomePage;
// import React, { useState } from "react";
// import "./HomePage.css";
// import LoginPopup from "./LoginPopup";
// import carImage from "./carimage.jpg";

// const HomePage = () => {
//   const [openPopup, setOpenPopup] = useState(null);

//   return (
//     <div className="homepage-container">
//       <div className="content-wrapper">
//         <div className="content">
//           <div className="left-section">
//             <h1>
//               Find Your <span className="highlight">Perfect</span> Car Today
//             </h1>
//             <p>
//               Connect with trusted sellers or find eager buyers. Our platform
//               makes car transactions simple, secure, and straightforward.
//             </p>

//             <div className="login-options">
//               <button onClick={() => setOpenPopup("buyer")}>
//                 Login as Buyer
//               </button>
//               <button onClick={() => setOpenPopup("seller")}>
//                 Login as Seller
//               </button>
//               <button onClick={() => setOpenPopup("representative")}>
//                 Login as Customer Representative
//               </button>
//             </div>

//             <div className="stats-container">
//               {/* ... existing stats ... */}
//             </div>
//           </div>

//           <div className="right-section">
//             <div className="image-wrapper">
//               <img src={carImage} alt="Car" />
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Popup Windows */}
//       {openPopup === "buyer" && (
//         <LoginPopup userType="Buyer" onClose={() => setOpenPopup(null)} />
//       )}

//       {openPopup === "seller" && (
//         <LoginPopup userType="Seller" onClose={() => setOpenPopup(null)} />
//       )}

//       {openPopup === "representative" && (
//         <LoginPopup
//           userType="Customer Representative"
//           onClose={() => setOpenPopup(null)}
//           redirectTo="/customer-representative"
//         />
//       )}
//     </div>
//   );
// };

// export default HomePage;
// import React, { useState } from "react";
// import "./HomePage.css";
// import LoginPopup from "./LoginPopup";
// import carImage from "./carimage.jpg";

// const HomePage = () => {
//   const [openPopup, setOpenPopup] = useState(null);

//   return (
//     <div className="homepage-container">
//       <div className="content-wrapper">
//         <div className="content">
//           {/* Left Section - Content */}
//           <div className="left-section">
//             <h1>
//               Find Your <span className="highlight">Perfect</span> Car Today
//             </h1>
//             <p>
//               Connect with trusted sellers or find eager buyers. Our platform
//               makes car transactions simple, secure, and straightforward.
//             </p>

//             <div className="login-options">
//               <button onClick={() => setOpenPopup("buyer")}>
//                 Login as Buyer
//               </button>
//               <button onClick={() => setOpenPopup("seller")}>
//                 Login as Seller
//               </button>
//             </div>

//             <div className="stats-container">
//               <div className="stat-item">
//                 <p className="stat-number"></p>
//                 <p className="stat-label"></p>
//               </div>
//               <div className="stat-item">
//                 <p className="stat-number"></p>
//                 <p className="stat-label"></p>
//               </div>
//               <div className="stat-item">
//                 <p className="stat-number"></p>
//                 <p className="stat-label"></p>
//               </div>
//             </div>
//           </div>

//           {/* Right Section - Image */}
//           <div className="right-section">
//             <div className="image-wrapper">
//               <img src={carImage} alt="Car" />
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Popup Windows */}
//       {openPopup === "buyer" && (
//         <LoginPopup userType="Buyer" onClose={() => setOpenPopup(null)} />
//       )}

//       {openPopup === "seller" && (
//         <LoginPopup userType="Seller" onClose={() => setOpenPopup(null)} />
//       )}
//     </div>
//   );
// };

// export default HomePage;

// import React, { useState } from "react";
// import "./HomePage.css";
// import LoginPopup from "./LoginPopup";
// import carImage from "./carimage.jpg";

// const HomePage = () => {
//   const [openPopup, setOpenPopup] = useState(null);

//   return (
//     <div className="homepage-container">
//       <div className="content">
//         {/* Left Side (60%) */}
//         <div className="left-section">
//           <h1>Welcome to Our Platform</h1>
//           <p>Some information related to the project.</p>
//           <div className="login-options">
//             <button onClick={() => setOpenPopup("buyer")}>
//               Login as Buyer
//             </button>
//             <button onClick={() => setOpenPopup("seller")}>
//               Login as Seller
//             </button>
//           </div>
//         </div>

//         {/* Right Side (40%) */}
//         <div className="right-section">
//           <img src={carImage} alt="Car" />
//         </div>
//       </div>

//       {/* Popup Windows */}
//       {openPopup === "buyer" && (
//         <LoginPopup userType="Buyer" onClose={() => setOpenPopup(null)} />
//       )}

//       {openPopup === "seller" && (
//         <LoginPopup userType="Seller" onClose={() => setOpenPopup(null)} />
//       )}
//     </div>
//   );
// };

// export default HomePage;
// /*
// import React, { useState } from "react";
// import "./HomePage.css";
// import LoginPopup from "./LoginPopup";
// import carImage from "./carimage.jpg"; // Import the image (adjust the path as needed)

// const HomePage = () => {
//   const [showBuyerPopup, setShowBuyerPopup] = useState(false);
//   const [showSellerPopup, setShowSellerPopup] = useState(false);

//   return (
//     <div className="homepage-container">
//       <div className="content">
//         {/* Left Side (60%) */
// /*        <div className="left-section">
//           <h1>Welcome to Our Platform</h1>
//           <p>Some information related to the project.</p>
//           <div className="login-options">
//             <button onClick={() => setShowBuyerPopup(true)}>
//               Login as Buyer
//             </button>
//             <button onClick={() => setShowSellerPopup(true)}>
//               Login as Seller
//             </button>
//           </div>
//         </div>

//         {/* Right Side (40%) */
// /*        <div className="right-section">
//           <img src={carImage} alt="Car" /> {/* Image on the right side */
// /*        </div>
//       </div>

//       {/* Popup Windows */
// /*      {showBuyerPopup && (
//         <LoginPopup userType="Buyer" onClose={() => setShowBuyerPopup(false)} />
//       )}

//       {showSellerPopup && (
//         <LoginPopup
//           userType="Seller"
//           onClose={() => setShowSellerPopup(false)}
//         />
//       )}
//     </div>
//   );
// };

// export default HomePage;
// */
// // import React, { useState } from "react";
// // import "./HomePage.css";
// // import LoginPopup from "./LoginPopup";
// // import projectImage from "./carimage.jpg"; // Import the image

// // const HomePage = () => {
// //   const [showBuyerPopup, setShowBuyerPopup] = useState(false);
// //   const [showSellerPopup, setShowSellerPopup] = useState(false);

// //   return (
// //     <div className="homepage-container">
// //       <div className="content">
// //         <div className="text-section">
// //           <h1>Welcome to Our Platform</h1>
// //           <p>Some information related to the project.</p>
// //           <div className="login-options">
// //             <button onClick={() => setShowBuyerPopup(true)}>
// //               Login as Buyer
// //             </button>
// //             <button onClick={() => setShowSellerPopup(true)}>
// //               Login as Seller
// //             </button>
// //           </div>
// //         </div>
// //         <div className="image-section">
// //           <img src={projectImage} alt="Project related" />
// //         </div>
// //       </div>

// //       {showBuyerPopup && (
// //         <LoginPopup userType="Buyer" onClose={() => setShowBuyerPopup(false)} />
// //       )}

// //       {showSellerPopup && (
// //         <LoginPopup
// //           userType="Seller"
// //           onClose={() => setShowSellerPopup(false)}
// //         />
// //       )}
// //     </div>
// //   );
// // };

// // export default HomePage;

// // import React, { useState } from "react";
// // import "./HomePage.css";
// // import LoginPopup from "./LoginPopup";

// // const HomePage = () => {
// //   const [showBuyerPopup, setShowBuyerPopup] = useState(false);
// //   const [showSellerPopup, setShowSellerPopup] = useState(false);

// //   return (
// //     <div className="homepage-container">
// //       <h1>Welcome to Our Platform</h1>
// //       <div className="login-options">
// //         <button onClick={() => setShowBuyerPopup(true)}>Login as Buyer</button>
// //         <button onClick={() => setShowSellerPopup(true)}>
// //           Login as Seller
// //         </button>
// //       </div>

// //       {showBuyerPopup && (
// //         <LoginPopup userType="Buyer" onClose={() => setShowBuyerPopup(false)} />
// //       )}

// //       {showSellerPopup && (
// //         <LoginPopup
// //           userType="Seller"
// //           onClose={() => setShowSellerPopup(false)}
// //         />
// //       )}
// //     </div>
// //   );
// // };

// // export default HomePage;

// API Configuration
const API_BASE_URL = "https://vehicle-auction-system-backend.onrender.com";

export const API_ENDPOINTS = {
  BASE_URL: API_BASE_URL,
  // Auth endpoints
  SIGNUP: `${API_BASE_URL}/auth/signup`,
  LOGIN: `${API_BASE_URL}/auth/login`,

  // Auction endpoints
  AUCTION_ITEMS: `${API_BASE_URL}/auth/auction-items`,
  AUCTION_ITEMS_SUMMARY: `${API_BASE_URL}/auth/auction-items/summary`,
  AUCTION_ITEMS_UPDATE: `${API_BASE_URL}/auth/auction-items/update`,

  // User endpoints
  PROFILE: (userId) => `${API_BASE_URL}/auth/profile/${userId}`,
  EDIT_PROFILE: (userId) => `${API_BASE_URL}/auth/editprofile/${userId}`,

  // Notifications
  NOTIFICATIONS: (userId) =>
    `${API_BASE_URL}/auth/notifications?userId=${userId}`,
  READ_NOTIFICATION: (id) => `${API_BASE_URL}/auth/notifications/${id}/read`,

  // Bids
  BIDS: `${API_BASE_URL}/auth/bids`,
  BID_HISTORY: (auctionId) => `${API_BASE_URL}/auth/bids/${auctionId}/bids`,

  // Admin
  ADMIN_USERS: `${API_BASE_URL}/admin/users`,
  ADMIN_CREATE_REP: `${API_BASE_URL}/admin/create-customer-rep`,
  ADMIN_SALES_REPORT: `${API_BASE_URL}/admin/sales-report`,

  // Questions
  QUESTIONS_UNANSWERED: (auctionId) =>
    `${API_BASE_URL}/questions/unanswered/${auctionId}`,

  // Sellers
  SELLER_ITEMS: (sellerId) =>
    `${API_BASE_URL}/auth/auction-items/summarySeller/${sellerId}`,
  SELLER_PROFILE: (sellerId) => `${API_BASE_URL}/auth/sellers/${sellerId}`,

  // Orders
  BUYER_ORDERS: (userId) =>
    `${API_BASE_URL}/auth/auction-items/buyer/${userId}/orders`,

  // Password
  NULL_PASSWORDS: `${API_BASE_URL}/auth/null-passwords`,
  PASSWORD_CHANGE: (userId) => `${API_BASE_URL}/auth/pwd_change/${userId}`,
  NULLIFY_PASSWORD: (userId) =>
    `${API_BASE_URL}/auth/nullify-password/${userId}`,
  UPDATE_PASSWORD: (userId) => `${API_BASE_URL}/update-password/${userId}`,
};

export default API_BASE_URL;

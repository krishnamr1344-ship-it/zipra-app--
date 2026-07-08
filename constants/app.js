export const APP_NAME = "Zipra";
export const APP_TAGLINE = "Fresh groceries in minutes";
export const APP_VERSION = "1.0.0";

export const BRAND = {
  name: APP_NAME,
  tagline: APP_TAGLINE,
  email: "support@zipra.app",
  phone: "+91 90000 00000",
};

export const DELIVERY = {
  etaMinutes: 10,
  minOrder: 99,
};

export const API_ENDPOINTS = {
  BANNERS: "/banners",
  CATEGORIES: "/categories",
  PRODUCTS: "/products",
  PRODUCT: (id) => `/products/${id}`,
  SEARCH: "/products",
  SUGGEST: "/suggest-product",
  CART: "/cart",
  CART_ITEM: (id) => `/cart/${id}`,
  ORDERS: "/orders",
  ORDER: (id) => `/orders/${id}`,
  ADDRESSES: "/addresses",
  ADDRESS_ITEM: (id) => `/addresses/${id}`,
  ADDRESS_DEFAULT: (id) => `/addresses/${id}/default`,
  WISHLIST: "/wishlist",
  WISHLIST_ITEM: (id) => `/wishlist/${id}`,
  NOTIFICATIONS: "/notifications",
  NOTIFICATION_READ: (id) => `/notifications/${id}/read`,
  PROFILE: "/auth/me",
  PROFILE_UPDATE: "/auth/profile",
  AUTH_LOGIN: "/auth/login",
  AUTH_REGISTER: "/auth/register",
  AUTH_LOGOUT: "/auth/logout",
  AUTH_REFRESH_TOKEN: "/auth/refresh",
  ANALYTICS: "/admin/stats",
};

export const DEFAULT_PAGE_SIZE = 20;

export const CURRENCY = "₹";
export const LOCALE = "en-IN";

export const PAYMENT_METHODS = [
  { id: "cod", label: "Cash on Delivery", icon: "cash", desc: "Pay when your order arrives" },
  { id: "razorpay", label: "Razorpay", icon: "card", desc: "UPI, Cards & Wallets" },
];

export const ORDER_STATUS = {
  placed: { label: "Order Placed", color: "muted" },
  confirmed: { label: "Confirmed", color: "primary" },
  out_for_delivery: { label: "Out for Delivery", color: "warning" },
  delivered: { label: "Delivered", color: "success" },
  cancelled: { label: "Cancelled", color: "destructive" },
};

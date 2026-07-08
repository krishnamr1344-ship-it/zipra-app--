import axios from "axios";
import { API_ENDPOINTS } from "@/constants/app";
import * as adapters from "./adapters";

const BASE_URL = "/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const AUTH_PATHS_PREFIXES = [
  "/auth/login",
  "/auth/register",
  "/auth/otp",
  "/admin",
];

api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    if (err.response?.status === 401 && !originalRequest._retry) {
      if (typeof window === "undefined") return Promise.reject(err); // Server-side, just reject

      const path = window.location.pathname;
      const isAuthPath = AUTH_PATHS_PREFIXES.some((p) => path.startsWith(p));

      if (isAuthPath) {
        return Promise.reject(err); // Don't try to refresh on auth pages
      }

      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = "Bearer " + token;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await api.post(API_ENDPOINTS.AUTH_REFRESH_TOKEN); // Assuming this endpoint exists
        const newToken = data?.token; // Assuming the refresh token endpoint returns a new JWT
        if (newToken) {
          // You would typically update a stored token here if frontend managed it
          // For HTTP-only cookies, the backend would just update the cookie.
          // We assume the backend updates the cookie and that subsequent requests will automatically use it.
          processQueue(null, newToken);
          // Retry the original request with the new token
          originalRequest.headers["Authorization"] = "Bearer " + newToken; // For completeness, though cookie might be primary
          return api(originalRequest);
        } else {
          throw new Error("No new token from refresh");
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        localStorage.removeItem("zipra-store"); // Clear cart/wishlist
        window.location.href = "/auth/login"; // Redirect to login
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(err);
  }
);

function q(params) {
  const p = {};
  if (!params) return p;
  if (params.category) p.category_id = params.category;
  if (params.q) p.search = params.q;
  if (params.sort === "price_asc") p.sort_by = "price_asc";
  if (params.sort === "price_desc") p.sort_by = "price_desc";
  if (params.sort === "rating") p.sort_by = "rating";
  if (params.limit) p.limit = params.limit;
  return p;
}

export const productsService = {
  async list(params = {}) {
    const { data } = await api.get(API_ENDPOINTS.PRODUCTS, { params: q(params) });
    return adapters.mapProducts(data);
  },
  async get(id) {
    const { data } = await api.get(API_ENDPOINTS.PRODUCT(id));
    return adapters.mapProduct(data);
  },
  async similar(id) {
    const { data } = await api.get(API_ENDPOINTS.PRODUCTS, {
      params: { similar_to: id, limit: 6 },
    });
    return adapters.mapProducts(data).filter((p) => p.id !== id);
  },
};

export const categoriesService = {
  async list() {
    const { data } = await api.get(API_ENDPOINTS.CATEGORIES);
    return adapters.mapCategories(data);
  },
};

export const bannersService = {
  async list() {
    const { data } = await api.get(API_ENDPOINTS.BANNERS);
    return adapters.mapBanners(data);
  },
};

export const searchService = {
  async suggest(query) {
    if (!query) return [];
    const { data } = await api.get(API_ENDPOINTS.SEARCH, {
      params: { search: query, limit: 6 },
    });
    return adapters.mapProducts(data);
  },
};

export const cartService = {
  async get() {
    const { data } = await api.get(API_ENDPOINTS.CART);
    return adapters.mapCart(data);
  },
  async add(productId, quantity = 1) {
    if (!productId || quantity < 1) {
      throw new Error("Invalid product or quantity");
    }
    const { data } = await api.post(API_ENDPOINTS.CART, {
      product_id: productId,
      quantity: Math.max(1, Math.floor(quantity)),
    });
    return adapters.mapCart(data);
  },
  async setQty(itemId, quantity) {
    if (!itemId) return cartService.get();
    const qty = Math.max(1, Math.floor(quantity));
    const { data } = await api.put(API_ENDPOINTS.CART_ITEM(itemId), {
      quantity: qty,
    });
    return adapters.mapCart(data);
  },
  async remove(itemId) {
    const { data } = await api.delete(API_ENDPOINTS.CART_ITEM(itemId));
    return adapters.mapCart(data);
  },
  async clear() {
    const { data } = await api.delete(API_ENDPOINTS.CART);
    return adapters.mapCart(data);
  },
};

export const wishlistService = {
  async list() {
    const { data } = await api.get(API_ENDPOINTS.WISHLIST);
    return adapters.mapWishlist(data);
  },
  async add(productId) {
    const { data } = await api.post(API_ENDPOINTS.WISHLIST, { product_id: productId });
    return adapters.mapWishlist(data);
  },
  async remove(productId) {
    const { data } = await api.delete(API_ENDPOINTS.WISHLIST_ITEM(productId));
    return adapters.mapWishlist(data);
  },
};

export const ordersService = {
  async list() {
    const { data } = await api.get(API_ENDPOINTS.ORDERS);
    return adapters.mapOrders(data);
  },
  async get(id) {
    const { data } = await api.get(API_ENDPOINTS.ORDER(id));
    return adapters.mapOrder(data);
  },
  async create({ addressId, paymentMethod, instructions }) {
    const { data } = await api.post(API_ENDPOINTS.ORDERS, {
      address_id: addressId,
      payment_method: paymentMethod,
      ...(instructions ? { delivery_instructions: instructions } : {}),
    });
    return adapters.mapOrder(data);
  },
};

export const paymentsService = {
  async createRazorpay(total) {
    const { data } = await api.post("/payments/create-order", {
      amount: Math.max(1, Math.round(total)),
      currency: "INR",
    });
    return data;
  },
  async verify(payload) {
    const { data } = await api.post("/payments/verify", payload);
    return data;
  },
  async process(payload) {
    const { data } = await api.post("/payments/process", payload);
    return data;
  },
};

export const notificationsService = {
  async list() {
    const { data } = await api.get(API_ENDPOINTS.NOTIFICATIONS);
    return adapters.mapNotifications(data);
  },
  async markRead(id) {
    await api.post(API_ENDPOINTS.NOTIFICATION_READ(id));
    return true;
  },
  async markAllRead() {
    await api.post(API_ENDPOINTS.NOTIFICATIONS + "/read-all");
    return true;
  },
};

export const addressesService = {
  async list() {
    const { data } = await api.get(API_ENDPOINTS.ADDRESSES);
    return adapters.mapAddresses(data);
  },
  async create(payload) {
    const { data } = await api.post(API_ENDPOINTS.ADDRESSES, payload);
    return adapters.mapAddress(data);
  },
  async setDefault(id) {
    const { data } = await api.post(API_ENDPOINTS.ADDRESS_DEFAULT(id));
    return adapters.mapAddress(data);
  },
};

export const profileService = {
  async me() {
    const { data } = await api.get(API_ENDPOINTS.PROFILE);
    return adapters.mapUser(data);
  },
  async update(payload) {
    const { data } = await api.put(API_ENDPOINTS.PROFILE_UPDATE, payload);
    return adapters.mapUser(data);
  },
};

export const authService = {
  async login(email, password) {
    const { data } = await api.post(API_ENDPOINTS.AUTH_LOGIN, { email, password });
    if (data?.error || !data?.user) {
      throw new Error(data?.detail || "Login failed");
    }
    return data;
  },
  async register(payload) {
    const { data } = await api.post(API_ENDPOINTS.AUTH_REGISTER, payload);
    if (data?.error) {
      throw new Error(data?.detail || "Registration failed");
    }
    return data;
  },
  async logout() {
    try {
      await api.post(API_ENDPOINTS.AUTH_LOGOUT);
    } finally {
      localStorage.removeItem("zipra-store");
    }
    return true;
  },
};

export const analyticsService = {
  async get() {
    const { data } = await api.get(API_ENDPOINTS.ANALYTICS);
    return data;
  },
};

export const adminUsersService = {
  async list() {
    const { data } = await api.get("/admin/users");
    const arr = Array.isArray(data) ? data : data?.items || data?.data || [];
    return arr.map((u) => ({
      id: u.id,
      name: u.name || u.email || "User",
      email: u.email || "",
      phone: u.phone || "",
      orders: u.orders_count ?? u.orders ?? 0,
      spent: u.total_spent ?? u.spent ?? 0,
      status: u.is_vip ? "VIP" : u.is_active === false ? "Inactive" : "Active",
    }));
  },
};

export const adminBannersService = {
  async list() {
    const { data } = await api.get("/admin/banners");
    const arr = Array.isArray(data) ? data : data?.items || data?.data || [];
    return arr.map((b) => ({
      id: b.id,
      title: b.title || "",
      status: b.is_active ? "Live" : "Scheduled",
      cta: b.cta || "Shop Now",
      gradient: b.color || "from-[#FF9A3D] to-[#F26400]",
    }));
  },
};

export const adminNotificationsService = {
  async list() {
    const { data } = await api.get("/admin/notifications");
    const arr = Array.isArray(data) ? data : data?.items || data?.data || [];
    return arr.map((n) => ({
      id: n.id,
      type: (n.type || "info").toLowerCase(),
      title: n.title || "",
      body: n.message || n.body || "",
      sent: n.created_at ? new Date(n.created_at).toLocaleDateString("en-IN") : "recent",
    }));
  },
};

export const services = {
  products: productsService,
  categories: categoriesService,
  banners: bannersService,
  search: searchService,
  cart: cartService,
  wishlist: wishlistService,
  orders: ordersService,
  payments: paymentsService,
  notifications: notificationsService,
  addresses: addressesService,
  profile: profileService,
  auth: authService,
  analytics: analyticsService,
  adminUsers: adminUsersService,
  adminBanners: adminBannersService,
  adminNotifications: adminNotificationsService,
};

export default api;

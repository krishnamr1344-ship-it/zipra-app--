const FALLBACK_IMG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect width='200' height='200' fill='%23FFF3E8'/%3E%3Ctext x='50%25' y='50%25' font-size='80' text-anchor='middle' dominant-baseline='central'%3E%F0%9F%9B%92%3C/text%3E%3C/svg%3E";

export function mapProduct(p) {
  if (!p) return null;
  const price = Number(p.final_price ?? p.price ?? 0);
  const mrp = Number(p.mrp ?? p.price ?? price);
  const pct = p.discount_percent ?? (mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0);
  return {
    id: p.id,
    name: p.name || "Untitled Product",
    category: p.category_id,
    categoryName: p.category_name || "",
    description: p.description || "",
    image: Array.isArray(p.images) && p.images.length ? p.images[0] : FALLBACK_IMG,
    images: Array.isArray(p.images) ? p.images : [],
    price,
    mrp,
    unit: p.unit || "",
    rating: p.rating ?? 4.5,
    reviews: p.reviews ?? 0,
    inStock: p.stock === undefined ? p.is_enabled !== false : p.stock > 0,
    stock: p.stock,
    discount_percent: pct,
    badge: pct > 0 ? `${pct}% OFF` : p.badge || null,
    tags: [],
  };
}

export function mapProducts(list) {
  const arr = Array.isArray(list) ? list : list?.items || list?.data || [];
  return arr.map(mapProduct).filter(Boolean);
}

export function mapCategory(c) {
  if (!c) return null;
  return {
    id: c.id,
    name: c.name || "Unnamed Category",
    emoji: "",
    color: "bg-primary-soft",
    image: c.image || FALLBACK_IMG,
  };
}

export function mapCategories(list) {
  const arr = Array.isArray(list) ? list : list?.items || list?.data || [];
  return arr.map(mapCategory).filter(Boolean);
}

export function mapBanner(b) {
  if (!b) return null;
  const colors = ["from-[#FF9A3D] to-[#F26400]", "from-[#FFB347] to-[#FF5E3A]", "from-[#FF7A00] to-[#E04E00]"];
  const hashVal = String(b.id || "").split("").reduce((h, c) => (h << 5) - h + c.charCodeAt(0), 0);
  return {
    id: b.id,
    title: b.title || "Promo Banner",
    subtitle: b.subtitle || "",
    cta: b.cta || "Shop Now",
    href: b.link || "/search",
    gradient: b.color || colors[Math.abs(hashVal) % colors.length],
    emoji: "🛒",
    image: b.image_url || "",
  };
}

export function mapBanners(list) {
  const arr = Array.isArray(list) ? list : list?.items || list?.data || [];
  return arr.map(mapBanner).filter(Boolean);
}

export function mapCartItem(it) {
  if (!it) return null;
  return {
    id: it.product_id,
    cartItemId: it.id,
    name: it.product_name || "Unknown Product",
    price: Number(it.product_price ?? 0),
    mrp: Number(it.product_mrp ?? it.product_price ?? 0),
    unit: it.product_unit || "",
    image: it.product_image || FALLBACK_IMG,
    qty: it.quantity ?? 1,
    subtotal: Number(it.subtotal ?? 0),
  };
}

export function mapCart(data) {
  const items = (data?.items || []).map(mapCartItem).filter(Boolean);
  return {
    items,
    total: Number(data?.total ?? items.reduce((s, i) => s + i.subtotal, 0)),
    count: items.reduce((s, i) => s + i.qty, 0),
  };
}

export function mapOrder(o) {
  if (!o) return null;
  const items = (o.items || []).map((it) => ({
    id: it.product_id || it.id,
    name: it.product_name || "Item",
    price: Number(it.product_price ?? it.price ?? 0),
    qty: it.quantity ?? 1,
    image: it.product_image || FALLBACK_IMG,
  }));
  const addr = o.delivery_address || {};
  return {
    id: o.id,
    placedAt: o.created_at,
    status: normalizeStatus(o.status),
    items,
    total: Number(o.total_amount ?? 0),
    deliveryFee: Number(o.delivery_fee ?? 0),
    paymentMethod: o.payment_method || "",
    eta: o.eta || "10 mins",
    address: {
      label: addr.label || addr.address_type || "Home",
      name: addr.name || "",
      line1: addr.address_line1 || "",
      line2: addr.address_line2 || "",
      city: addr.city || "",
      pincode: addr.pincode || "",
      isDefault: addr.is_default || false,
    },
  };
}

export function mapOrders(list) {
  const arr = Array.isArray(list) ? list : list?.items || list?.data || [];
  return arr.map(mapOrder).filter(Boolean);
}

export function normalizeStatus(s) {
  if (!s) return "PLACED";
  const v = String(s).toUpperCase().replace(/[\s_-]+/g, "_").replace(/_+$/, "");
  const map = {
    PLACED: "PLACED",
    CONFIRMED: "CONFIRMED",
    PACKED: "PACKED",
    OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY",
    DELIVERED: "DELIVERED",
    CANCELLED: "CANCELLED",
    CANCELED: "CANCELLED",
  };
  return map[v] || "PLACED";
}

export function mapNotification(n) {
  if (!n) return null;
  return {
    id: n.id,
    type: (n.type || "info").toLowerCase(),
    title: n.title || "Notification",
    body: n.message || "",
    read: !!n.is_read,
    createdAt: n.created_at,
  };
}

export function mapNotifications(list) {
  const arr = Array.isArray(list) ? list : list?.items || list?.data || [];
  return arr.map(mapNotification).filter(Boolean);
}

export function mapAddress(a) {
  if (!a) return null;
  return {
    id: a.id,
    label: a.label || a.address_type || "Home",
    name: a.name || "",
    line1: a.address_line1 || "",
    line2: [a.house_number, a.floor_number, a.landmark, a.address_line2].filter(Boolean).join(", "),
    city: a.city || "",
    state: a.state || "",
    pincode: a.pincode || "",
    isDefault: !!a.is_default,
    phone: a.phone || "",
  };
}

export function mapAddresses(list) {
  const arr = Array.isArray(list) ? list : list?.items || list?.data || [];
  return arr.map(mapAddress).filter(Boolean);
}

export function mapWishlistItem(w) {
  if (!w) return null;
  const price = Number(w.product_final_price ?? w.product_price ?? 0);
  const mrp = Number(w.product_price ?? price);
  return {
    id: w.product_id,
    name: w.product_name || "Unknown Product",
    price,
    mrp,
    unit: w.product_unit || "",
    image: w.product_image || FALLBACK_IMG,
  };
}

export function mapWishlist(list) {
  const arr = Array.isArray(list) ? list : list?.items || list?.data || [];
  return arr.map(mapWishlistItem).filter(Boolean);
}

export function mapUser(u) {
  if (!u) return null;
  return {
    id: u.id,
    name: u.name || "User",
    email: u.email || "",
    phone: u.phone || "",
    avatar: u.avatar || "",
  };
}

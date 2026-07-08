import { CURRENCY, LOCALE } from "@/constants/app";

export function formatPrice(value, withSymbol = true) {
  if (value == null || isNaN(value)) return withSymbol ? `${CURRENCY}0` : "0";
  const formatted = new Intl.NumberFormat(LOCALE, {
    maximumFractionDigits: 0,
  }).format(value);
  return withSymbol ? `${CURRENCY}${formatted}` : formatted;
}

export function formatDateString(date, opts) {
  return new Date(date).toLocaleDateString(
    LOCALE,
    opts || { day: "numeric", month: "short", year: "numeric" }
  );
}

export function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function discountPercent(price, mrp) {
  if (!mrp || mrp <= price) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}

export function timeAgo(date) {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return formatDateString(date);
}

export function groupByDate(items, getDate) {
  const groups = {};
  items.forEach((item) => {
    const d = new Date(getDate(item));
    const key = d.toDateString();
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  });
  return groups;
}

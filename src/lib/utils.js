import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

const DATE_FORMAT_OPTIONS = {
  day: "2-digit",
  month: "short",
  year: "numeric",
};

const DATE_TIME_FORMAT_OPTIONS = {
  ...DATE_FORMAT_OPTIONS,
  hour: "2-digit",
  minute: "2-digit",
};

export function formatDate(date) {
  if (!date) return "";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "Invalid Date";
  return d.toLocaleDateString("en-GB", DATE_FORMAT_OPTIONS);
}

export function formatDateTime(date) {
  if (!date) return "";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "Invalid Date";
  return d.toLocaleString("en-GB", DATE_TIME_FORMAT_OPTIONS);
}

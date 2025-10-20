import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value) {
  if (!value && value !== 0) return '$0'
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value)
}

export function formatDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function formatNumber(value) {
  if (!value) return ""
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
}

export function cleanNumber(value) {
  if (!value) return 0
  return parseFloat(value.toString().replace(/\./g, "")) || 0
}
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

export function formatDateToYYYYMMDD(dateString) {
  if (!dateString) return "";

  const date = new Date(dateString);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export function formatNumber(value) {
  if (!value) return ""
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
}

export function cleanNumber(value) {
  if (!value) return 0
  return parseFloat(value.toString().replace(/\./g, "")) || 0
}
// utils.js

export function numeroALetras(num) {
  if (typeof num !== "number") num = parseInt(num);

  const unidades = [
    "", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve"
  ];

  const especiales = [
    "diez", "once", "doce", "trece", "catorce", "quince",
    "dieciséis", "diecisiete", "dieciocho", "diecinueve"
  ];

  const decenas = [
    "", "", "veinte", "treinta", "cuarenta",
    "cincuenta", "sesenta", "setenta", "ochenta", "noventa"
  ];

  const centenas = [
    "", "ciento", "doscientos", "trescientos", "cuatrocientos",
    "quinientos", "seiscientos", "setecientos", "ochocientos", "novecientos"
  ];

  function convertirCentenas(n) {
    if (n === 0) return "";
    if (n === 100) return "cien";

    let c = Math.floor(n / 100);
    let d = Math.floor((n % 100) / 10);
    let u = n % 10;

    let texto = "";

    if (c > 0) texto += centenas[c] + " ";

    // Casos especiales 10–19
    if (d === 1) {
      texto += especiales[u];
      return texto.trim();
    }

    // Decenas
    if (d > 1) {
      if (u > 0) texto += `${decenas[d]} y ${unidades[u]}`;
      else texto += decenas[d];
      return texto.trim();
    }

    // Unidades
    if (d === 0 && u > 0) texto += unidades[u];

    return texto.trim();
  }

  function convertirMiles(n) {
    if (n < 1000) return convertirCentenas(n);

    let miles = Math.floor(n / 1000);
    let resto = n % 1000;

    let texto = "";

    if (miles === 1) texto += "mil";
    else texto += convertirCentenas(miles) + " mil";

    if (resto > 0) texto += " " + convertirCentenas(resto);

    return texto.trim();
  }

  function convertirMillones(n) {
    if (n < 1_000_000) return convertirMiles(n);

    let millones = Math.floor(n / 1_000_000);
    let resto = n % 1_000_000;

    let texto = "";

    if (millones === 1) texto += "un millón";
    else texto += convertirCentenas(millones) + " millones";

    if (resto > 0) texto += " " + convertirMiles(resto);

    return texto.trim();
  }

  if (num === 0) return "cero";
  return convertirMillones(num);
}


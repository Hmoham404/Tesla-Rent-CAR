export type { Vehicle } from './content-model';
export type Booking = {
  id: string;
  vehicleId: string;
  vehicleName: string;
  start: string;
  end: string;
  startTime?: string;
  endTime?: string;
  location: string;
  returnLocation?: string;
  name: string;
  email: string;
  phone: string;
  insurance: boolean;
  total: number;
  status: "En attente" | "Confirmée" | "Annulée";
  createdAt: string;
};
export const isDemo = import.meta.env.VITE_DATA_MODE !== "supabase";
export const address = import.meta.env.VITE_AGENCY_ADDRESS || "";
export const whatsapp = (import.meta.env.VITE_WHATSAPP || "").replace(
  /\D/g,
  "",
);
const key = "tesla-bookings-v1";
export function readBookings(): Booking[] {
  try {
    const stored = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}
export function writeBookings(bookings: Booking[]) {
  localStorage.setItem(key, JSON.stringify(bookings));
}
export async function api(path: string, data?: unknown, method = "POST") {
  const response = await fetch(`/api/${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    ...(data ? { body: JSON.stringify(data) } : {}),
  });
  const type = response.headers.get("content-type") || "";
  if (!type.includes("application/json"))
    throw new Error("L’API du site ne répond pas. Vérifiez le déploiement des fonctions dans Vercel.");
  const result = await response.json();
  if (!response.ok)
    throw new Error(result.error || "Le service est indisponible. Réessayez.");
  return result;
}
export async function saveBooking(booking: Booking): Promise<string> {
  if (isDemo) {
    writeBookings([booking, ...readBookings()]);
    return booking.id;
  }
  const result = await api("bookings", booking);
  return result.id;
}

import { Wrench, Droplets, Music, Cake, Paintbrush, Camera, Scissors, Car, Zap, Sparkles, type LucideIcon } from "lucide-react"

export const PLAN_PRECIO = 2.5 // S/ al mes para que un proveedor siga visible
export const YAPE_QR = "/images/yapepe.jpeg"

export const CATEGORIAS: { name: string; icon: LucideIcon; color: string }[] = [
  { name: "Carpintería", icon: Wrench, color: "bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300" },
  { name: "Fontanería", icon: Droplets, color: "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300" },
  { name: "Electricidad", icon: Zap, color: "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300" },
  { name: "DJ & Música", icon: Music, color: "bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300" },
  { name: "Repostería", icon: Cake, color: "bg-pink-100 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300" },
  { name: "Pintura", icon: Paintbrush, color: "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300" },
  { name: "Fotografía", icon: Camera, color: "bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300" },
  { name: "Peluquería", icon: Scissors, color: "bg-rose-100 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300" },
  { name: "Mecánica", icon: Car, color: "bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300" },
  { name: "Limpieza", icon: Sparkles, color: "bg-teal-100 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300" },
]

export const CIUDADES = [
  "Lima", "Arequipa", "Trujillo", "Chiclayo", "Piura", "Cusco", "Huancayo", "Iquitos", "Tacna", "Chimbote",
  "Callao", "Pucallpa", "Juliaca", "Cajamarca", "Ayacucho", "Puno", "Tarapoto", "Tumbes", "Ica", "Huaraz",
]

export type Perfil = {
  id: string
  name: string
  role: "user" | "provider" | "admin"
  avatar_url: string | null
  phone: string | null
  subscription_until: string | null
}

export type Proveedor = {
  id: string
  user_id: string
  name: string
  avatar_url: string | null
  category: string
  specialty: string
  description: string
  price_range: string
  city: string
  district: string
  lat: number | null
  lng: number | null
  whatsapp: string | null
  image_url: string | null
  available: boolean
  response_time: string
  rating_avg: number
  reviews_count: number
}

export function iniciales(nombre: string) {
  return nombre.split(" ").filter(Boolean).slice(0, 2).map((n) => n[0]?.toUpperCase()).join("")
}

export function distanciaKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371
  const rad = (x: number) => (x * Math.PI) / 180
  const dLat = rad(b.lat - a.lat)
  const dLng = rad(b.lng - a.lng)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
}

export function formatoDistancia(km: number | null) {
  if (km == null) return "-"
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`
}

export function enlaceWhatsapp(numero: string, texto: string) {
  let d = numero.replace(/\D/g, "")
  if (d.length === 9) d = "51" + d
  return `https://wa.me/${d}?text=${encodeURIComponent(texto)}`
}

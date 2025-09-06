"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/header"

export default function ProviderManagePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [specialty, setSpecialty] = useState("")
  const [priceRange, setPriceRange] = useState("")
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    // Verify session
    async function check() {
      const res = await fetch("/api/auth/me", { cache: "no-store" })
      const data = await res.json()
      if (!data?.user) router.push("/login?redirect=/providers/manage")
      setLoading(false)
    }
    check()
  }, [router])

  async function detectLocation() {
    setError(null)
    if (!("geolocation" in navigator)) {
      setError("La geolocalización no está soportada en este dispositivo")
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
      },
      () => setError("No se pudo obtener tu ubicación"),
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const res = await fetch("/api/providers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ specialty, priceRange, location }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data?.error || "Error guardando perfil de proveedor")
      return
    }
    setSaved(true)
  }

  if (loading) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      <div className="mx-auto max-w-lg p-6">
        <h1 className="text-2xl font-bold mb-2">Perfil de Proveedor</h1>
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
          Tienes 30 días de prueba. Luego, $2.50/mes para seguir visible.
        </p>
        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
        {saved && <p className="text-green-600 text-sm mb-2">Guardado correctamente.</p>}
        <form onSubmit={onSave} className="space-y-3">
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Especialidad (ej. Fontanería, Repostería)"
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
          />
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Rango de precios (ej. $20-50)"
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
          />
          <div className="flex items-center gap-2">
            <button type="button" onClick={detectLocation} className="px-3 py-2 border rounded">
              Detectar ubicación
            </button>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {location ? `(${location.lat.toFixed(4)}, ${location.lng.toFixed(4)})` : "Sin ubicación"}
            </span>
          </div>
          <button className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-2 rounded" type="submit">
            Guardar
          </button>
        </form>
      </div>
    </div>
  )
}



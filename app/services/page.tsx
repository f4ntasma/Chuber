"use client"
import { useEffect, useState } from "react"
import Header from "@/components/header"
import { LikeButton } from "@/components/ui/like-button"
import { ChatModal } from "@/components/ui/chat-modal"

type Provider = {
  id: string
  userId?: string
  name: string
  specialty?: string
  priceRange?: string
  image?: string
  rating?: number
  reviews?: number
}

export default function ServicesPage() {
  const [providers, setProviders] = useState<Provider[]>([])
  const [likes, setLikes] = useState<string[]>([])
  const [chatWith, setChatWith] = useState<{ userId: string; name: string } | null>(null)
  const [loading, setLoading] = useState(true)

    useEffect(() => {
      async function load() {
        try {
          const [provRes, likesRes] = await Promise.all([
            fetch("/api/providers"),
            fetch("/api/likes").catch(() => null),
          ])
          const data = await provRes.json()
          console.log("📦 Providers:", data) // revisa qué viene aquí
          setProviders(data.providers || [])
          if (likesRes && likesRes.ok) {
            const l = await likesRes.json()
            setLikes(l.likes || [])
          }
        } finally {
          setLoading(false)
        }
      }
      load()
    }, [])
    

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Servicios</h1>
        <p className="text-gray-700 dark:text-gray-300 mb-6">Explora una vista general de proveedores disponibles cerca de ti.</p>
        {loading ? (
          <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
        ) : providers.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">Aún no hay proveedores registrados. ¡Sé el primero!</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {providers.map((p) => (
              <div key={p.id} className="bg-white/80 dark:bg-gray-800/80 p-4 rounded-xl shadow">
                <div className="flex items-center gap-3">
                  <img
                    src={p.image ?? "/default-avatar.png"}  
                    alt={p.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />

                  <div>
                    <h3 className="font-semibold">{p.name}</h3>
                    <p className="text-sm text-orange-600 dark:text-orange-400">{p.specialty || "Servicios"}</p>
                  </div>
                </div>
                <button
                  onClick={async () => {
                    await fetch("/api/likes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ providerId: p.id }) })
                    setLikes((prev) => (prev.includes(p.id) ? prev.filter((i) => i !== p.id) : [...prev, p.id]))
                  }}
                  className={`mt-3 text-sm ${likes.includes(p.id as any) ? "text-red-500" : "text-gray-600 dark:text-gray-300"}`}
                >
                  {likes.includes(p.id as any) ? "Quitar like" : "Dar like"}
                </button>
                <div className="mt-3 text-sm text-gray-600 dark:text-gray-300">Precio: {p.priceRange || "A convenir"}</div>
                {p.rating && (
                  <div className="text-sm text-gray-600 dark:text-gray-300">Calificación: {p.rating} ({p.reviews})</div>
                )}
                <div className="flex items-center gap-2 mt-4">
                  <LikeButton providerId={p.id} initial={likes.includes(p.id as any)} />
                  <button
                  onClick={async () => {
                    const me = await fetch("/api/auth/me").then((r) => r.json())
                    if (!me?.user) {
                      window.location.href = "/login?redirect=/services"
                      return
                    }
                    if (p.userId) setChatWith({ userId: p.userId, name: p.name })
                  }}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white py-2 rounded"
                >
                  Contactar
                </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <ChatModal open={!!chatWith} onClose={() => setChatWith(null)} withUserId={chatWith?.userId || ""} withName={chatWith?.name || ""} />
    </div>
  )
}



"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Heart, X, ExternalLink } from "lucide-react"
import { supabaseBrowser } from "@/lib/supabase/client"
import { useSesion } from "@/components/session-provider"

type Favorito = { provider_id: string; created_at: string; provider: { category: string; image_url: string | null; profile: { name: string; avatar_url: string | null } } | null }

export function Likes() {
  const supabase = supabaseBrowser()
  const { user } = useSesion()
  const [isOpen, setIsOpen] = useState(false)
  const [favoritos, setFavoritos] = useState<Favorito[]>([])

  async function cargar() {
    const { data } = await supabase
      .from("likes")
      .select("provider_id, created_at, provider:providers(category, image_url, profile:profiles(name, avatar_url))")
      .order("created_at", { ascending: false })
    setFavoritos((data ?? []) as unknown as Favorito[])
  }

  useEffect(() => {
    if (user) cargar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  async function quitar(providerId: string) {
    if (!user) return
    await supabase.from("likes").delete().eq("user_id", user.id).eq("provider_id", providerId)
    setFavoritos((prev) => prev.filter((f) => f.provider_id !== providerId))
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={() => {
          if (!isOpen) cargar()
          setIsOpen(!isOpen)
        }}
        aria-label="Mis favoritos"
        className="relative p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
      >
        <Heart className="h-5 w-5" />
        {favoritos.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {favoritos.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-12 right-0 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
          <div className="flex items-center justify-between p-3 border-b dark:border-gray-700">
            <h3 className="font-semibold">Mis favoritos</h3>
            <button onClick={() => setIsOpen(false)} aria-label="Cerrar" className="text-gray-500 hover:text-gray-700">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {favoritos.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <Heart className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>No tienes favoritos guardados</p>
                <p className="text-xs mt-1">Explora servicios y marca el corazón</p>
              </div>
            ) : (
              favoritos.map((f) => (
                <div key={f.provider_id} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3">
                  <img
                    src={f.provider?.image_url || f.provider?.profile.avatar_url || "/placeholder-user.jpg"}
                    alt=""
                    className="h-8 w-8 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{f.provider?.profile.name}</p>
                    <p className="text-xs text-gray-500 truncate">{f.provider?.category}</p>
                  </div>
                  <Link href={`/proveedor/${f.provider_id}`} onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-blue-500" aria-label="Ver ficha">
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                  <button onClick={() => quitar(f.provider_id)} className="text-gray-400 hover:text-red-500" aria-label="Quitar de favoritos">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))
            )}
          </div>

          {favoritos.length > 0 && (
            <div className="p-3 border-t dark:border-gray-700">
              <Link href="/likes" onClick={() => setIsOpen(false)} className="block w-full text-center text-sm text-orange-600 dark:text-orange-400">
                Ver todos mis favoritos
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

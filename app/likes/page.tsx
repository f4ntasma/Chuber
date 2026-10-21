"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Header from "@/components/header"
import { ProviderCard } from "@/components/provider-card"
import { ChatModal } from "@/components/ui/chat-modal"
import { useFavoritos } from "@/hooks/use-favoritos"
import { supabaseBrowser } from "@/lib/supabase/client"
import type { Proveedor } from "@/lib/data"

export default function LikesPage() {
  const { ids, alternar } = useFavoritos()
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [cargando, setCargando] = useState(true)
  const [chat, setChat] = useState<{ id: string; name: string } | null>(null)

  useEffect(() => {
    const lista = [...ids]
    if (lista.length === 0) {
      setProveedores([])
      setCargando(false)
      return
    }
    supabaseBrowser().from("provider_cards").select("*").in("id", lista).then(({ data }) => {
      setProveedores((data ?? []) as Proveedor[])
      setCargando(false)
    })
  }, [ids])

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Mis favoritos</h1>
        {cargando ? null : proveedores.length === 0 ? (
          <p className="text-gray-700 dark:text-gray-300">
            Aún no tienes favoritos. <Link href="/services" className="text-orange-600 underline">Explora servicios</Link> y marca el corazón.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {proveedores.map((p) => (
              <ProviderCard
                key={p.id}
                proveedor={p}
                distancia="-"
                favorito={ids.has(p.id)}
                onFavorito={() => alternar(p.id)}
                onContactar={() => setChat({ id: p.user_id, name: p.name })}
              />
            ))}
          </div>
        )}
      </div>
      {chat && <ChatModal open onClose={() => setChat(null)} withUserId={chat.id} withName={chat.name} />}
    </div>
  )
}

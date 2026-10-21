"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Bell, Heart, MessageCircle, CreditCard, Star, X } from "lucide-react"
import { supabaseBrowser } from "@/lib/supabase/client"
import { useSesion } from "@/components/session-provider"

type Notificacion = {
  id: string
  type: "like" | "message" | "payment" | "review"
  message: string
  link: string | null
  read: boolean
  created_at: string
}

const ICONOS = {
  like: <Heart className="h-4 w-4 text-red-500 mt-0.5" />,
  message: <MessageCircle className="h-4 w-4 text-blue-500 mt-0.5" />,
  payment: <CreditCard className="h-4 w-4 text-green-500 mt-0.5" />,
  review: <Star className="h-4 w-4 text-yellow-500 mt-0.5" />,
}

export function Notifications() {
  const supabase = supabaseBrowser()
  const { user } = useSesion()
  const [isOpen, setIsOpen] = useState(false)
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([])

  const cargar = useCallback(async () => {
    const { data } = await supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(30)
    setNotificaciones((data ?? []) as Notificacion[])
  }, [supabase])

  useEffect(() => {
    if (!user) return
    cargar()
    const canal = supabase
      .channel(`notificaciones-${user.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` }, () => cargar())
      .subscribe()
    return () => {
      supabase.removeChannel(canal)
    }
  }, [supabase, user, cargar])

  async function marcarTodas() {
    await supabase.from("notifications").update({ read: true }).eq("read", false)
    setNotificaciones((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  async function marcar(id: string) {
    await supabase.from("notifications").update({ read: true }).eq("id", id)
    setNotificaciones((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    setIsOpen(false)
  }

  const noLeidas = notificaciones.filter((n) => !n.read).length

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Notificaciones${noLeidas ? `, ${noLeidas} sin leer` : ""}`}
        className="relative p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
      >
        <Bell className="h-5 w-5" />
        {noLeidas > 0 && (
          <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {noLeidas}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-12 right-0 w-80 max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
          <div className="flex items-center justify-between p-3 border-b dark:border-gray-700">
            <h3 className="font-semibold">Notificaciones</h3>
            <div className="flex items-center gap-3">
              {noLeidas > 0 && (
                <button onClick={marcarTodas} className="text-xs text-orange-600 hover:underline">Marcar todas</button>
              )}
              <button onClick={() => setIsOpen(false)} aria-label="Cerrar" className="text-gray-500 hover:text-gray-700">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notificaciones.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No tienes notificaciones</div>
            ) : (
              notificaciones.map((n) => (
                <Link
                  key={n.id}
                  href={n.link || "#"}
                  onClick={() => marcar(n.id)}
                  className={`block p-3 hover:bg-gray-50 dark:hover:bg-gray-700 ${!n.read ? "bg-orange-50 dark:bg-orange-900/20" : ""}`}
                >
                  <div className="flex items-start gap-2">
                    {ICONOS[n.type]}
                    <div className="flex-1">
                      <div className="text-sm">{n.message}</div>
                      <div className="text-xs text-gray-500 mt-1">{new Date(n.created_at).toLocaleString("es-PE")}</div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

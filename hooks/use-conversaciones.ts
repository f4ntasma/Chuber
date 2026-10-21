"use client"

import { useCallback, useEffect, useState } from "react"
import { supabaseBrowser } from "@/lib/supabase/client"
import { useSesion } from "@/components/session-provider"

export type Conversacion = {
  other_id: string
  name: string
  avatar_url: string | null
  last_content: string
  last_at: string
  unread: number
}

/** Conversaciones del usuario, actualizadas al llegar mensajes nuevos. */
export function useConversaciones() {
  const supabase = supabaseBrowser()
  const { user } = useSesion()
  const [conversaciones, setConversaciones] = useState<Conversacion[]>([])

  const cargar = useCallback(async () => {
    if (!user) return setConversaciones([])
    const { data } = await supabase.rpc("my_conversations")
    setConversaciones((data ?? []) as Conversacion[])
  }, [supabase, user])

  useEffect(() => {
    cargar()
    if (!user) return
    const canal = supabase
      .channel(`conversaciones-${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, () => cargar())
      .subscribe()
    return () => {
      supabase.removeChannel(canal)
    }
  }, [supabase, user, cargar])

  return { conversaciones, recargar: cargar, noLeidos: conversaciones.reduce((s, c) => s + Number(c.unread), 0) }
}

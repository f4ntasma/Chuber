"use client"

import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import { supabaseBrowser } from "@/lib/supabase/client"
import { useSesion } from "@/components/session-provider"

/** IDs de proveedores marcados como favoritos por el usuario actual. */
export function useFavoritos() {
  const supabase = supabaseBrowser()
  const { user } = useSesion()
  const [ids, setIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!user) return setIds(new Set())
    supabase.from("likes").select("provider_id").then(({ data }) => {
      setIds(new Set((data ?? []).map((l: { provider_id: string }) => l.provider_id)))
    })
  }, [supabase, user])

  const alternar = useCallback(async (providerId: string) => {
    if (!user) {
      window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`
      return
    }
    const yaEsta = ids.has(providerId)
    setIds((prev) => {
      const nuevo = new Set(prev)
      if (yaEsta) nuevo.delete(providerId)
      else nuevo.add(providerId)
      return nuevo
    })
    const { error } = yaEsta
      ? await supabase.from("likes").delete().eq("user_id", user.id).eq("provider_id", providerId)
      : await supabase.from("likes").insert({ user_id: user.id, provider_id: providerId })
    if (error) {
      toast.error("No se pudo actualizar tus favoritos")
      setIds((prev) => {
        const nuevo = new Set(prev)
        if (yaEsta) nuevo.add(providerId)
        else nuevo.delete(providerId)
        return nuevo
      })
    }
  }, [supabase, user, ids])

  return { ids, alternar }
}

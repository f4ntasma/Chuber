"use client"

import { createContext, useCallback, useContext, useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { supabaseBrowser } from "@/lib/supabase/client"
import type { Perfil } from "@/lib/data"

type Sesion = {
  user: User | null
  perfil: Perfil | null
  cargando: boolean
  recargarPerfil: () => Promise<void>
  salir: () => Promise<void>
}

const SesionContext = createContext<Sesion>({
  user: null,
  perfil: null,
  cargando: true,
  recargarPerfil: async () => {},
  salir: async () => {},
})

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const supabase = supabaseBrowser()
  const [user, setUser] = useState<User | null>(null)
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [cargando, setCargando] = useState(true)

  const cargarPerfil = useCallback(async (u: User | null) => {
    if (!u) return setPerfil(null)
    const { data } = await supabase.from("profiles").select("*").eq("id", u.id).single()
    setPerfil(data as Perfil | null)
  }, [supabase])

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user)
      await cargarPerfil(data.user)
      setCargando(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_evento, sesion) => {
      setUser(sesion?.user ?? null)
      cargarPerfil(sesion?.user ?? null)
    })
    return () => sub.subscription.unsubscribe()
  }, [supabase, cargarPerfil])

  return (
    <SesionContext.Provider
      value={{
        user,
        perfil,
        cargando,
        recargarPerfil: () => cargarPerfil(user),
        salir: async () => {
          await supabase.auth.signOut()
          window.location.href = "/"
        },
      }}
    >
      {children}
    </SesionContext.Provider>
  )
}

export const useSesion = () => useContext(SesionContext)

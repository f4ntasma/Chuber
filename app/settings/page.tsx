"use client"

import { useState } from "react"
import { useTheme } from "next-themes"
import { toast } from "sonner"
import Header from "@/components/header"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useSesion } from "@/components/session-provider"
import { supabaseBrowser } from "@/lib/supabase/client"

export default function SettingsPage() {
  const { user } = useSesion()
  const { theme, setTheme } = useTheme()
  const [password, setPassword] = useState("")
  const [cambiando, setCambiando] = useState(false)

  async function cambiarClave(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) return toast.error("Usa al menos 8 caracteres")
    setCambiando(true)
    const { error } = await supabaseBrowser().auth.updateUser({ password })
    setCambiando(false)
    if (error) return toast.error("No se pudo cambiar la contraseña")
    setPassword("")
    toast.success("Contraseña actualizada")
  }

  async function eliminarCuenta() {
    if (!user || !confirm("¿Seguro? Se borrarán tu perfil, ficha, mensajes y favoritos. No se puede deshacer.")) return
    const supabase = supabaseBrowser()
    await supabase.storage.from("avatars").remove([`${user.id}/perfil.jpg`, `${user.id}/servicio.jpg`])
    const { error } = await supabase.rpc("delete_my_account")
    if (error) return toast.error("No se pudo eliminar la cuenta")
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      <div className="mx-auto max-w-lg p-6 space-y-8">
        <h1 className="text-2xl font-bold">Configuración</h1>

        <section className="space-y-3">
          <h2 className="font-semibold">Apariencia</h2>
          <div className="flex gap-2">
            {[["light", "Claro"], ["dark", "Oscuro"], ["system", "Como el sistema"]].map(([valor, etiqueta]) => (
              <Button key={valor} type="button" variant={theme === valor ? "default" : "outline"} onClick={() => setTheme(valor)}>
                {etiqueta}
              </Button>
            ))}
          </div>
        </section>

        <form onSubmit={cambiarClave} className="space-y-3">
          <h2 className="font-semibold">Cambiar contraseña</h2>
          <Label htmlFor="password" className="sr-only">Nueva contraseña</Label>
          <Input id="password" type="password" autoComplete="new-password" placeholder="Nueva contraseña" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button disabled={cambiando} type="submit" className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
            {cambiando ? "Guardando..." : "Actualizar contraseña"}
          </Button>
        </form>

        <section className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-2 text-red-600">Zona de peligro</h2>
          <button onClick={eliminarCuenta} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">
            Eliminar cuenta
          </button>
        </section>
      </div>
    </div>
  )
}

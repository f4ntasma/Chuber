"use client"

import { useState } from "react"
import Header from "@/components/header"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { supabaseBrowser } from "@/lib/supabase/client"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmar, setConfirmar] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function guardar(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) return setError("Usa al menos 8 caracteres.")
    if (password !== confirmar) return setError("Las contraseñas no coinciden.")
    setLoading(true)
    const { error } = await supabaseBrowser().auth.updateUser({ password })
    setLoading(false)
    if (error) return setError("El enlace venció o ya se usó. Pide uno nuevo.")
    window.location.href = "/"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      <div className="mx-auto max-w-md p-6 pt-16">
        <h1 className="text-2xl font-bold mb-4">Nueva contraseña</h1>
        <form onSubmit={guardar} className="space-y-4">
          {error && <div role="alert" className="text-red-600 text-sm">{error}</div>}
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña nueva</Label>
            <Input id="password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmar">Repite la contraseña</Label>
            <Input id="confirmar" type="password" autoComplete="new-password" value={confirmar} onChange={(e) => setConfirmar(e.target.value)} required />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white">
            {loading ? "Guardando..." : "Guardar contraseña"}
          </Button>
        </form>
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Header from "@/components/header"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { supabaseBrowser } from "@/lib/supabase/client"
import { PLAN_PRECIO } from "@/lib/data"

export default function RegisterPage() {
  const params = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [enviado, setEnviado] = useState<string | null>(null)
  const [cargando, setCargando] = useState(false)
  const [asProvider, setAsProvider] = useState(params.get("proveedor") === "1")

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const form = new FormData(e.currentTarget)
    const email = String(form.get("email") || "").trim()
    const password = String(form.get("password") || "")
    if (password.length < 8) return setError("La contraseña debe tener al menos 8 caracteres.")
    setCargando(true)
    const { data, error } = await supabaseBrowser().auth.signUp({
      email,
      password,
      options: {
        data: { name: String(form.get("name") || "").trim(), role: asProvider ? "provider" : "user" },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${asProvider ? "/providers/manage" : "/"}`,
      },
    })
    setCargando(false)
    if (error) {
      setError(error.message.includes("already") ? "Ese correo ya tiene una cuenta. Inicia sesión." : "No se pudo crear la cuenta. Intenta de nuevo.")
      return
    }
    if (data.session) {
      window.location.href = asProvider ? "/providers/manage" : "/"
      return
    }
    setEnviado(email)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      <div className="mx-auto max-w-md p-6 pt-16">
        <h1 className="text-2xl font-bold mb-4">Crear cuenta</h1>
        {enviado ? (
          <div className="rounded-lg bg-white/80 dark:bg-gray-800/80 p-6 space-y-2">
            <p className="font-semibold">Revisa tu correo</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Enviamos un enlace de confirmación a <strong>{enviado}</strong>. Ábrelo para activar tu cuenta (revisa también spam).
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            {error && <p role="alert" className="text-red-600 text-sm">{error}</p>}
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" name="name" autoComplete="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo</Label>
              <Input id="email" name="email" type="email" autoComplete="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña (mínimo 8 caracteres)</Label>
              <Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
            </div>
            <label className="flex items-start gap-2 text-sm">
              <input type="checkbox" className="mt-1 accent-orange-500 h-4 w-4" checked={asProvider} onChange={(e) => setAsProvider(e.target.checked)} />
              <span>Quiero ofrecer mis servicios (30 días gratis, luego S/ {PLAN_PRECIO.toFixed(2)} al mes)</span>
            </label>
            <Button disabled={cargando} className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white" type="submit">
              {cargando ? "Creando cuenta..." : "Registrarme"}
            </Button>
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              ¿Ya tienes cuenta? <Link href="/login" className="text-orange-500 hover:underline">Inicia sesión</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}

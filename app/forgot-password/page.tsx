"use client"

import { useState } from "react"
import Link from "next/link"
import Header from "@/components/header"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { supabaseBrowser } from "@/lib/supabase/client"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabaseBrowser().auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    })
    setLoading(false)
    if (error) setError("No pudimos enviar el correo. Intenta en unos minutos.")
    else setEnviado(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      <div className="mx-auto max-w-md p-6 pt-16">
        <h1 className="text-2xl font-bold mb-4">Recuperar contraseña</h1>
        {enviado ? (
          <p className="text-gray-700 dark:text-gray-300">
            Si <strong>{email}</strong> tiene una cuenta, te llegará un enlace para crear una contraseña nueva. Revisa también spam.
          </p>
        ) : (
          <form onSubmit={enviar} className="space-y-4">
            {error && <div role="alert" className="text-red-600 text-sm">{error}</div>}
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white">
              {loading ? "Enviando..." : "Enviarme el enlace"}
            </Button>
          </form>
        )}
        <div className="text-center mt-4">
          <Link href="/login" className="text-orange-600 hover:underline">Volver al login</Link>
        </div>
      </div>
    </div>
  )
}

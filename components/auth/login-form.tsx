"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Mail, Lock } from "lucide-react"
import { LoginCharacter } from "@/components/ui/login-character"
import { supabaseBrowser } from "@/lib/supabase/client"

export function LoginForm({ redirect = "/" }: { redirect?: string }) {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await supabaseBrowser().auth.signInWithPassword(formData)
    setLoading(false)
    if (error) {
      setError(error.message === "Email not confirmed"
        ? "Confirma tu correo antes de entrar (revisa tu bandeja y spam)."
        : "Correo o contraseña incorrectos.")
      return
    }
    // Recarga completa para que el middleware y el servidor vean la sesión nueva
    window.location.href = redirect.startsWith("/") ? redirect : "/"
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <LoginCharacter email={formData.email} password={formData.password} showPassword={showPassword} />
      <div className="space-y-2">
        <Label htmlFor="email">Correo electrónico</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="tu@email.com"
            className="pl-10"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            className="pl-10 pr-10"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            className="absolute right-0 top-0 h-full px-3"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {error && <div role="alert" className="text-sm text-red-600">{error}</div>}
      <Button disabled={loading} type="submit" className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600">
        {loading ? "Ingresando..." : "Iniciar sesión"}
      </Button>

      <div className="text-center text-sm text-gray-600 dark:text-gray-400 space-y-2">
        <div>
          ¿No tienes cuenta?{" "}
          <Link href="/register" className="text-orange-500 hover:underline">Regístrate</Link>
        </div>
        <div>
          <Link href="/forgot-password" className="text-orange-500 hover:underline">¿Olvidaste tu contraseña?</Link>
        </div>
      </div>
    </form>
  )
}

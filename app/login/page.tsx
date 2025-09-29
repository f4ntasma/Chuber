"use client"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import { LoginForm } from "@/components/auth/login-form"
import Header from "@/components/header"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect") || "/"

  const [error, setError] = useState<string | null>(null)

  async function onSubmit(credentials: { email: string; password: string }) {
    setError(null)
    
    // Crear un formulario temporal para enviar los datos
    const form = document.createElement('form')
    form.method = 'POST'
    form.action = '/api/auth/login'
    form.style.display = 'none'
    
    const emailInput = document.createElement('input')
    emailInput.name = 'email'
    emailInput.value = credentials.email
    form.appendChild(emailInput)
    
    const passwordInput = document.createElement('input')
    passwordInput.name = 'password'
    passwordInput.value = credentials.password
    form.appendChild(passwordInput)
    
    const redirectInput = document.createElement('input')
    redirectInput.name = 'redirect'
    redirectInput.value = redirect || "/"
    form.appendChild(redirectInput)
    
    document.body.appendChild(form)
    form.submit()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      <div className="mx-auto max-w-md p-6">
        <h1 className="text-2xl font-bold mb-4">Iniciar sesión</h1>
        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
        {/* Reuse LoginForm but intercept submit via props-less approach: clone via wrapper */}
        <LoginFormWithHandler onSubmit={onSubmit} />
      </div>
    </div>
  )
}

function LoginFormWithHandler({ onSubmit }: { onSubmit: (c: { email: string; password: string }) => void }) {
  // Lightweight wrapper around existing LoginForm code to capture submit
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit({ email, password })
      }}
      className="space-y-4"
    >
      {/* Inline simple inputs to avoid modifying shared component right now */}
      <input
        className="w-full border rounded px-3 py-2"
        placeholder="Correo electrónico"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      
      {/* Campo de contraseña con previsualizador */}
      <div className="relative">
        <input
          className="w-full border rounded px-3 py-2 pr-10"
          placeholder="Contraseña"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      
      <button className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-2 rounded" type="submit">
        Iniciar sesión
      </button>
    </form>
  )
}



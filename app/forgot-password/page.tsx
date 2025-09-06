"use client"
import { useState } from "react"
import Header from "@/components/header"

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [code, setCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function sendCode() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, phone }),
      })
      if (res.ok) {
        setStep(2)
      } else {
        const data = await res.json()
        setError(data.error || "Error enviando código")
      }
    } catch {
      setError("Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  async function resetPassword() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword }),
      })
      if (res.ok) {
        alert("Contraseña actualizada. Inicia sesión con tu nueva contraseña.")
        window.location.href = "/login"
      } else {
        const data = await res.json()
        setError(data.error || "Error actualizando contraseña")
      }
    } catch {
      setError("Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      <div className="mx-auto max-w-md p-6">
        <h1 className="text-2xl font-bold mb-4">Recuperar contraseña</h1>
        {error && <div className="text-red-600 text-sm mb-4">{error}</div>}
        
        {step === 1 ? (
          <div className="space-y-4">
            <input
              className="w-full border rounded px-3 py-2"
              placeholder="Correo electrónico"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="w-full border rounded px-3 py-2"
              placeholder="Número de teléfono"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <button
              onClick={sendCode}
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-2 rounded"
            >
              {loading ? "Enviando..." : "Enviar código por SMS"}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Código enviado a {phone}</p>
            <input
              className="w-full border rounded px-3 py-2"
              placeholder="Código de 6 dígitos"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={6}
            />
            <input
              className="w-full border rounded px-3 py-2"
              placeholder="Nueva contraseña"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button
              onClick={resetPassword}
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-2 rounded"
            >
              {loading ? "Actualizando..." : "Actualizar contraseña"}
            </button>
          </div>
        )}
        
        <div className="text-center mt-4">
          <a href="/login" className="text-orange-600 hover:underline">Volver al login</a>
        </div>
      </div>
    </div>
  )
}

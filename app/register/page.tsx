"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/header"

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [asProvider, setAsProvider] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const payload = {
      name: String(formData.get("name") || ""),
      email: String(formData.get("email") || ""),
      password: String(formData.get("password") || ""),
      asProvider,
    }
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data?.error || "Error registrando usuario")
      return
    }
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      <div className="mx-auto max-w-md p-6">
        <h1 className="text-2xl font-bold mb-4">Crear cuenta</h1>
        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
        <form onSubmit={onSubmit} className="space-y-3">
          <input className="w-full border rounded px-3 py-2" name="name" placeholder="Nombre" />
          <input className="w-full border rounded px-3 py-2" name="email" type="email" placeholder="Correo" required />
          <input className="w-full border rounded px-3 py-2" name="password" type="password" placeholder="Contraseña" required />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={asProvider} onChange={(e) => setAsProvider(e.target.checked)} />
            Registrarme como proveedor (30 días gratis, luego $2.50/mes)
          </label>
          <button className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-2 rounded" type="submit">
            Registrarme
          </button>
        </form>
      </div>
    </div>
  )
}



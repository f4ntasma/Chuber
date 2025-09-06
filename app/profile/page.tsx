"use client"
import { useEffect, useState } from "react"
import Header from "@/components/header"
import { useRouter } from "next/navigation"

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [image, setImage] = useState("")
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    async function load() {
      const me = await fetch("/api/auth/me")
      const meData = await me.json()
      if (!meData?.user) {
        router.push("/login?redirect=/profile")
        return
      }
      const res = await fetch("/api/user")
      if (!res.ok) {
        setError("No se pudo cargar el perfil")
      } else {
        const data = await res.json()
        setName(data.user?.name || "")
        setEmail(data.user?.email || "")
        setImage(data.user?.image || "")
      }
      setLoading(false)
    }
    load()
  }, [router])

  async function onSave(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const res = await fetch("/api/user", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, image }),
    })
    if (!res.ok) setError("No se pudo guardar")
    else setSaved(true)
  }

  if (loading) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      <div className="mx-auto max-w-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Mi perfil</h1>
        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
        {saved && <p className="text-green-600 text-sm mb-2">Guardado.</p>}
        <form onSubmit={onSave} className="space-y-3">
          <div className="flex items-center gap-3">
            <img src={image || "/placeholder-user.jpg"} className="h-16 w-16 rounded-full object-cover" />
            <input className="flex-1 border rounded px-3 py-2" placeholder="URL de foto" value={image} onChange={(e) => setImage(e.target.value)} />
          </div>
          <input className="w-full border rounded px-3 py-2" placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="w-full border rounded px-3 py-2 bg-gray-50 dark:bg-gray-900" value={email} disabled />
          <button className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-2 rounded" type="submit">Guardar cambios</button>
        </form>
      </div>
    </div>
  )
}



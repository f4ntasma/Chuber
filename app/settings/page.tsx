"use client"
import Header from "@/components/header"
import { useEffect, useState } from "react"

export default function SettingsPage() {
  const [name, setName] = useState("")
  const [image, setImage] = useState("")
  const [msg, setMsg] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    fetch("/api/user").then(async (r) => {
      if (!r.ok) return
      const d = await r.json()
      setName(d.user?.name || "")
      setImage(d.user?.image || "")
    })
  }, [])

  async function save() {
    setMsg(null)
    const r = await fetch("/api/user", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, image }) })
    setMsg(r.ok ? "Guardado" : "Error al guardar")
  }

  async function deleteAccount() {
    if (!confirm("¿Estás seguro? Esta acción no se puede deshacer.")) return
    
    const r = await fetch("/api/user", { method: "DELETE" })
    if (r.ok) {
      window.location.href = "/"
    } else {
      setMsg("Error al eliminar cuenta")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      <div className="mx-auto max-w-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Configuración</h1>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <img src={image || "/placeholder-user.jpg"} className="h-16 w-16 rounded-full object-cover" />
            <input value={image} onChange={(e) => setImage(e.target.value)} className="flex-1 border rounded px-3 py-2" placeholder="URL de foto" />
          </div>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="Nombre" />
          <button onClick={save} className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded">Guardar</button>
          {msg && <div className="text-sm">{msg}</div>}
          
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-2 text-red-600">Zona de peligro</h3>
            <button 
              onClick={deleteAccount}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            >
              Eliminar cuenta
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}



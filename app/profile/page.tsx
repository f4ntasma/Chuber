"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import Header from "@/components/header"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useSesion } from "@/components/session-provider"
import { supabaseBrowser } from "@/lib/supabase/client"
import { subirFoto } from "@/lib/subir-foto"

export default function ProfilePage() {
  const { user, perfil, recargarPerfil } = useSesion()
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [foto, setFoto] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [subiendo, setSubiendo] = useState(false)

  useEffect(() => {
    if (!perfil) return
    setName(perfil.name)
    setPhone(perfil.phone ?? "")
    setFoto(perfil.avatar_url)
  }, [perfil])

  async function cambiarFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0]
    e.target.value = ""
    if (!archivo || !user) return
    setSubiendo(true)
    try {
      const url = await subirFoto(user.id, archivo, "perfil")
      await supabaseBrowser().from("profiles").update({ avatar_url: url }).eq("id", user.id)
      setFoto(url)
      await recargarPerfil()
      toast.success("Foto actualizada")
    } catch {
      toast.error("No se pudo subir la foto")
    } finally {
      setSubiendo(false)
    }
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setGuardando(true)
    const { error } = await supabaseBrowser().from("profiles").update({ name: name.trim(), phone: phone.trim() || null }).eq("id", user.id)
    setGuardando(false)
    if (error) return toast.error("No se pudo guardar")
    await recargarPerfil()
    toast.success("Perfil guardado")
  }

  if (!perfil) return null

  const hasta = perfil.subscription_until ? new Date(perfil.subscription_until) : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      <div className="mx-auto max-w-lg p-6 space-y-6">
        <h1 className="text-2xl font-bold">Mi perfil</h1>

        {perfil.role !== "user" && (
          <div className="rounded-lg bg-white/80 dark:bg-gray-800/80 p-4 text-sm flex flex-wrap justify-between items-center gap-3">
            <span>
              {hasta && hasta > new Date()
                ? <>Tu ficha está visible hasta el <strong>{hasta.toLocaleDateString("es-PE")}</strong>.</>
                : <>Tu ficha <strong>no está visible</strong>: renueva tu plan.</>}
            </span>
            <div className="flex gap-2">
              <Link href="/providers/manage" className="text-orange-600 underline">Editar ficha</Link>
              <Link href="/pagos" className="text-orange-600 underline">Mi plan</Link>
            </div>
          </div>
        )}

        <form onSubmit={onSave} className="space-y-4">
          <div className="flex items-center gap-4">
            <img src={foto || "/placeholder-user.jpg"} alt="Tu foto" className="h-20 w-20 rounded-full object-cover" />
            <label className="cursor-pointer rounded-md border px-3 py-2 text-sm font-medium focus-within:ring-2 focus-within:ring-orange-400">
              {subiendo ? "Subiendo..." : "Cambiar foto"}
              <input type="file" accept="image/*" className="sr-only" onChange={cambiarFoto} disabled={subiendo} />
            </label>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Celular</Label>
            <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="999 999 999" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Correo</Label>
            <Input id="email" value={user?.email ?? ""} disabled />
          </div>
          <Button disabled={guardando} className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white" type="submit">
            {guardando ? "Guardando..." : "Guardar cambios"}
          </Button>
        </form>
      </div>
    </div>
  )
}

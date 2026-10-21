"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import Header from "@/components/header"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useSesion } from "@/components/session-provider"
import { supabaseBrowser } from "@/lib/supabase/client"
import { subirFoto } from "@/lib/subir-foto"
import { CATEGORIAS, CIUDADES, PLAN_PRECIO } from "@/lib/data"

type Ficha = {
  category: string
  specialty: string
  description: string
  price_range: string
  city: string
  district: string
  whatsapp: string
  response_time: string
  available: boolean
  image_url: string | null
  lat: number | null
  lng: number | null
}

const VACIA: Ficha = {
  category: CATEGORIAS[0].name, specialty: "", description: "", price_range: "", city: "Lima", district: "",
  whatsapp: "", response_time: "1 hora", available: true, image_url: null, lat: null, lng: null,
}

export default function ProviderManagePage() {
  const supabase = supabaseBrowser()
  const { user, perfil, recargarPerfil } = useSesion()
  const [ficha, setFicha] = useState<Ficha>(VACIA)
  const [existe, setExiste] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    if (!user) return
    supabase.from("providers").select("*").eq("user_id", user.id).maybeSingle().then(({ data }) => {
      if (data) {
        setFicha({ ...VACIA, ...data, whatsapp: data.whatsapp ?? "" })
        setExiste(true)
      } else if (perfil?.phone) {
        setFicha((f) => ({ ...f, whatsapp: perfil.phone ?? "" }))
      }
      setCargando(false)
    })
  }, [supabase, user, perfil?.phone])

  const cambiar = <K extends keyof Ficha>(campo: K, valor: Ficha[K]) => setFicha((f) => ({ ...f, [campo]: valor }))

  function detectarUbicacion() {
    if (!("geolocation" in navigator)) return toast.error("Tu dispositivo no permite ubicación")
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFicha((f) => ({ ...f, lat: pos.coords.latitude, lng: pos.coords.longitude }))
        toast.success("Ubicación detectada")
      },
      () => toast.error("No se pudo obtener tu ubicación"),
      { enableHighAccuracy: true, timeout: 8000 },
    )
  }

  async function cambiarFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0]
    e.target.value = ""
    if (!archivo || !user) return
    try {
      cambiar("image_url", await subirFoto(user.id, archivo, "servicio"))
    } catch {
      toast.error("No se pudo subir la foto")
    }
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setGuardando(true)
    // Un usuario normal que publica su ficha pasa a proveedor (y recibe sus 30 días de prueba)
    if (perfil?.role === "user") {
      const { error } = await supabase.from("profiles").update({ role: "provider" }).eq("id", user.id)
      if (error) {
        setGuardando(false)
        return toast.error("No se pudo activar tu cuenta de proveedor")
      }
    }
    const datos = { ...ficha, user_id: user.id, whatsapp: ficha.whatsapp.trim() || null, price_range: ficha.price_range.trim() || "A convenir" }
    const { error } = await supabase.from("providers").upsert(datos, { onConflict: "user_id" })
    setGuardando(false)
    if (error) return toast.error("No se pudo guardar tu ficha")
    setExiste(true)
    await recargarPerfil()
    toast.success("Ficha guardada")
  }

  if (cargando) return null

  const hasta = perfil?.subscription_until ? new Date(perfil.subscription_until) : null
  const visible = perfil?.role === "admin" || (hasta !== null && hasta > new Date())

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      <div className="mx-auto max-w-2xl p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{existe ? "Mi ficha de servicio" : "Ofrece tu servicio"}</h1>
          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
            {existe
              ? visible
                ? <>Tu ficha está visible{hasta ? <> hasta el <strong>{hasta.toLocaleDateString("es-PE")}</strong></> : null}.</>
                : <>Tu ficha está oculta porque venció tu plan. <Link href="/pagos" className="text-orange-600 underline">Renovar por S/ {PLAN_PRECIO.toFixed(2)}</Link></>
              : <>Los primeros 30 días son gratis. Luego S/ {PLAN_PRECIO.toFixed(2)} al mes para seguir visible.</>}
          </p>
        </div>

        <form onSubmit={guardar} className="space-y-5 bg-white/80 dark:bg-gray-800/80 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <img src={ficha.image_url || perfil?.avatar_url || "/placeholder.jpg"} alt="Foto del servicio" className="h-20 w-20 rounded-lg object-cover" />
            <label className="cursor-pointer rounded-md border px-3 py-2 text-sm font-medium focus-within:ring-2 focus-within:ring-orange-400">
              Foto de tu trabajo
              <input type="file" accept="image/*" className="sr-only" onChange={cambiarFoto} />
            </label>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Categoría</Label>
              <select id="category" value={ficha.category} onChange={(e) => cambiar("category", e.target.value)} className="w-full h-10 border rounded-md px-3 bg-transparent">
                {CATEGORIAS.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="specialty">Especialidad</Label>
              <Input id="specialty" value={ficha.specialty} onChange={(e) => cambiar("specialty", e.target.value)} placeholder="Ej. Tortas personalizadas" maxLength={80} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Describe tu servicio</Label>
            <textarea id="description" rows={4} maxLength={1000} value={ficha.description} onChange={(e) => cambiar("description", e.target.value)}
              className="w-full border rounded-md px-3 py-2 bg-transparent" placeholder="Qué haces, experiencia, zonas que atiendes, horarios…" />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Precio</Label>
              <Input id="price" value={ficha.price_range} onChange={(e) => cambiar("price_range", e.target.value)} placeholder="Ej. S/ 50 - 120" maxLength={40} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="response">Tiempo de respuesta</Label>
              <select id="response" value={ficha.response_time} onChange={(e) => cambiar("response_time", e.target.value)} className="w-full h-10 border rounded-md px-3 bg-transparent">
                {["15 min", "30 min", "1 hora", "2 horas", "Mismo día", "24 horas"].map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Ciudad</Label>
              <Input id="city" list="ciudades" value={ficha.city} onChange={(e) => cambiar("city", e.target.value)} required />
              <datalist id="ciudades">{CIUDADES.map((c) => <option key={c} value={c} />)}</datalist>
            </div>
            <div className="space-y-2">
              <Label htmlFor="district">Distrito</Label>
              <Input id="district" value={ficha.district} onChange={(e) => cambiar("district", e.target.value)} placeholder="Ej. Miraflores" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp (opcional)</Label>
              <Input id="whatsapp" type="tel" value={ficha.whatsapp} onChange={(e) => cambiar("whatsapp", e.target.value)} placeholder="999 999 999" />
            </div>
            <div className="space-y-2">
              <span className="text-sm font-medium">Ubicación para "cerca de mí"</span>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" onClick={detectarUbicacion}>Detectar</Button>
                <span className="text-xs text-gray-600 dark:text-gray-400">{ficha.lat != null ? "Guardada" : "Sin ubicación"}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Switch id="available" checked={ficha.available} onCheckedChange={(v) => cambiar("available", v)} />
            <Label htmlFor="available">Disponible para nuevos trabajos</Label>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button disabled={guardando} className="bg-gradient-to-r from-orange-500 to-amber-500 text-white" type="submit">
              {guardando ? "Guardando..." : existe ? "Guardar cambios" : "Publicar mi ficha"}
            </Button>
            {existe && (
              <Link href={`/services`} className="inline-flex items-center px-4 py-2 rounded-md border text-sm font-medium">Ver en el directorio</Link>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

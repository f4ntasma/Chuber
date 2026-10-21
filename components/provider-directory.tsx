"use client"

import { useEffect, useMemo, useState } from "react"
import { Search, MapPin, LocateFixed } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ProviderCard } from "@/components/provider-card"
import { ChatModal } from "@/components/ui/chat-modal"
import { useSesion } from "@/components/session-provider"
import { useFavoritos } from "@/hooks/use-favoritos"
import { supabaseBrowser } from "@/lib/supabase/client"
import { CATEGORIAS, CIUDADES, distanciaKm, formatoDistancia, type Proveedor } from "@/lib/data"

export function ProviderDirectory({ mostrarBuscador = true, mostrarCategorias = true }: { mostrarBuscador?: boolean; mostrarCategorias?: boolean }) {
  const supabase = supabaseBrowser()
  const { user } = useSesion()
  const { ids: favoritos, alternar } = useFavoritos()
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState("")
  const [ciudad, setCiudad] = useState("")
  const [categoria, setCategoria] = useState<string | null>(null)
  const [soloDisponibles, setSoloDisponibles] = useState(false)
  const [ubicacion, setUbicacion] = useState<{ lat: number; lng: number } | null>(null)
  const [chat, setChat] = useState<{ id: string; name: string } | null>(null)

  useEffect(() => {
    supabase
      .from("provider_cards")
      .select("*")
      .order("rating_avg", { ascending: false })
      .then(({ data }) => {
        setProveedores((data ?? []) as Proveedor[])
        setCargando(false)
      })
  }, [supabase])

  function usarMiUbicacion() {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setUbicacion({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setUbicacion(null),
      { enableHighAccuracy: true, timeout: 8000 },
    )
  }

  const filtrados = useMemo(() => {
    const t = busqueda.trim().toLowerCase()
    const c = ciudad.trim().toLowerCase()
    return proveedores
      .map((p) => ({ p, km: ubicacion && p.lat != null && p.lng != null ? distanciaKm(ubicacion, { lat: p.lat, lng: p.lng }) : null }))
      .filter(({ p }) =>
        (!t || [p.name, p.category, p.specialty, p.description].some((v) => v?.toLowerCase().includes(t))) &&
        (!c || [p.city, p.district].some((v) => v?.toLowerCase().includes(c))) &&
        (!categoria || p.category === categoria) &&
        (!soloDisponibles || p.available),
      )
      .sort((a, b) => (a.km != null && b.km != null ? a.km - b.km : 0))
  }, [proveedores, busqueda, ciudad, categoria, soloDisponibles, ubicacion])

  function contactar(p: Proveedor) {
    if (!user) {
      window.location.href = `/login?redirect=${encodeURIComponent(`/proveedor/${p.id}`)}`
      return
    }
    if (p.user_id === user.id) return
    setChat({ id: p.user_id, name: p.name })
  }

  return (
    <>
      {mostrarBuscador && (
        <div className="mt-10 flex flex-col sm:flex-row gap-4 max-w-3xl mx-auto px-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="search"
              aria-label="¿Qué servicio necesitas?"
              placeholder="¿Qué servicio necesitas?"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-10 h-12 text-base border-2 border-orange-200 dark:border-orange-800 focus:border-orange-400"
            />
          </div>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              list="ciudades-peru"
              aria-label="Ciudad"
              placeholder="Ciudad en Perú"
              value={ciudad}
              onChange={(e) => setCiudad(e.target.value)}
              className="pl-10 h-12 text-base border-2 border-orange-200 dark:border-orange-800 focus:border-orange-400 sm:w-56"
            />
            <datalist id="ciudades-peru">
              {CIUDADES.map((c) => <option key={c} value={c} />)}
            </datalist>
          </div>
          <Button type="button" onClick={usarMiUbicacion} variant="outline" className="h-12 border-2 border-orange-200 dark:border-orange-800">
            <LocateFixed className="h-4 w-4 mr-2" /> {ubicacion ? "Ordenado por cercanía" : "Cerca de mí"}
          </Button>
        </div>
      )}

      {mostrarCategorias && (
        <section className="px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">Explora por categorías</h2>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {CATEGORIAS.map((cat) => {
                const Icon = cat.icon
                const activa = categoria === cat.name
                return (
                  <button key={cat.name} type="button" aria-pressed={activa} onClick={() => setCategoria(activa ? null : cat.name)} className="text-left">
                    <Card className={`transition-all duration-200 hover:scale-105 hover:shadow-lg ${activa ? "ring-2 ring-orange-400" : ""}`}>
                      <CardContent className="p-4 text-center">
                        <div className={`w-12 h-12 rounded-full ${cat.color} flex items-center justify-center mx-auto mb-2`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{cat.name}</p>
                      </CardContent>
                    </Card>
                  </button>
                )
              })}
            </div>
          </div>
        </section>
      )}

      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {categoria ? `Profesionales de ${categoria}` : "Profesionales disponibles"}
            </h2>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input type="checkbox" checked={soloDisponibles} onChange={(e) => setSoloDisponibles(e.target.checked)} className="accent-orange-500 h-4 w-4" />
                Solo disponibles
              </label>
              <p className="text-gray-600 dark:text-gray-400">{filtrados.length} encontrados</p>
            </div>
          </div>

          {cargando ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => <Skeleton key={i} className="h-64 rounded-xl" />)}
            </div>
          ) : filtrados.length === 0 ? (
            <div className="text-center py-16 text-gray-600 dark:text-gray-400">
              <p className="text-lg font-medium">No encontramos profesionales con esos filtros.</p>
              <p className="text-sm mt-1">Prueba otra ciudad o categoría, o <a href="/providers/manage" className="text-orange-600 underline">ofrece tu servicio</a>.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtrados.map(({ p, km }) => (
                <ProviderCard
                  key={p.id}
                  proveedor={p}
                  distancia={formatoDistancia(km)}
                  favorito={favoritos.has(p.id)}
                  onFavorito={() => alternar(p.id)}
                  onContactar={() => contactar(p)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {chat && <ChatModal open onClose={() => setChat(null)} withUserId={chat.id} withName={chat.name} />}
    </>
  )
}

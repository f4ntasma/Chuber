"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Heart, MapPin, Clock, Star, MessageCircle, Phone } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChatModal } from "@/components/ui/chat-modal"
import { useSesion } from "@/components/session-provider"
import { useFavoritos } from "@/hooks/use-favoritos"
import { supabaseBrowser } from "@/lib/supabase/client"
import { enlaceWhatsapp, iniciales, type Proveedor } from "@/lib/data"

export type Resena = {
  id: string
  stars: number
  comment: string
  created_at: string
  user_id: string
  author: { name: string; avatar_url: string | null } | null
}

function Estrellas({ valor, tamano = "h-4 w-4" }: { valor: number; tamano?: string }) {
  return (
    <span className="inline-flex" aria-label={`${valor} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={`${tamano} ${n <= Math.round(valor) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
      ))}
    </span>
  )
}

export function ProviderDetail({ proveedor: p, resenas }: { proveedor: Proveedor; resenas: Resena[] }) {
  const router = useRouter()
  const { user } = useSesion()
  const { ids, alternar } = useFavoritos()
  const [chatAbierto, setChatAbierto] = useState(false)
  const miResena = resenas.find((r) => r.user_id === user?.id)
  const [estrellas, setEstrellas] = useState(miResena?.stars ?? 0)
  const [comentario, setComentario] = useState(miResena?.comment ?? "")
  const [guardando, setGuardando] = useState(false)
  const esMio = user?.id === p.user_id

  function pedirLogin() {
    window.location.href = `/login?redirect=${encodeURIComponent(`/proveedor/${p.id}`)}`
  }

  async function guardarResena(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return pedirLogin()
    if (!estrellas) return toast.error("Elige de 1 a 5 estrellas")
    setGuardando(true)
    const { error } = await supabaseBrowser()
      .from("reviews")
      .upsert({ provider_id: p.id, user_id: user.id, stars: estrellas, comment: comentario.trim() }, { onConflict: "provider_id,user_id" })
    setGuardando(false)
    if (error) return toast.error("No se pudo guardar tu reseña")
    toast.success("¡Gracias por tu reseña!")
    router.refresh()
  }

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6 space-y-6">
      <section className="bg-white/90 dark:bg-gray-800/90 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-6">
          <Avatar className="h-28 w-28 ring-4 ring-orange-200 dark:ring-orange-800">
            <AvatarImage src={p.image_url || p.avatar_url || undefined} alt={p.name} className="object-cover" />
            <AvatarFallback className="text-3xl bg-gradient-to-br from-orange-400 to-amber-400 text-white">{iniciales(p.name)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold">{p.name}</h1>
              <Badge className={p.available ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300" : ""} variant={p.available ? "default" : "secondary"}>
                {p.available ? "Disponible" : "Ocupado"}
              </Badge>
            </div>
            <p className="text-orange-600 dark:text-orange-400 font-semibold">{p.category}{p.specialty ? ` · ${p.specialty}` : ""}</p>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600 dark:text-gray-300">
              <span className="flex items-center gap-1">
                <Estrellas valor={Number(p.rating_avg)} />
                {p.reviews_count > 0 ? `${Number(p.rating_avg).toFixed(1)} (${p.reviews_count})` : "Sin reseñas aún"}
              </span>
              <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{[p.district, p.city].filter(Boolean).join(", ") || "Perú"}</span>
              <span className="flex items-center gap-1"><Clock className="h-4 w-4" />Responde en {p.response_time}</span>
            </div>
            <p className="text-2xl font-bold">{p.price_range}</p>
          </div>
        </div>

        {p.description && <p className="mt-6 whitespace-pre-line text-gray-700 dark:text-gray-300">{p.description}</p>}

        {!esMio && (
          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={() => (user ? setChatAbierto(true) : pedirLogin())} className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
              <MessageCircle className="h-4 w-4 mr-2" /> Enviar mensaje
            </Button>
            {p.whatsapp && (
              <a
                href={enlaceWhatsapp(p.whatsapp, `Hola ${p.name}, te encontré en ServiYa y quisiera información sobre tu servicio de ${p.category}.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-md px-4 py-2 font-medium border border-green-500 text-green-700 dark:text-green-400"
              >
                <Phone className="h-4 w-4 mr-2" /> WhatsApp
              </a>
            )}
            <Button variant="outline" onClick={() => alternar(p.id)}>
              <Heart className={`h-4 w-4 mr-2 ${ids.has(p.id) ? "fill-red-500 text-red-500" : ""}`} />
              {ids.has(p.id) ? "En favoritos" : "Guardar"}
            </Button>
          </div>
        )}
      </section>

      <section className="bg-white/90 dark:bg-gray-800/90 rounded-2xl p-6 shadow-sm space-y-6">
        <h2 className="text-xl font-bold">Reseñas</h2>

        {!esMio && (
          <form onSubmit={guardarResena} className="space-y-3 border-b dark:border-gray-700 pb-6">
            <fieldset>
              <legend className="text-sm font-medium mb-1">{miResena ? "Edita tu reseña" : "¿Trabajaste con este profesional?"}</legend>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button" onClick={() => setEstrellas(n)} aria-label={`${n} estrellas`} aria-pressed={estrellas === n}>
                    <Star className={`h-7 w-7 ${n <= estrellas ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                  </button>
                ))}
              </div>
            </fieldset>
            <label htmlFor="comentario" className="sr-only">Comentario</label>
            <textarea
              id="comentario"
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              maxLength={600}
              rows={3}
              placeholder="Cuenta cómo te fue (opcional)"
              className="w-full border rounded px-3 py-2 bg-transparent"
            />
            <Button type="submit" disabled={guardando} className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
              {guardando ? "Guardando..." : miResena ? "Actualizar reseña" : "Publicar reseña"}
            </Button>
          </form>
        )}

        {resenas.length === 0 ? (
          <p className="text-sm text-gray-500">Todavía no hay reseñas.</p>
        ) : (
          <ul className="space-y-5">
            {resenas.map((r) => (
              <li key={r.id} className="flex gap-3">
                <img src={r.author?.avatar_url || "/placeholder-user.jpg"} alt="" className="h-10 w-10 rounded-full object-cover" />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{r.author?.name ?? "Usuario"}</span>
                    <Estrellas valor={r.stars} tamano="h-3 w-3" />
                    <span className="text-xs text-gray-500">{new Date(r.created_at).toLocaleDateString("es-PE")}</span>
                  </div>
                  {r.comment && <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{r.comment}</p>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {chatAbierto && <ChatModal open onClose={() => setChatAbierto(false)} withUserId={p.user_id} withName={p.name} />}
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Header from "@/components/header"
import { ChatPanel } from "@/components/chat-panel"
import { useConversaciones } from "@/hooks/use-conversaciones"
import { supabaseBrowser } from "@/lib/supabase/client"

export default function MensajesPage() {
  const params = useSearchParams()
  const { conversaciones } = useConversaciones()
  const [seleccionado, setSeleccionado] = useState<string | null>(params.get("con"))
  const [nombreNuevo, setNombreNuevo] = useState<string>("")

  // Si llega ?con= de alguien sin conversación previa, trae su nombre
  useEffect(() => {
    if (!seleccionado || conversaciones.some((c) => c.other_id === seleccionado)) return
    supabaseBrowser().from("profiles").select("name").eq("id", seleccionado).single()
      .then(({ data }) => setNombreNuevo(data?.name ?? "Usuario"))
  }, [seleccionado, conversaciones])

  const nombre = conversaciones.find((c) => c.other_id === seleccionado)?.name ?? nombreNuevo

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      <div className="mx-auto max-w-5xl p-4 sm:p-6">
        <h1 className="text-2xl font-bold mb-4">Mensajes</h1>
        <div className="flex h-[70vh] bg-white/90 dark:bg-gray-800/90 rounded-xl border border-orange-200 dark:border-gray-700 overflow-hidden">
          <aside className={`${seleccionado ? "hidden md:block" : "block"} w-full md:w-80 border-r dark:border-gray-700 overflow-y-auto`}>
            {conversaciones.length === 0 ? (
              <p className="p-6 text-sm text-gray-500">Aún no tienes conversaciones. Busca un profesional y pulsa Contactar.</p>
            ) : (
              conversaciones.map((c) => (
                <button
                  key={c.other_id}
                  onClick={() => setSeleccionado(c.other_id)}
                  className={`w-full p-3 text-left flex items-center gap-3 hover:bg-orange-50 dark:hover:bg-gray-700 ${seleccionado === c.other_id ? "bg-orange-50 dark:bg-gray-700" : ""}`}
                >
                  <img src={c.avatar_url || "/placeholder-user.jpg"} alt="" className="h-10 w-10 rounded-full object-cover" />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-2">
                      <span className="font-medium truncate">{c.name}</span>
                      <span className="text-xs text-gray-500 shrink-0">{new Date(c.last_at).toLocaleDateString("es-PE")}</span>
                    </div>
                    <div className="text-sm text-gray-500 truncate">{c.last_content}</div>
                  </div>
                  {Number(c.unread) > 0 && <span className="bg-orange-500 text-white text-xs rounded-full min-w-5 h-5 px-1 flex items-center justify-center">{c.unread}</span>}
                </button>
              ))
            )}
          </aside>
          <section className={`${seleccionado ? "flex" : "hidden md:flex"} flex-1 flex-col min-w-0`}>
            {seleccionado ? (
              <>
                <div className="flex items-center gap-2 p-3 border-b dark:border-gray-700 font-semibold">
                  <button className="md:hidden" onClick={() => setSeleccionado(null)} aria-label="Volver">
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  {nombre}
                </div>
                <ChatPanel key={seleccionado} conUsuario={seleccionado} className="flex-1" />
              </>
            ) : (
              <div className="m-auto text-gray-500 text-sm">Elige una conversación</div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

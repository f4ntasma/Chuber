"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { MessageCircle, X, ArrowLeft } from "lucide-react"
import { useSesion } from "@/components/session-provider"
import { useConversaciones } from "@/hooks/use-conversaciones"
import { ChatPanel } from "@/components/chat-panel"

export function FloatingChat() {
  const { user } = useSesion()
  const ruta = usePathname()
  const { conversaciones, noLeidos } = useConversaciones()
  const [isOpen, setIsOpen] = useState(false)
  const [seleccionado, setSeleccionado] = useState<string | null>(null)

  // En /mensajes ya está la bandeja completa
  if (!user || ruta.startsWith("/mensajes")) return null

  const actual = conversaciones.find((c) => c.other_id === seleccionado)

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Cerrar mensajes" : `Abrir mensajes${noLeidos ? `, ${noLeidos} sin leer` : ""}`}
        className="fixed bottom-4 right-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all z-40"
      >
        <MessageCircle className="h-6 w-6" />
        {noLeidos > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
            {noLeidos}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed bottom-20 right-4 w-[calc(100%-2rem)] max-w-sm h-[28rem] bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-40 flex flex-col">
          <div className="flex items-center justify-between p-3 border-b dark:border-gray-700">
            {seleccionado ? (
              <button onClick={() => setSeleccionado(null)} className="flex items-center gap-2 font-semibold" aria-label="Volver a la lista">
                <ArrowLeft className="h-4 w-4" /> {actual?.name ?? "Chat"}
              </button>
            ) : (
              <h3 className="font-semibold">Mensajes</h3>
            )}
            <button onClick={() => setIsOpen(false)} aria-label="Cerrar" className="text-gray-500 hover:text-gray-700">
              <X className="h-4 w-4" />
            </button>
          </div>

          {seleccionado ? (
            <ChatPanel conUsuario={seleccionado} className="flex-1" />
          ) : (
            <div className="flex-1 overflow-y-auto">
              {conversaciones.length === 0 ? (
                <div className="p-4 text-center text-gray-500">No tienes conversaciones. Busca un profesional y pulsa Contactar.</div>
              ) : (
                conversaciones.map((c) => (
                  <button
                    key={c.other_id}
                    onClick={() => setSeleccionado(c.other_id)}
                    className="w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3"
                  >
                    <img src={c.avatar_url || "/placeholder-user.jpg"} alt="" className="h-10 w-10 rounded-full object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{c.name}</div>
                      <div className="text-sm text-gray-500 truncate">{c.last_content}</div>
                    </div>
                    {Number(c.unread) > 0 && (
                      <span className="bg-orange-500 text-white text-xs rounded-full h-5 min-w-5 px-1 flex items-center justify-center">{c.unread}</span>
                    )}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </>
  )
}

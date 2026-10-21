"use client"

import { useEffect, useRef, useState } from "react"
import { Send } from "lucide-react"
import { toast } from "sonner"
import { supabaseBrowser } from "@/lib/supabase/client"
import { useSesion } from "@/components/session-provider"

type Mensaje = { id: string; from_user: string; to_user: string; content: string; created_at: string; read_at: string | null }

/** Conversación en tiempo real entre el usuario actual y `conUsuario`. */
export function ChatPanel({ conUsuario, className = "" }: { conUsuario: string; className?: string }) {
  const supabase = supabaseBrowser()
  const { user } = useSesion()
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [texto, setTexto] = useState("")
  const [enviando, setEnviando] = useState(false)
  const fondo = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user || !conUsuario) return
    let activo = true

    supabase
      .from("messages")
      .select("*")
      .or(`and(from_user.eq.${user.id},to_user.eq.${conUsuario}),and(from_user.eq.${conUsuario},to_user.eq.${user.id})`)
      .order("created_at")
      .limit(200)
      .then(({ data }) => activo && setMensajes((data ?? []) as Mensaje[]))

    // Marca como leídos los que me enviaron
    supabase.from("messages").update({ read_at: new Date().toISOString() })
      .eq("from_user", conUsuario).eq("to_user", user.id).is("read_at", null).then(() => {})

    const canal = supabase
      .channel(`chat-${user.id}-${conUsuario}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        const m = payload.new as Mensaje
        const esDeEstaConversacion =
          (m.from_user === user.id && m.to_user === conUsuario) || (m.from_user === conUsuario && m.to_user === user.id)
        if (!esDeEstaConversacion) return
        setMensajes((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]))
        if (m.to_user === user.id) {
          supabase.from("messages").update({ read_at: new Date().toISOString() }).eq("id", m.id).then(() => {})
        }
      })
      .subscribe()

    return () => {
      activo = false
      supabase.removeChannel(canal)
    }
  }, [supabase, user, conUsuario])

  useEffect(() => {
    fondo.current?.scrollIntoView({ block: "end" })
  }, [mensajes])

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    const contenido = texto.trim()
    if (!contenido || !user) return
    setEnviando(true)
    const { data, error } = await supabase
      .from("messages")
      .insert({ from_user: user.id, to_user: conUsuario, content: contenido })
      .select()
      .single()
    setEnviando(false)
    if (error) return toast.error("No se pudo enviar el mensaje")
    setTexto("")
    setMensajes((prev) => (prev.some((x) => x.id === data.id) ? prev : [...prev, data as Mensaje]))
  }

  return (
    <div className={`flex flex-col min-h-0 ${className}`}>
      <div className="flex-1 overflow-y-auto p-4 space-y-2 text-sm">
        {mensajes.length === 0 && <p className="text-center text-gray-500 py-8">Escribe el primer mensaje.</p>}
        {mensajes.map((m) => {
          const mio = m.from_user === user?.id
          return (
            <div key={m.id} className={`flex ${mio ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] px-3 py-2 rounded-lg whitespace-pre-wrap break-words ${mio ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white" : "bg-gray-200 dark:bg-gray-700"}`}>
                {m.content}
                <div className={`text-[10px] mt-1 ${mio ? "text-white/80" : "text-gray-500"}`}>
                  {new Date(m.created_at).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}
                  {mio && m.read_at ? " · visto" : ""}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={fondo} />
      </div>
      <form onSubmit={enviar} className="flex gap-2 p-3 border-t dark:border-gray-700">
        <label htmlFor={`msg-${conUsuario}`} className="sr-only">Mensaje</label>
        <input
          id={`msg-${conUsuario}`}
          className="flex-1 border rounded px-3 py-2 bg-transparent"
          value={texto}
          maxLength={2000}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Escribe un mensaje"
        />
        <button
          type="submit"
          disabled={enviando || !texto.trim()}
          aria-label="Enviar"
          className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded disabled:opacity-60"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  )
}

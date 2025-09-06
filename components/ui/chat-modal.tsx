"use client"
import { useEffect, useState } from "react"

export function ChatModal({
  open,
  onClose,
  withUserId,
  withName,
}: {
  open: boolean
  onClose: () => void
  withUserId: string
  withName: string
}) {
  const [messages, setMessages] = useState<
    Array<{ id: string; fromUserId: string; toUserId: string; content: string }>
  >([])
  const [text, setText] = useState("")
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  // Obtener usuario logueado
  useEffect(() => {
    async function loadUser() {
      const res = await fetch("/api/auth/me", { cache: "no-store" })
      if (res.ok) {
        const data = await res.json()
        setCurrentUserId(data.user?.id || null)
      }
    }
    loadUser()
  }, [])

  // Cargar mensajes periódicamente
  useEffect(() => {
    let interval: any
    async function load() {
      const res = await fetch(`/api/chat?withUserId=${withUserId}`, {
        cache: "no-store",
      })
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages || [])
      }
    }
    if (open) {
      load()
      interval = setInterval(load, 3000)
    }
    return () => interval && clearInterval(interval)
  }, [open, withUserId])

  async function send() {
    if (!text.trim()) return
    const res = await fetch(`/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toUserId: withUserId, content: text }),
    })
    if (res.ok) {
      setText("")
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed bottom-0 right-4 w-full max-w-sm z-50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-t-xl shadow-lg border border-gray-200 dark:border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b dark:border-gray-700 font-semibold flex justify-between items-center">
          <span>Chat con {withName}</span>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            ✕
          </button>
        </div>

        {/* Messages */}
        <div className="h-80 overflow-y-auto p-4 space-y-2 text-sm">
          {messages.map((m) => {
            const isMe = m.fromUserId === currentUserId
            return (
              <div
                key={m.id}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] p-2 rounded-lg ${
                    isMe
                      ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white"
                      : "bg-gray-200 dark:bg-gray-700"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            )
          })}
        </div>

        {/* Input */}
        <div className="flex gap-2 p-3 border-t dark:border-gray-700">
          <input
            className="flex-1 border rounded px-3 py-2"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Escribe un mensaje"
          />
          <button
            className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded"
            onClick={send}
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  )
}

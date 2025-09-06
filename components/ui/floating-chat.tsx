"use client"
import { useEffect, useState } from "react"
import { MessageCircle, X, Send } from "lucide-react"

type Chat = {
  id: string
  withUser: { id: string; name: string; image?: string }
  lastMessage?: { content: string; createdAt: string }
  unread: number
}

export function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [chats, setChats] = useState<Chat[]>([])
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    // Verificar si está logueado
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me")
        if (res.ok) {
          const userData = await res.json()
          if (userData && userData.id) {
            setIsLoggedIn(true)
            loadChats()
          } else {
            setIsLoggedIn(false)
          }
        } else {
          setIsLoggedIn(false)
        }
      } catch {
        setIsLoggedIn(false)
      }
    }
    checkAuth()
  }, [])

  async function loadChats() {
    try {
      const res = await fetch("/api/chat/conversations")
      if (res.ok) {
        const data = await res.json()
        setChats(data.chats || [])
      }
    } catch {}
  }

  useEffect(() => {
    if (selectedChat) {
      // Cargar mensajes del chat seleccionado
      async function loadMessages() {
        try {
          const res = await fetch(`/api/chat?withUserId=${selectedChat}`)
          if (res.ok) {
            const data = await res.json()
            setMessages(data.messages || [])
          }
        } catch {}
      }
      loadMessages()
    }
  }, [selectedChat])

  async function sendMessage() {
    if (!newMessage.trim() || !selectedChat) return
    
    try {
      await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toUserId: selectedChat, content: newMessage }),
      })
      setNewMessage("")
      // Recargar mensajes
      const res = await fetch(`/api/chat?withUserId=${selectedChat}`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages || [])
      }
    } catch {}
  }

  const totalUnread = chats.reduce((sum, chat) => sum + chat.unread, 0)

  // Solo mostrar si está logueado
  if (!isLoggedIn) return null

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all z-50"
      >
        <MessageCircle className="h-6 w-6" />
        {totalUnread > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
            {totalUnread}
          </span>
        )}
      </button>

      {/* Chat flotante */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 w-80 h-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b dark:border-gray-700">
            <h3 className="font-semibold">Mensajes</h3>
            <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">
              <X className="h-4 w-4" />
            </button>
          </div>

          {!selectedChat ? (
            /* Lista de chats */
            <div className="flex-1 overflow-y-auto">
              {chats.length === 0 ? (
                <div className="p-4 text-center text-gray-500">No tienes conversaciones</div>
              ) : (
                <div className="space-y-1">
                  {chats.map((chat) => (
                    <button
                      key={chat.id}
                      onClick={() => setSelectedChat(chat.withUser.id)}
                      className="w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3"
                    >
                      <img
                        src={chat.withUser.image || "/placeholder-user.jpg"}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{chat.withUser.name}</div>
                        {chat.lastMessage && (
                          <div className="text-sm text-gray-500 truncate">
                            {chat.lastMessage.content}
                          </div>
                        )}
                      </div>
                      {chat.unread > 0 && (
                        <span className="bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {chat.unread}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Chat individual */
            <>
              <div className="flex items-center gap-2 p-3 border-b dark:border-gray-700">
                <button onClick={() => setSelectedChat(null)} className="text-gray-500">
                  ←
                </button>
                <span className="font-medium">
                  {chats.find(c => c.withUser.id === selectedChat)?.withUser.name}
                </span>
              </div>
              
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {messages.map((msg) => (
                  <div key={msg.id} className="text-sm">
                    <div className="bg-orange-100 dark:bg-gray-700 p-2 rounded max-w-[80%]">
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-2 p-3 border-t dark:border-gray-700">
                <input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Escribe un mensaje..."
                  className="flex-1 border rounded px-3 py-2 text-sm"
                />
                <button
                  onClick={sendMessage}
                  className="bg-orange-500 text-white p-2 rounded"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}

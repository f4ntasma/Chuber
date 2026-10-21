"use client"

import { X } from "lucide-react"
import { ChatPanel } from "@/components/chat-panel"

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
  if (!open || !withUserId) return null

  return (
    <div className="fixed bottom-0 right-4 w-[calc(100%-2rem)] max-w-sm z-50" role="dialog" aria-label={`Chat con ${withName}`}>
      <div className="bg-white dark:bg-gray-800 rounded-t-xl shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col h-[28rem]">
        <div className="px-4 py-3 border-b dark:border-gray-700 font-semibold flex justify-between items-center">
          <span>Chat con {withName}</span>
          <button onClick={onClose} aria-label="Cerrar chat" className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <X className="h-4 w-4" />
          </button>
        </div>
        <ChatPanel conUsuario={withUserId} className="flex-1" />
      </div>
    </div>
  )
}

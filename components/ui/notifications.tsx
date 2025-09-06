"use client"
import { useEffect, useState } from "react"
import { Bell, Heart, X } from "lucide-react"

type Notification = {
  id: string
  type: "like" | "message" | "payment"
  message: string
  createdAt: string
  read: boolean
}

export function Notifications() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    // Verificar si está logueado
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me")
        if (res.ok) {
          loadNotifications()
        }
      } catch {}
    }
    checkAuth()
  }, [])

  async function loadNotifications() {
    try {
      const res = await fetch("/api/notifications")
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount || 0)
      }
    } catch {}
  }

  async function markAsRead(notificationId: string) {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, { method: "POST" })
      loadNotifications()
    } catch {}
  }

  return (
    <div className="relative">
      {/* Botón de notificaciones */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Panel de notificaciones */}
      {isOpen && (
        <div className="absolute top-12 right-0 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
          <div className="flex items-center justify-between p-3 border-b dark:border-gray-700">
            <h3 className="font-semibold">Notificaciones</h3>
            <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <div className="max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No tienes notificaciones</div>
            ) : (
              <div className="space-y-1">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                      !notification.read ? "bg-orange-50 dark:bg-orange-900/20" : ""
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-2">
                      {notification.type === "like" && <Heart className="h-4 w-4 text-red-500 mt-0.5" />}
                      {notification.type === "message" && <Bell className="h-4 w-4 text-blue-500 mt-0.5" />}
                      {notification.type === "payment" && <Bell className="h-4 w-4 text-green-500 mt-0.5" />}
                      <div className="flex-1">
                        <div className="text-sm">{notification.message}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(notification.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

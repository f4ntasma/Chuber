"use client"
import { useEffect, useState } from "react"
import { Heart, X, ExternalLink } from "lucide-react"
import Link from "next/link"

type Like = {
  id: string
  providerId: string
  providerName: string
  providerImage?: string
  serviceName: string
  createdAt: string
}

export function Likes() {
  const [isOpen, setIsOpen] = useState(false)
  const [likes, setLikes] = useState<Like[]>([])
  const [likesCount, setLikesCount] = useState(0)

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me")
        if (res.ok) {
          loadLikes()
        }
      } catch {}
    }
    checkAuth()
  }, [])

  async function loadLikes() {
    try {
      const res = await fetch("/api/likes/list")
      if (res.ok) {
        const data = await res.json()
        setLikes(data.likes || [])
        setLikesCount(data.likes?.length || 0)
      }
    } catch {}
  }

  async function removeLike(likeId: string, providerId: string) {
    try {
      await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerId })
      })
      loadLikes()
    } catch {}
  }

  return (
    <div className="relative inline-block">
      {/* Botón de likes */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
      >
        <Heart className="h-5 w-5" />
        {likesCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {likesCount}
          </span>
        )}
      </button>

      {/* Panel de likes */}
      {isOpen && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
          <div className="flex items-center justify-between p-3 border-b dark:border-gray-700">
            <h3 className="font-semibold">Mis Likes</h3>
            <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <div className="max-h-64 overflow-y-auto">
            {likes.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <Heart className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>No tienes likes guardados</p>
                <p className="text-xs mt-1">Explora servicios y da like a tus favoritos</p>
              </div>
            ) : (
              <div className="space-y-1">
                {likes.map((like) => (
                  <div
                    key={like.id}
                    className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <img 
                          src={like.providerImage || "/placeholder-user.jpg"} 
                          alt={like.providerName}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                              {like.providerName}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {like.serviceName}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Link 
                              href={`/services`}
                              className="text-gray-400 hover:text-blue-500"
                              title="Ver servicio"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Link>
                            <button
                              onClick={() => removeLike(like.id, like.providerId)}
                              className="text-gray-400 hover:text-red-500"
                              title="Quitar like"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {new Date(like.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {likes.length > 0 && (
            <div className="p-3 border-t dark:border-gray-700">
              <Link 
                href="/likes"
                className="block w-full text-center text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300"
                onClick={() => setIsOpen(false)}
              >
                Ver todos mis likes
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

"use client"
import { Heart } from "lucide-react"
import { useState } from "react"

export function LikeButton({ providerId, initial }: { providerId: string | number; initial?: boolean }) {
  const [liked, setLiked] = useState(!!initial)
  return (
    <button
      onClick={async (e) => {
        e.stopPropagation()
        try {
          await fetch("/api/likes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ providerId: String(providerId) }),
          })
          setLiked((v) => !v)
        } catch {}
      }}
      className={`inline-flex items-center justify-center h-8 w-8 rounded-full border ${liked ? "text-red-500 border-red-300" : "text-gray-500 border-gray-300 dark:border-gray-600"}`}
      aria-label="Like"
    >
      <Heart className={`h-4 w-4 ${liked ? "fill-red-500" : ""}`} />
    </button>
  )
}



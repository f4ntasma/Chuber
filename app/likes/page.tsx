"use client"
import { useEffect, useMemo, useState } from "react"
import Header from "@/components/header"
import { useRouter } from "next/navigation"

export default function LikesPage() {
  const router = useRouter()
  const [likedIds, setLikedIds] = useState<string[]>([])
  const [providers, setProviders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const me = await fetch("/api/auth/me")
      const meData = await me.json()
      if (!meData?.user) {
        router.push("/login?redirect=/likes")
        return
      }
      const [likesRes, provRes] = await Promise.all([fetch("/api/likes"), fetch("/api/providers")])
      const likesData = await likesRes.json()
      const provData = await provRes.json()
      setLikedIds(likesData.likes || [])
      setProviders(provData.providers || [])
      setLoading(false)
    }
    load()
  }, [router])

  const likedProviders = useMemo(() => providers.filter((p) => likedIds.includes(p.id)), [providers, likedIds])

  if (loading) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Mis likes</h1>
        {likedProviders.length === 0 ? (
          <p className="text-gray-700 dark:text-gray-300">Aún no tienes likes.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {likedProviders.map((p) => (
              <div key={p.id} className="bg-white/80 dark:bg-gray-800/80 p-4 rounded-xl shadow">
                <div className="flex items-center gap-3">
                  <img src={p.image || "/placeholder.svg?height=60&width=60"} className="h-12 w-12 rounded-full" />
                  <div>
                    <h3 className="font-semibold">{p.name}</h3>
                    <p className="text-sm text-orange-600 dark:text-orange-400">{p.specialty || "Servicios"}</p>
                  </div>
                </div>
                <button className="mt-4 w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-2 rounded">Message</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}



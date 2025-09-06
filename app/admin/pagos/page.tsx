"use client"
import Header from "@/components/header"
import { useEffect, useState } from "react"

export default function AdminPagosPage() {
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Verificación simplificada - solo cargar datos
    load()
  }, [])

  async function load() {
    const r = await fetch("/api/payments")
    if (r.ok) {
      const d = await r.json()
      setPayments(d.payments || [])
    }
    setLoading(false)
  }


  async function act(p: any, approve: boolean) {
    await fetch("/api/payments/approve", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ paymentId: p.id, approve }) })
    load()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-2xl font-bold mb-4">Admin - Pagos</h1>
        {loading ? (
          <div>Cargando...</div>
        ) : (
          <div className="space-y-2">
            {payments.map((p) => (
              <div key={p.id} className="bg-white/80 dark:bg-gray-800/80 p-4 rounded">
                <div className="text-sm">{p.createdAt?.slice(0,10)} - S/ {p.amount / 100} - {p.status} - {p.reference}</div>
                {p.status === "pending" && (
                  <div className="mt-2 flex gap-2">
                    <button className="px-3 py-1 rounded bg-green-600 text-white" onClick={() => act(p, true)}>Aprobar</button>
                    <button className="px-3 py-1 rounded bg-red-600 text-white" onClick={() => act(p, false)}>Rechazar</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}



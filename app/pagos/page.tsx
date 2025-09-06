"use client"
import Header from "@/components/header"
import { useEffect, useState } from "react"

export default function PagosPage() {
  const [payments, setPayments] = useState<any[]>([])
  const [ref, setRef] = useState("")
  const [amount, setAmount] = useState(250)
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/payments").then(async (r) => {
      if (!r.ok) return
      const d = await r.json()
      setPayments(d.payments || [])
    })
  }, [])

  async function submit() {
    setMsg(null)
    const res = await fetch("/api/payments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reference: ref, amount }) })
    if (res.ok) setMsg("Enviado para validación. Se activará al aprobarse.")
    else setMsg("No se pudo enviar. Intenta nuevamente.")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-2xl font-bold mb-2">Pagos</h1>
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">Envia tu pago de S/ 2.50 por Yape y registra tu referencia. La activación será manual.</p>
        <img src="/images/yapepe.jpeg" alt="Yape" className="w-64 rounded mb-4" />

        <div className="space-y-2 mb-6">
          <input className="w-full border rounded px-3 py-2" placeholder="Referencia de pago Yape" value={ref} onChange={(e) => setRef(e.target.value)} />
          <input className="w-full border rounded px-3 py-2" type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
          <button onClick={submit} className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded">Enviar</button>
          {msg && <div className="text-sm mt-2">{msg}</div>}
        </div>

        <h2 className="font-semibold mb-2">Historial</h2>
        <ul className="space-y-2 text-sm">
          {payments.map((p) => (
            <li key={p.id} className="bg-white/80 dark:bg-gray-800/80 p-3 rounded">{p.createdAt?.slice(0,10)} - S/ {p.amount / 100} - {p.status} - {p.reference}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}



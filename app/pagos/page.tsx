"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import Header from "@/components/header"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useSesion } from "@/components/session-provider"
import { supabaseBrowser } from "@/lib/supabase/client"
import { PLAN_PRECIO, YAPE_QR } from "@/lib/data"

type Pago = { id: string; amount: number; method: string; reference: string; months: number; status: "pending" | "approved" | "rejected"; created_at: string }

const ESTADOS = {
  pending: { texto: "En revisión", clase: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" },
  approved: { texto: "Aprobado", clase: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
  rejected: { texto: "Rechazado", clase: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" },
}

export default function PagosPage() {
  const supabase = supabaseBrowser()
  const { user, perfil } = useSesion()
  const [pagos, setPagos] = useState<Pago[]>([])
  const [meses, setMeses] = useState(1)
  const [metodo, setMetodo] = useState("yape")
  const [referencia, setReferencia] = useState("")
  const [enviando, setEnviando] = useState(false)

  async function cargar() {
    if (!user) return
    const { data } = await supabase.from("payments").select("*").eq("user_id", user.id).order("created_at", { ascending: false })
    setPagos((data ?? []) as Pago[])
  }

  useEffect(() => {
    cargar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setEnviando(true)
    const { error } = await supabase.from("payments").insert({
      user_id: user.id, amount: PLAN_PRECIO * meses, months: meses, method: metodo, reference: referencia.trim(),
    })
    setEnviando(false)
    if (error) return toast.error("No se pudo registrar el pago")
    setReferencia("")
    toast.success("Pago enviado. Te avisaremos cuando se apruebe.")
    cargar()
  }

  const hasta = perfil?.subscription_until ? new Date(perfil.subscription_until) : null
  const pendiente = pagos.some((p) => p.status === "pending")

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Mi plan</h1>
          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
            {hasta && hasta > new Date()
              ? <>Tu ficha está visible hasta el <strong>{hasta.toLocaleDateString("es-PE")}</strong>. Puedes pagar por adelantado.</>
              : <>Tu ficha no está visible. Paga S/ {PLAN_PRECIO.toFixed(2)} al mes para volver a aparecer.</>}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 bg-white/80 dark:bg-gray-800/80 rounded-xl p-6">
          <div className="space-y-2">
            <img src={YAPE_QR} alt="QR de Yape para pagar ServiYa" className="w-full max-w-64 rounded-lg mx-auto" />
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">Escanea con Yape o Plin</p>
          </div>
          <form onSubmit={enviar} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="meses">¿Cuántos meses?</Label>
              <select id="meses" value={meses} onChange={(e) => setMeses(Number(e.target.value))} className="w-full h-10 border rounded-md px-3 bg-transparent">
                {[1, 3, 6, 12].map((m) => <option key={m} value={m}>{m} {m === 1 ? "mes" : "meses"} · S/ {(PLAN_PRECIO * m).toFixed(2)}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="metodo">Medio</Label>
              <select id="metodo" value={metodo} onChange={(e) => setMetodo(e.target.value)} className="w-full h-10 border rounded-md px-3 bg-transparent">
                <option value="yape">Yape</option>
                <option value="plin">Plin</option>
                <option value="transferencia">Transferencia</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ref">N° de operación</Label>
              <Input id="ref" value={referencia} onChange={(e) => setReferencia(e.target.value)} placeholder="Aparece en tu constancia" required maxLength={40} />
            </div>
            <p className="text-2xl font-bold">Total: S/ {(PLAN_PRECIO * meses).toFixed(2)}</p>
            <Button disabled={enviando || pendiente} type="submit" className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white">
              {pendiente ? "Ya tienes un pago en revisión" : enviando ? "Enviando..." : "Ya pagué, registrar"}
            </Button>
          </form>
        </div>

        <section>
          <h2 className="font-semibold mb-3">Historial</h2>
          {pagos.length === 0 ? (
            <p className="text-sm text-gray-600 dark:text-gray-400">Aún no registras pagos.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {pagos.map((p) => (
                <li key={p.id} className="bg-white/80 dark:bg-gray-800/80 p-3 rounded flex flex-wrap justify-between items-center gap-2">
                  <span>{new Date(p.created_at).toLocaleDateString("es-PE")} · S/ {Number(p.amount).toFixed(2)} · {p.months} {p.months === 1 ? "mes" : "meses"} · {p.method} · #{p.reference}</span>
                  <Badge className={ESTADOS[p.status].clase}>{ESTADOS[p.status].texto}</Badge>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}

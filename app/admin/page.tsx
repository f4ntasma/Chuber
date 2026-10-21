"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import Header from "@/components/header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabaseBrowser } from "@/lib/supabase/client"
import type { Perfil } from "@/lib/data"

type Pago = {
  id: string; amount: number; method: string; reference: string; months: number
  status: "pending" | "approved" | "rejected"; created_at: string; user_id: string
  usuario: { name: string; phone: string | null } | null
}

const ROLES = { user: "Cliente", provider: "Proveedor", admin: "Admin" }

export default function AdminPage() {
  const supabase = supabaseBrowser()
  const [pagos, setPagos] = useState<Pago[]>([])
  const [usuarios, setUsuarios] = useState<Perfil[]>([])
  const [fichas, setFichas] = useState(0)
  const [filtro, setFiltro] = useState("")
  const [procesando, setProcesando] = useState<string | null>(null)

  const cargar = useCallback(async () => {
    const [p, u, f] = await Promise.all([
      supabase.from("payments").select("*, usuario:profiles!payments_user_id_fkey(name, phone)").order("created_at", { ascending: false }).limit(200),
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("providers").select("id", { count: "exact", head: true }),
    ])
    setPagos((p.data ?? []) as unknown as Pago[])
    setUsuarios((u.data ?? []) as Perfil[])
    setFichas(f.count ?? 0)
  }, [supabase])

  useEffect(() => {
    cargar()
  }, [cargar])

  async function revisar(pago: Pago, aprobar: boolean) {
    setProcesando(pago.id)
    const { error } = await supabase.rpc("review_payment", { payment_id: pago.id, approve: aprobar })
    setProcesando(null)
    if (error) return toast.error(error.message)
    toast.success(aprobar ? "Pago aprobado: plan extendido" : "Pago rechazado")
    cargar()
  }

  async function cambiarRol(u: Perfil, role: Perfil["role"]) {
    const { error } = await supabase.from("profiles").update({ role }).eq("id", u.id)
    if (error) return toast.error("No se pudo cambiar el rol")
    cargar()
  }

  const ahora = new Date()
  const pendientes = pagos.filter((p) => p.status === "pending")
  const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1)
  const ingresosMes = pagos.filter((p) => p.status === "approved" && new Date(p.created_at) >= inicioMes).reduce((s, p) => s + Number(p.amount), 0)
  const proveedores = usuarios.filter((u) => u.role === "provider")
  const visibles = proveedores.filter((u) => u.subscription_until && new Date(u.subscription_until) > ahora).length
  const porVencer = proveedores.filter((u) => {
    if (!u.subscription_until) return false
    const dias = (new Date(u.subscription_until).getTime() - ahora.getTime()) / 86_400_000
    return dias >= 0 && dias <= 5
  }).length

  const usuariosFiltrados = useMemo(() => {
    const t = filtro.trim().toLowerCase()
    return t ? usuarios.filter((u) => [u.name, u.phone].some((v) => v?.toLowerCase().includes(t))) : usuarios
  }, [usuarios, filtro])

  const tarjetas = [
    ["Usuarios", usuarios.length],
    ["Proveedores", `${visibles} visibles de ${proveedores.length}`],
    ["Fichas publicadas", fichas],
    ["Vencen en 5 días", porVencer],
    ["Pagos por revisar", pendientes.length],
    ["Ingresos del mes", `S/ ${ingresosMes.toFixed(2)}`],
  ] as const

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
        <h1 className="text-2xl font-bold">Administración</h1>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {tarjetas.map(([titulo, valor]) => (
            <div key={titulo} className="bg-white/90 dark:bg-gray-800/90 rounded-xl p-4">
              <div className="text-xs text-gray-600 dark:text-gray-400">{titulo}</div>
              <div className="text-xl font-bold mt-1">{valor}</div>
            </div>
          ))}
        </div>

        <Tabs defaultValue="pagos">
          <TabsList>
            <TabsTrigger value="pagos">Pagos {pendientes.length > 0 && `(${pendientes.length})`}</TabsTrigger>
            <TabsTrigger value="usuarios">Usuarios</TabsTrigger>
          </TabsList>

          <TabsContent value="pagos" className="space-y-2">
            {pagos.length === 0 && <p className="text-sm text-gray-600 py-6">Todavía no hay pagos registrados.</p>}
            {pagos.map((p) => (
              <div key={p.id} className="bg-white/90 dark:bg-gray-800/90 p-4 rounded-lg flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm space-y-1">
                  <div className="font-medium">{p.usuario?.name ?? "Usuario"} {p.usuario?.phone && <span className="text-gray-500">· {p.usuario.phone}</span>}</div>
                  <div className="text-gray-600 dark:text-gray-400">
                    {new Date(p.created_at).toLocaleString("es-PE")} · S/ {Number(p.amount).toFixed(2)} · {p.months} {p.months === 1 ? "mes" : "meses"} · {p.method} · Op. <strong>{p.reference}</strong>
                  </div>
                </div>
                {p.status === "pending" ? (
                  <div className="flex gap-2">
                    <Button size="sm" disabled={procesando === p.id} className="bg-green-600 hover:bg-green-700 text-white" onClick={() => revisar(p, true)}>Aprobar</Button>
                    <Button size="sm" disabled={procesando === p.id} variant="destructive" onClick={() => revisar(p, false)}>Rechazar</Button>
                  </div>
                ) : (
                  <Badge variant={p.status === "approved" ? "default" : "secondary"}>{p.status === "approved" ? "Aprobado" : "Rechazado"}</Badge>
                )}
              </div>
            ))}
          </TabsContent>

          <TabsContent value="usuarios" className="space-y-3">
            <label htmlFor="buscar" className="sr-only">Buscar usuario</label>
            <Input id="buscar" placeholder="Buscar por nombre o celular" value={filtro} onChange={(e) => setFiltro(e.target.value)} className="max-w-sm" />
            <div className="overflow-x-auto bg-white/90 dark:bg-gray-800/90 rounded-lg">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="text-left text-gray-600 dark:text-gray-400">
                  <tr><th className="p-3">Nombre</th><th className="p-3">Celular</th><th className="p-3">Rol</th><th className="p-3">Plan hasta</th><th className="p-3">Alta</th></tr>
                </thead>
                <tbody>
                  {usuariosFiltrados.map((u) => {
                    const hasta = u.subscription_until ? new Date(u.subscription_until) : null
                    return (
                      <tr key={u.id} className="border-t dark:border-gray-700">
                        <td className="p-3 font-medium">{u.name}</td>
                        <td className="p-3">{u.phone ?? "-"}</td>
                        <td className="p-3">
                          <label className="sr-only" htmlFor={`rol-${u.id}`}>Rol de {u.name}</label>
                          <select id={`rol-${u.id}`} value={u.role} onChange={(e) => cambiarRol(u, e.target.value as Perfil["role"])} className="border rounded px-2 py-1 bg-transparent">
                            {Object.entries(ROLES).map(([v, t]) => <option key={v} value={v}>{t}</option>)}
                          </select>
                        </td>
                        <td className={`p-3 ${hasta && hasta < ahora ? "text-red-600" : ""}`}>{hasta ? hasta.toLocaleDateString("es-PE") : "-"}</td>
                        <td className="p-3">{new Date((u as Perfil & { created_at: string }).created_at).toLocaleDateString("es-PE")}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

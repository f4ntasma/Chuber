import { notFound } from "next/navigation"
import Header from "@/components/header"
import { supabaseServer } from "@/lib/supabase/server"
import type { Proveedor } from "@/lib/data"
import { ProviderDetail, type Resena } from "./provider-detail"

export default async function ProveedorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await supabaseServer()
  const { data: proveedor } = await supabase.from("provider_cards").select("*").eq("id", id).maybeSingle()
  if (!proveedor) notFound()

  const { data: resenas } = await supabase
    .from("reviews")
    .select("id, stars, comment, created_at, user_id, author:profiles(name, avatar_url)")
    .eq("provider_id", id)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      <ProviderDetail proveedor={proveedor as Proveedor} resenas={(resenas ?? []) as unknown as Resena[]} />
    </div>
  )
}

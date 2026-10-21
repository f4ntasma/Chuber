import { NextResponse, type NextRequest } from "next/server"
import { supabaseServer } from "@/lib/supabase/server"

/** Destino de los enlaces de correo (confirmación y recuperación): canjea el código por una sesión. */
export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const code = url.searchParams.get("code")
  const next = url.searchParams.get("next") || "/"
  const destino = next.startsWith("/") && !next.startsWith("//") ? next : "/"

  if (code) {
    const supabase = await supabaseServer()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(new URL(destino, url.origin))
  }
  return NextResponse.redirect(new URL("/login?error=enlace", url.origin))
}

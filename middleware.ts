import { NextResponse, type NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

// Rutas que piden sesión; /admin además pide rol admin.
const PROTEGIDAS = ["/profile", "/settings", "/likes", "/mensajes", "/pagos", "/providers/manage", "/admin"]

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({ request: req })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (lista) => {
          lista.forEach(({ name, value }) => req.cookies.set(name, value))
          res = NextResponse.next({ request: req })
          lista.forEach(({ name, value, options }) => res.cookies.set(name, value, options))
        },
      },
    },
  )

  // Refresca la sesión en cada petición
  const { data: { user } } = await supabase.auth.getUser()
  const ruta = req.nextUrl.pathname

  if (PROTEGIDAS.some((p) => ruta === p || ruta.startsWith(p + "/"))) {
    if (!user) {
      const login = req.nextUrl.clone()
      login.pathname = "/login"
      login.search = `?redirect=${encodeURIComponent(ruta + req.nextUrl.search)}`
      return NextResponse.redirect(login)
    }
    if (ruta.startsWith("/admin")) {
      const { data: perfil } = await supabase.from("profiles").select("role").eq("id", user.id).single()
      if (perfil?.role !== "admin") return NextResponse.redirect(new URL("/", req.url))
    }
  }

  return res
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}

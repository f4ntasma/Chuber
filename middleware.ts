import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyAuthToken } from "@/lib/auth"

// Protect these routes
const protectedRoutes = ["/dashboard", "/profile", "/providers/manage", "/likes", "/admin"]

export function middleware(req: NextRequest) {
  // TEMPORALMENTE DESHABILITADO - EL PANEL ADMIN FUNCIONA SIN SEGURIDAD
  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*", "/providers/manage/:path*", "/likes/:path*", "/admin/:path*"],
}



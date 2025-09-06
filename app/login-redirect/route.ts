import { NextRequest, NextResponse } from "next/server"
import { comparePassword, signAuthToken, type AuthTokenPayload, type UserRole } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const redirect = formData.get("redirect") as string
    
    if (!email || !password) {
      return NextResponse.redirect(new URL("/login?error=credenciales-invalidas", req.url))
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.redirect(new URL("/login?error=usuario-no-encontrado", req.url))
    }

    const ok = await comparePassword(password, user.passwordHash)
    if (!ok) {
      return NextResponse.redirect(new URL("/login?error=contraseña-incorrecta", req.url))
    }

    const payload: AuthTokenPayload = { id: user.id, email: user.email, role: user.role as UserRole }
    const token = signAuthToken(payload)

    // Redirección exitosa
    const redirectUrl = redirect && redirect !== "null" ? redirect : "/"
    const res = NextResponse.redirect(new URL(redirectUrl, req.url))
    
    // Establecer la cookie
    res.cookies.set("auth_token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    })
    
    return res
  } catch (e) {
    console.error("Error en login-redirect:", e)
    return NextResponse.redirect(new URL("/login?error=error-servidor", req.url))
  }
}

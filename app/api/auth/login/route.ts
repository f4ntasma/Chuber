import { NextRequest, NextResponse } from "next/server"
import { comparePassword, signAuthToken, type AuthTokenPayload, type UserRole } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    let email, password, redirect
    
    // Verificar si es JSON o form data
    const contentType = req.headers.get("content-type")
    if (contentType?.includes("application/json")) {
      const body = await req.json()
      email = body.email
      password = body.password
      redirect = body.redirect
    } else {
      // Form data
      const formData = await req.formData()
      email = formData.get("email") as string
      password = formData.get("password") as string
      redirect = formData.get("redirect") as string
    }
    
    if (!email || !password) {
      if (contentType?.includes("application/json")) {
        return NextResponse.json({ error: "Credenciales inválidas" }, { status: 400 })
      } else {
        return NextResponse.redirect(new URL("/login?error=credenciales-invalidas", req.url))
      }
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      if (contentType?.includes("application/json")) {
        return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
      } else {
        return NextResponse.redirect(new URL("/login?error=usuario-no-encontrado", req.url))
      }
    }

    const ok = await comparePassword(password, user.passwordHash)
    if (!ok) {
      if (contentType?.includes("application/json")) {
        return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 })
      } else {
        return NextResponse.redirect(new URL("/login?error=contraseña-incorrecta", req.url))
      }
    }

    const payload: AuthTokenPayload = { id: user.id, email: user.email, role: user.role as UserRole }
    const token = signAuthToken(payload)

    // Si es form data, redirigir; si es JSON, devolver JSON
    if (contentType?.includes("application/json")) {
      const res = NextResponse.json({ user: payload })
      res.cookies.set("auth_token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      })
      return res
    } else {
      // Redirección para form data
      const redirectUrl = redirect && redirect !== "null" ? redirect : "/"
      const res = NextResponse.redirect(new URL(redirectUrl, req.url))
      res.cookies.set("auth_token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      })
      return res
    }
  } catch (e) {
    if (req.headers.get("content-type")?.includes("application/json")) {
      return NextResponse.json({ error: "Error iniciando sesión" }, { status: 500 })
    } else {
      return NextResponse.redirect(new URL("/login?error=error-servidor", req.url))
    }
  }
}



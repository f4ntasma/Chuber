import { NextRequest, NextResponse } from "next/server"
import { hashPassword, signAuthToken, comparePassword, type AuthTokenPayload } from "@/lib/auth"
import { addDays } from "date-fns"
import { prisma } from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password, name, asProvider } = body || {}

    if (!email || !password) {
      return NextResponse.json({ error: "Email y contraseña requeridos" }, { status: 400 })
    }

    const exists = await prisma.user.findUnique({ where: { email } })
    let user
    let role = asProvider ? ("provider" as const) : ("user" as const)
    if (exists) {
      const ok = await comparePassword(password, exists.passwordHash)
      if (!ok) {
        return NextResponse.json({ error: "El usuario ya existe. Contraseña incorrecta." }, { status: 409 })
      }
      // Ascender a proveedor si lo solicitó
      if (asProvider) {
        await prisma.user.update({ where: { id: exists.id }, data: { role: "provider", trialEndsAt: exists.trialEndsAt ?? addDays(new Date(), 30) } })
        await prisma.providerProfile.upsert({ where: { userId: exists.id }, update: {}, create: { userId: exists.id } })
        role = "provider"
      } else {
        role = (exists.role as any) || "user"
      }
      user = exists
    } else {
      const passwordHash = await hashPassword(password)
      user = await prisma.user.create({
        data: {
          email,
          name: name || email.split("@")[0],
          role,
          passwordHash,
          trialEndsAt: asProvider ? addDays(new Date(), 30) : null,
        },
      })
      if (asProvider) {
        await prisma.providerProfile.create({ data: { userId: user.id } })
      }
    }

    const tokenPayload: AuthTokenPayload = { id: user.id, email, role }
    const token = signAuthToken(tokenPayload)

    const res = NextResponse.json({ user: tokenPayload })
    res.cookies.set("auth_token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    })
    return res
  } catch (err) {
    return NextResponse.json({ error: "Error registrando usuario" }, { status: 500 })
  }
}



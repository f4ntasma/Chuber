import { NextRequest, NextResponse } from "next/server"
import { verifyAuthToken } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value
  const payload = token ? verifyAuthToken(token) : null
  if (!payload) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const user = await prisma.user.findUnique({ where: { id: payload.id } })
  if (!user) return NextResponse.json({ error: "No encontrado" }, { status: 404 })
  const { id, email, name, role, image } = user
  return NextResponse.json({ user: { id, email, name, role, image } })
}

export async function PATCH(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value
  const payload = token ? verifyAuthToken(token) : null
  if (!payload) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const body = await req.json()
  const { name, image } = body || {}
  const user = await prisma.user.findUnique({ where: { id: payload.id } })
  if (!user) return NextResponse.json({ error: "No encontrado" }, { status: 404 })
  await prisma.user.update({ where: { id: user.id }, data: { name: typeof name === "string" ? name : undefined, image: typeof image === "string" ? image : undefined } })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value
  const payload = token ? verifyAuthToken(token) : null
  if (!payload) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  
  // Eliminar usuario y todos sus datos relacionados
  await prisma.user.delete({ where: { id: payload.id } })
  
  return NextResponse.json({ ok: true })
}



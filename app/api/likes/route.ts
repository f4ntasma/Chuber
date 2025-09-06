import { NextRequest, NextResponse } from "next/server"
import { verifyAuthToken } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value
  const payload = token ? verifyAuthToken(token) : null
  if (!payload) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const mine = await prisma.like.findMany({ where: { userId: payload.id } })
  const ids = mine.map((l) => l.providerId)
  return NextResponse.json({ likes: ids })
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value
  const payload = token ? verifyAuthToken(token) : null
  if (!payload) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const body = await req.json()
  const { providerId } = body || {}
  if (!providerId) return NextResponse.json({ error: "providerId requerido" }, { status: 400 })
  const existing = await prisma.like.findUnique({ where: { userId_providerId: { userId: payload.id, providerId: String(providerId) } } })
  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } })
    return NextResponse.json({ liked: false })
  }
  
  // Crear el like
  await prisma.like.create({ data: { userId: payload.id, providerId: String(providerId) } })
  
  // Crear notificación para el proveedor
  const provider = await prisma.providerProfile.findUnique({
    where: { id: providerId },
    include: { user: true }
  })
  
  if (provider) {
    // Obtener el nombre del usuario que da like
    const fromUser = await prisma.user.findUnique({ where: { id: payload.id } })
    
    await prisma.notification.create({
      data: {
        userId: provider.userId,
        type: "like",
        message: `${fromUser?.name || "Alguien"} le dio like a tu perfil`
      }
    })
  }
  
  return NextResponse.json({ liked: true })
}



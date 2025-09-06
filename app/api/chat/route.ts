import { NextRequest, NextResponse } from "next/server"
import { verifyAuthToken } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value
  const me = token ? verifyAuthToken(token) : null
  if (!me) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const withUserId = searchParams.get("withUserId")
  if (!withUserId) return NextResponse.json({ error: "withUserId requerido" }, { status: 400 })
  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { fromUserId: me.id, toUserId: withUserId },
        { fromUserId: withUserId, toUserId: me.id },
      ],
    },
    orderBy: { createdAt: "asc" },
  })
  return NextResponse.json({ messages })
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value
  const me = token ? verifyAuthToken(token) : null
  if (!me) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const body = await req.json()
  const { toUserId, content } = body || {}
  if (!toUserId || !content) return NextResponse.json({ error: "Datos incompletos" }, { status: 400 })
  const msg = await prisma.message.create({ data: { fromUserId: me.id, toUserId, content } })
  
  // Obtener el nombre del usuario que envía el mensaje
  const fromUser = await prisma.user.findUnique({ where: { id: me.id } })
  
  // Crear notificación para el destinatario
  await prisma.notification.create({
    data: {
      userId: toUserId,
      type: "message",
      message: `${fromUser?.name || "Alguien"} te envió un mensaje`
    }
  })
  
  return NextResponse.json({ message: msg })
}



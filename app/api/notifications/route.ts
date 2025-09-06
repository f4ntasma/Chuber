import { NextRequest, NextResponse } from "next/server"
import { verifyAuthToken } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value
  const me = token ? verifyAuthToken(token) : null
  if (!me) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  // Obtener notificaciones del usuario
  const notifications = await prisma.notification.findMany({
    where: { userId: me.id },
    orderBy: { createdAt: "desc" },
    take: 20
  })

  const unreadCount = notifications.filter(n => !n.read).length

  return NextResponse.json({ 
    notifications: notifications.map(n => ({
      id: n.id,
      type: n.type,
      message: n.message,
      createdAt: n.createdAt,
      read: n.read
    })),
    unreadCount 
  })
}

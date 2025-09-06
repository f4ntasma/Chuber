import { NextRequest, NextResponse } from "next/server"
import { verifyAuthToken } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = req.cookies.get("auth_token")?.value
  const me = token ? verifyAuthToken(token) : null
  if (!me) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  await prisma.notification.update({
    where: { 
      id: params.id,
      userId: me.id // Asegurar que solo puede marcar sus propias notificaciones
    },
    data: { read: true }
  })

  return NextResponse.json({ ok: true })
}

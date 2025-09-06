import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyAuthToken } from "@/lib/auth"

export async function POST(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value
  const me = token ? verifyAuthToken(token) : null
  if (!me) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  // Nota: Para MVP, permitimos a cualquier usuario; idealmente, chequear rol admin

  const body = await req.json()
  const { paymentId, approve } = body || {}
  if (!paymentId) return NextResponse.json({ error: "paymentId requerido" }, { status: 400 })
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } })
  if (!payment) return NextResponse.json({ error: "Pago no encontrado" }, { status: 404 })

  if (approve) {
    await prisma.$transaction([
      prisma.payment.update({ where: { id: paymentId }, data: { status: "approved", approvedAt: new Date() } }),
      prisma.user.update({ where: { id: payment.userId }, data: { subscriptionActive: true } }),
    ])
  } else {
    await prisma.payment.update({ where: { id: paymentId }, data: { status: "rejected" } })
  }
  return NextResponse.json({ ok: true })
}



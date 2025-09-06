import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyAuthToken } from "@/lib/auth"

export async function GET(req: NextRequest) {
  // TEMPORALMENTE DESHABILITADO - MOSTRAR TODOS LOS PAGOS PARA ADMIN
  const payments = await prisma.payment.findMany({ orderBy: { createdAt: "desc" } })
  return NextResponse.json({ payments })
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value
  const me = token ? verifyAuthToken(token) : null
  if (!me) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const body = await req.json()
  const { reference, amount } = body || {}
  if (!reference || !amount) return NextResponse.json({ error: "Datos incompletos" }, { status: 400 })
  const payment = await prisma.payment.create({ data: { userId: me.id, reference, amount: Number(amount) || 250, method: "yape", currency: "PEN" } })
  return NextResponse.json({ ok: true, payment })
}



import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { hashPassword } from "@/lib/auth"

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { email, code, newPassword } = body || {}
  
  if (!email || !code || !newPassword) {
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
  }

  // Verificar código (simplificado - en producción usar tabla separada)
  const codeMatch = user.passwordHash.includes(`_temp_code_${code}_`)
  if (!codeMatch) {
    return NextResponse.json({ error: "Código inválido" }, { status: 400 })
  }

  const newPasswordHash = await hashPassword(newPassword)
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: newPasswordHash }
  })

  return NextResponse.json({ ok: true, message: "Contraseña actualizada" })
}

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// Simulación de SMS - en producción usar Twilio, AWS SNS, etc.
const sendSMS = async (phone: string, code: string) => {
  console.log(`SMS enviado a ${phone}: Tu código de verificación es ${code}`)
  return true
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { email, phone } = body || {}
  
  if (!email || !phone) {
    return NextResponse.json({ error: "Email y teléfono requeridos" }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString()
  
  // Guardar código temporalmente (en producción usar Redis o DB)
  await prisma.user.update({
    where: { id: user.id },
    data: { 
      // Usar un campo temporal o crear tabla de códigos
      passwordHash: user.passwordHash + `_temp_code_${code}_${Date.now()}`
    }
  })

  await sendSMS(phone, code)
  
  return NextResponse.json({ ok: true, message: "Código enviado por SMS" })
}

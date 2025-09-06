import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    // Buscar usuario por email
    const user = await prisma.user.findUnique({
      where: { email: 'empoderati03@gmail.com' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    })

    if (!user) {
      return NextResponse.json({ 
        message: 'Usuario no encontrado',
        exists: false
      })
    }

    return NextResponse.json({ 
      message: 'Usuario encontrado',
      exists: true,
      user: user,
      isAdmin: user.role === 'admin'
    })
    
  } catch (error) {
    console.error('Error verificando admin:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}


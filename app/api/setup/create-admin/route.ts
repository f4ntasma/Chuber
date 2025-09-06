import { NextRequest, NextResponse } from "next/server"
import { hashPassword } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    // Verificar si ya existe un admin
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'admin' }
    })

    if (existingAdmin) {
      return NextResponse.json({ 
        message: 'Ya existe un usuario admin',
        admin: {
          email: existingAdmin.email,
          name: existingAdmin.name,
          role: existingAdmin.role
        }
      })
    }

    // Crear usuario admin
    const hashedPassword = await hashPassword('admin123')
    
    const admin = await prisma.user.create({
      data: {
        email: 'admin@chuberlite.com',
        name: 'Administrador',
        passwordHash: hashedPassword,
        role: 'admin'
      }
    })

    return NextResponse.json({ 
      message: 'Usuario admin creado exitosamente',
      admin: {
        email: admin.email,
        name: admin.name,
        role: admin.role,
        password: 'admin123'
      }
    })
    
  } catch (error) {
    console.error('Error creando admin:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

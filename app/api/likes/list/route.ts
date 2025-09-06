import { NextRequest, NextResponse } from "next/server"
import { verifyAuthToken } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value
  const payload = token ? verifyAuthToken(token) : null
  if (!payload) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  try {
    // Obtener los likes del usuario con información del proveedor
    const likes = await prisma.like.findMany({
      where: { userId: payload.id },
      include: {
        provider: {
          include: {
            user: {
              select: {
                name: true,
                image: true
              }
            }
          }
        }
      },
      orderBy: { id: "desc" },
      take: 20
    })

    return NextResponse.json({ 
      likes: likes.map(like => ({
        id: like.id,
        providerId: like.providerId,
        providerName: like.provider.user.name,
        providerImage: like.provider.user.image,
        serviceName: (like.provider as any).specialty || "Servicio",
        createdAt: new Date().toISOString() // Usar fecha actual como placeholder
      }))
    })
  } catch (error) {
    console.error("Error fetching likes:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

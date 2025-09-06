import { NextRequest, NextResponse } from "next/server"
import { verifyAuthToken } from "@/lib/auth"
import { prisma } from "@/lib/db"


export async function GET(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value
  const me = token ? verifyAuthToken(token) : null
  if (!me) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  // Obtener conversaciones del usuario
  const conversations = await prisma.message.findMany({
    where: {
      OR: [
        { fromUserId: me.id },
        { toUserId: me.id }
      ]
    },
    include: {
      fromUser: { select: { id: true, name: true, image: true } },
      toUser: { select: { id: true, name: true, image: true } }
    },
    orderBy: { createdAt: "desc" }
  })

  // Agrupar por usuario
  const chatMap = new Map()
  
  conversations.forEach(msg => {
    const otherUser = msg.fromUserId === me.id ? msg.toUser : msg.fromUser
    const chatId = otherUser.id
    
    if (!chatMap.has(chatId)) {
      chatMap.set(chatId, {
        id: chatId,
        withUser: otherUser,
        lastMessage: null,
        unread: 0
      })
    }
    
    const chat = chatMap.get(chatId)
    if (!chat.lastMessage || msg.createdAt > chat.lastMessage.createdAt) {
      chat.lastMessage = {
        content: msg.content,
        createdAt: msg.createdAt
      }
    }
    
    // Contar mensajes no leídos (simplificado - en producción usar campo isRead)
    if (msg.toUserId === me.id) {
      chat.unread++
    }
  })

  const chats = Array.from(chatMap.values())
  
  return NextResponse.json({ chats })
}

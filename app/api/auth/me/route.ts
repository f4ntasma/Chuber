import { NextResponse } from "next/server"
import { verifyAuthToken } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(req: Request) {
  const token = req.headers.get("cookie")?.split("auth_token=")[1]
  const payload = token ? verifyAuthToken(token) : null

  if (!payload) {
    return NextResponse.json({ user: null }, { status: 401 })
  }

  const user = await prisma.user.findUnique({ where: { id: payload.id } })
  return NextResponse.json({ user })
}

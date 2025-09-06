import { NextRequest, NextResponse } from "next/server"
import { verifyAuthToken } from "@/lib/auth"

export async function GET(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value
  const payload = token ? verifyAuthToken(token) : null
  
  if (!payload) {
    return NextResponse.json({ authenticated: false })
  }
  
  return NextResponse.json({ 
    authenticated: true, 
    user: payload 
  })
}

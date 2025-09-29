import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const users = await prisma.user.findMany()
    return NextResponse.json({ users, count: users.length })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
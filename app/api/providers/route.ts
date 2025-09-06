import { NextRequest, NextResponse } from "next/server"
import { verifyAuthToken } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  const now = new Date()
  const profiles = await prisma.providerProfile.findMany({
    include: { user: true },
  })

  const providers = profiles
    .filter(
      (p) =>
        p.user.subscriptionActive ||
        (p.user.trialEndsAt ? p.user.trialEndsAt > now : false)
    )
    .map((p) => ({
      id: p.id,
      userId: p.userId,
      name: p.user.name,
      email: p.user.email,
      role: p.user.role,
      location: p.lat && p.lng ? { lat: p.lat, lng: p.lng } : null,
      rating: p.rating ?? 4.8,
      reviews: p.reviews ?? 20,
      priceRange: p.priceRange ?? "$10-50",
      specialty: p.specialty ?? "Servicios generales",
      image: p.user.image || p.image || "/default-avatar.png",
      available: p.available,
    }))

  return NextResponse.json({ providers })
}

export async function POST(req: NextRequest) {
  // Convert current user to provider or update provider profile
  const token = req.cookies.get("auth_token")?.value
  const payload = token ? verifyAuthToken(token) : null
  if (!payload)
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const body = await req.json()
  const { specialty, priceRange, location, image } = body || {}

  const user = await prisma.user.findUnique({ where: { id: payload.id } })
  if (!user)
    return NextResponse.json({ error: "Usuario inexistente" }, { status: 404 })

  await prisma.user.update({
    where: { id: user.id },
    data: { role: "provider" },
  })

  const updated = await prisma.providerProfile.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      specialty: specialty || undefined,
      priceRange: priceRange || undefined,
      image: image || undefined,
      lat: location?.lat ?? undefined,
      lng: location?.lng ?? undefined,
    },
    update: {
      specialty: specialty || undefined,
      priceRange: priceRange || undefined,
      image: image || undefined,
      lat: location?.lat ?? undefined,
      lng: location?.lng ?? undefined,
    },
  })

  return NextResponse.json({ ok: true, provider: { id: updated.id } })
}

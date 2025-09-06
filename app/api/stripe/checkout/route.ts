import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { verifyAuthToken } from "@/lib/auth"

export async function POST(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value
  const payload = token ? verifyAuthToken(token) : null
  if (!payload) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const priceId = body.priceId || process.env.STRIPE_PRICE_ID

  if (!process.env.STRIPE_SECRET_KEY || !priceId || !process.env.NEXT_PUBLIC_APP_URL) {
    return NextResponse.json({ error: "Configurar STRIPE_SECRET_KEY, STRIPE_PRICE_ID y NEXT_PUBLIC_APP_URL" }, { status: 500 })
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" as any })

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    customer_email: payload.email,
    subscription_data: {
      trial_period_days: 30,
      metadata: { userId: payload.id },
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/providers/manage?sub=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/providers/manage?sub=cancel`,
    metadata: { userId: payload.id },
  })

  return NextResponse.json({ url: session.url })
}



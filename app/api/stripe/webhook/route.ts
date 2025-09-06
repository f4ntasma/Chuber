import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { prisma } from "@/lib/db"

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature")
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!sig || !secret || !process.env.STRIPE_SECRET_KEY) return new NextResponse("Missing config", { status: 400 })

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" as any })
  const buf = await req.arrayBuffer()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(Buffer.from(buf), sig, secret)
  } catch {
    return new NextResponse("Invalid signature", { status: 400 })
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = (session.metadata?.userId as string) || null
    if (userId) {
      await prisma.user.update({ where: { id: userId }, data: { subscriptionActive: true } })
      await prisma.subscription.create({
        data: {
          userId,
          provider: session.subscription?.toString() || undefined,
          status: "active",
        },
      })
    }
  }

  return NextResponse.json({ received: true })
}

export const config = {
  api: {
    bodyParser: false,
  },
}



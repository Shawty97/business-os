import Stripe from 'stripe'
import { NextRequest, NextResponse } from 'next/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-02-24.acacia' })

export async function POST(req: NextRequest) {
  const { jobId, brandName } = await req.json()

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'eur',
        product_data: {
          name: `Business Paket: ${brandName}`,
          description: 'Komplettes Business-Paket: Brand, Marketing, Sales, Tech Stack, AI Agents, Revenue Model',
        },
        unit_amount: 4900, // 49€
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/result/${jobId}?paid=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/progress/${jobId}`,
    metadata: { jobId, brandName },
  })

  return NextResponse.json({ url: session.url })
}

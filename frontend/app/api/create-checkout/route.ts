export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey) return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })

  const Stripe = (await import('stripe')).default
  const stripe = new Stripe(stripeKey, { apiVersion: '2025-02-24.acacia' })

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
        unit_amount: 4900,
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/result/${jobId}?paid=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/progress/${jobId}`,
    metadata: { jobId, brandName },
  })

  return NextResponse.json({ checkoutUrl: session.url, url: session.url })
}

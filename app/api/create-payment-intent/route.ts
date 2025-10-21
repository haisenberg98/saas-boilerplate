import { NextRequest, NextResponse } from 'next/server';

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export async function POST(request: NextRequest) {
    try {
        const { amount } = await request.json();
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: 'nzd',
            automatic_payment_methods: {
                enabled: true
            }
        });

        return NextResponse.json({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
        });
    } catch (err) {
        console.error('Internal Error: ', err);

        return NextResponse.json(
            {
                error: `Internal Server Error: ${err}`
            },
            {
                status: 500
            }
        );
    }
}

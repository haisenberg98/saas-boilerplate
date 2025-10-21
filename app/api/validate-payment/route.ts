import { NextRequest, NextResponse } from 'next/server';
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
import prisma from '@/lib/prisma';
import { currentUser } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    const { paymentIntentId } = await request.json();
    const user = await currentUser();
    const userEmail = user?.primaryEmailAddress?.emailAddress;

    // Fetch the payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Check if the payment was successful
    if (paymentIntent.status === 'succeeded') {
      // Find the order in the database
      const order = await prisma.order.findFirst({
        where: {
          user: {
            email: userEmail,
          },
          paymentIntentId: paymentIntentId,
          paymentStatus: 'PAID',
        },
      });

      // Check if the order was already marked as processed (i.e., 'PAID')
      if (order) {
        return NextResponse.json({ success: true }); // Payment is valid
      } else {
        return NextResponse.json(
          { error: 'Order not found or already processed' },
          { status: 404 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid or pending payment intent' },
        { status: 400 }
      );
    }
  } catch (err) {
    console.error('Internal Error: ', err);
    return NextResponse.json(
      {
        error: `Internal Server Error: ${err}`,
      },
      {
        status: 500,
      }
    );
  }
}

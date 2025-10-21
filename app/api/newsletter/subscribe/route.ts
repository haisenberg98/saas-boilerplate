import { NextRequest, NextResponse } from 'next/server';

import NewsletterWelcomeEmail from '@/components/global/NewsletterWelcomeEmail';
import prisma from '@/lib/prisma';

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
    try {
        const { email, source = 'popup' } = await req.json();

        if (!email || !email.includes('@')) {
            return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
        }

        // Check if email already exists
        const existingSubscriber = await prisma.newsletterSubscriber.findUnique({
            where: { email }
        });

        if (existingSubscriber) {
            return NextResponse.json(
                {
                    error: 'ALREADY_SUBSCRIBED',
                    message: 'Email is already subscribed to our newsletter'
                },
                { status: 409 }
            );
        }

        // Create new subscriber
        const subscriber = await prisma.newsletterSubscriber.create({
            data: {
                email,
                source,
                isActive: true,
                discountUsed: false
            }
        });

        // Generate unique discount code for this subscriber
        const discountCode = `WELCOME${Date.now().toString().slice(-6)}`;

        // Create discount code in database
        await prisma.discountCode.create({
            data: {
                code: discountCode,
                discountValue: 15,
                isPercentage: true,
                expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
                maxUsage: 1, // Single use
                published: true
            }
        });

        // Try sending welcome email with discount code (best‑effort)
        let emailSent = false;
        const from = 'Kofe Store <support@kofe.co.nz>';

        console.log('Newsletter: Attempting to send email to:', email);
        console.log('Newsletter: RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);
        console.log('Newsletter: RESEND_API_KEY value:', process.env.RESEND_API_KEY ? `${process.env.RESEND_API_KEY.substring(0, 10)}...` : 'undefined');

        if (process.env.RESEND_API_KEY) {
            try {
                console.log('Newsletter: Sending email with Resend...');

                // Try with React Email component first
                let result = await resend.emails.send({
                    from,
                    to: [email],
                    subject: "Welcome to Kofe! Here's your 15% discount",
                    react: NewsletterWelcomeEmail({ discountCode, email }) as React.ReactElement
                });

                console.log('Newsletter: Resend API response:', result);

                if (!result.error && result.data?.id) {
                    emailSent = true;
                    console.log('Newsletter: Email sent successfully with React component, ID:', result.data.id);
                } else {
                    console.error('Newsletter: Resend send error with React component:', result.error);

                    // Fallback to simple HTML email
                    console.log('Newsletter: Trying fallback HTML email...');
                    const fallbackHtml = `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                            <h2 style="color: #42413D;">Welcome to Kofe!</h2>
                            <p>Thank you for subscribing to our newsletter. Here's your exclusive 15% discount code:</p>
                            <div style="background: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
                                <strong style="font-size: 24px; color: #42413D;">${discountCode}</strong>
                                <p style="margin: 10px 0 0 0; font-size: 12px; color: #666;">Valid for 30 days • Single use</p>
                            </div>
                            <p>Visit <a href="https://kofe.co.nz" style="color: #42413D;">kofe.co.nz</a> to start shopping!</p>
                        </div>
                    `;

                    const fallbackResult = await resend.emails.send({
                        from,
                        to: [email],
                        subject: "Welcome to Kofe! Here's your 15% discount",
                        html: fallbackHtml
                    });

                    if (!fallbackResult.error && fallbackResult.data?.id) {
                        emailSent = true;
                        console.log('Newsletter: Fallback email sent successfully, ID:', fallbackResult.data.id);
                    } else {
                        console.error('Newsletter: Fallback email also failed:', fallbackResult.error);
                    }
                }
            } catch (sendErr) {
                console.error('Newsletter: Resend exception:', sendErr);
                console.error('Newsletter: Exception details:', {
                    message: sendErr instanceof Error ? sendErr.message : 'Unknown error',
                    stack: sendErr instanceof Error ? sendErr.stack : undefined,
                });
            }
        } else {
            console.warn('Newsletter: RESEND_API_KEY not set; skipping email send');
        }

        return NextResponse.json({
            success: true,
            message: 'Successfully subscribed to newsletter',
            discountCode, // for immediate use in UI
            emailSent
        });
    } catch (error) {
        console.error('Newsletter subscription error:', error);

        return NextResponse.json(
            {
                error: 'Failed to subscribe to newsletter'
            },
            { status: 500 }
        );
    }
}

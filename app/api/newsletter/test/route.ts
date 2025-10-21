import { NextRequest, NextResponse } from 'next/server';

import NewsletterWelcomeEmail from '@/components/global/NewsletterWelcomeEmail';

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();

        if (!email || !email.includes('@')) {
            return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
        }

        console.log('Test: Environment check');
        console.log('Test: RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);
        console.log('Test: RESEND_API_KEY value:', process.env.RESEND_API_KEY ? `${process.env.RESEND_API_KEY.substring(0, 10)}...` : 'undefined');

        const testDiscountCode = 'TEST123456';

        // Test simple email first
        console.log('Test: Sending simple HTML email...');
        const simpleResult = await resend.emails.send({
            from: 'Kofe Store <support@kofe.co.nz>',
            to: [email],
            subject: 'Test Email - Simple HTML',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Test Email</h2>
                    <p>This is a simple test email to verify Resend is working.</p>
                    <p>Test discount code: <strong>${testDiscountCode}</strong></p>
                    <p>Time: ${new Date().toISOString()}</p>
                </div>
            `
        });

        console.log('Test: Simple email result:', simpleResult);

        // Test React Email component
        console.log('Test: Sending React Email component...');
        const reactResult = await resend.emails.send({
            from: 'Kofe Store <support@kofe.co.nz>',
            to: [email],
            subject: 'Test Email - React Component',
            react: NewsletterWelcomeEmail({ discountCode: testDiscountCode, email }) as React.ReactElement
        });

        console.log('Test: React email result:', reactResult);

        return NextResponse.json({
            success: true,
            message: 'Test emails sent',
            results: {
                simple: simpleResult,
                react: reactResult
            }
        });
    } catch (error) {
        console.error('Test email error:', error);
        return NextResponse.json(
            {
                error: 'Failed to send test emails',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
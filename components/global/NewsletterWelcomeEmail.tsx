import * as React from 'react';

import {
    Body,
    Column,
    Container,
    Head,
    Hr,
    Html,
    Img,
    Link,
    Preview,
    Row,
    Section,
    Text
} from '@react-email/components';

interface NewsletterWelcomeEmailProps {
    discountCode: string;
    email: string;
}

const baseUrl = process.env.NEXT_PUBLIC_DOMAIN || 'https://kofe.co.nz';

export const NewsletterWelcomeEmail: React.FC<NewsletterWelcomeEmailProps> = ({ discountCode }) => {
    return (
        <Html>
            <Head />
            <Preview>Welcome to Kofe! Here&apos;s your 15% discount</Preview>

            <Body style={main}>
                <Container style={container}>
                    {/* Logo Section */}
                    <Section>
                        <Row>
                            <Column align='center'>
                                <Link href='https://kofe.co.nz' style={productLink}>
                                    <Img
                                        src={`https://storage.googleapis.com/kofe_bucket/uploads/assets/kofe-logo-background.png`}
                                        width='60'
                                        height='30'
                                        alt='Kofe Logo'
                                    />
                                </Link>
                            </Column>
                        </Row>
                    </Section>

                    {/* Welcome Title */}
                    <Section>
                        <Row>
                            <Column align='center' style={welcomeTitle}>
                                <Text style={welcomeText}>Welcome to Kofe! </Text>
                                <Text style={welcomeSubtext}>Your coffee journey starts here</Text>
                            </Column>
                        </Row>
                    </Section>

                    {/* Discount Code Section */}
                    <Section style={discountSection}>
                        <Row>
                            <Column align='center'>
                                <Text style={discountTitle}>Your Exclusive 15% Discount</Text>
                                <Section style={discountCodeBox}>
                                    <Text style={discountCodeStyle}>{discountCode}</Text>
                                    <Text style={discountDetails}>Valid for 30 days • Single use</Text>
                                </Section>
                                <Text style={discountInstructions}>
                                    Copy this code and use it at checkout to save 15% on your first order!
                                </Text>
                            </Column>
                        </Row>
                    </Section>

                    {/* What's Next Section */}
                    <Section style={benefitsSection}>
                        <Row>
                            <Column>
                                <Text style={benefitsTitle}>What&apos;s Next?</Text>
                                <Text style={benefitItem}>
                                    🛒 Provider our premium coffee collection and use your discount
                                </Text>
                                <Text style={benefitItem}>📧 Receive brewing tips from our coffee experts</Text>
                                <Text style={benefitItem}>⚡ Get early access to new items and special offers</Text>
                                <Text style={benefitItem}>🎯 Enjoy member-only discounts throughout the year</Text>
                            </Column>
                        </Row>
                    </Section>

                    {/* CTA Button */}
                    <Section>
                        <Row>
                            <Column align='center' style={ctaSection}>
                                <Link href={baseUrl} style={ctaButton}>
                                    Start Shopping
                                </Link>
                            </Column>
                        </Row>
                    </Section>

                    {/* Help Section */}
                    <Section style={helpSection}>
                        <Row>
                            <Column>
                                <Text style={helpTitle}>Need Help?</Text>
                                <Text style={helpText}>
                                    If you have any questions, feel free to contact us at{' '}
                                    <Link href='mailto:support@kofe.co.nz' style={emailLink}>
                                        support@kofe.co.nz
                                    </Link>
                                </Text>
                            </Column>
                        </Row>
                    </Section>

                    <Hr style={footerLine} />

                    {/* Footer */}
                    <Section>
                        <Row>
                            <Column align='center'>
                                <Text style={footerText}>
                                    You&apos;re receiving this because you subscribed to Kofe newsletter.
                                    <br />
                                    <Link href={`${baseUrl}/unsubscribe`} style={footerLink}>
                                        Unsubscribe
                                    </Link>{' '}
                                    |{' '}
                                    <Link href={baseUrl} style={footerLink}>
                                        Visit our website
                                    </Link>
                                </Text>
                            </Column>
                        </Row>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
};

export default NewsletterWelcomeEmail;

// Styles following your existing email aesthetic
const main: React.CSSProperties = {
    fontFamily: '"Helvetica Neue",Helvetica,Arial,sans-serif',
    backgroundColor: '#ffffff'
};

const container: React.CSSProperties = {
    margin: '0 auto',
    padding: '20px 0px 48px',
    width: '660px',
    maxWidth: '100%'
};

const productLink: React.CSSProperties = {
    fontSize: '12px',
    color: 'rgb(0,112,201)',
    textDecoration: 'none'
};

const welcomeTitle: React.CSSProperties = {
    display: 'block',
    margin: '30px 0 20px 0'
};

const welcomeText: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 500,
    color: '#42413D',
    margin: '0'
};

const welcomeSubtext: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 400,
    color: '#42413D',
    margin: '5px 0 0 0'
};

const discountSection: React.CSSProperties = {
    backgroundColor: 'rgb(250,250,250)',
    borderRadius: '3px',
    padding: '20px',
    margin: '20px 0'
};

const discountTitle: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: 500,
    color: '#42413D',
    margin: '0 0 15px 0'
};

const discountCodeBox: React.CSSProperties = {
    backgroundColor: 'white',
    border: '1px solid rgba(128,128,128,0.2)',
    borderRadius: '3px',
    padding: '15px',
    margin: '10px 0'
};

const discountCodeStyle: React.CSSProperties = {
    fontSize: '20px',
    fontWeight: 600,
    color: '#42413D',
    letterSpacing: '2px',
    margin: '0'
};

const discountDetails: React.CSSProperties = {
    fontSize: '10px',
    color: '#42413D',
    margin: '5px 0 0 0'
};

const discountInstructions: React.CSSProperties = {
    fontSize: '12px',
    color: '#42413D',
    margin: '15px 0 0 0'
};

const benefitsSection: React.CSSProperties = {
    margin: '20px 0'
};

const benefitsTitle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 500,
    color: '#42413D',
    margin: '0 0 10px 0',
    borderBottom: '1px solid rgb(238,238,238)',
    paddingBottom: '5px'
};

const benefitItem: React.CSSProperties = {
    fontSize: '12px',
    color: '#42413D',
    margin: '8px 0',
    lineHeight: '1.4'
};

const ctaSection: React.CSSProperties = {
    margin: '30px 0'
};

const ctaButton: React.CSSProperties = {
    backgroundColor: '#42413D',
    color: 'white',
    padding: '12px 24px',
    textDecoration: 'none',
    borderRadius: '3px',
    fontSize: '12px',
    fontWeight: 600,
    display: 'inline-block'
};

const helpSection: React.CSSProperties = {
    backgroundColor: 'rgb(250,250,250)',
    borderRadius: '3px',
    padding: '15px',
    margin: '20px 0'
};

const helpTitle: React.CSSProperties = {
    fontSize: '12px',
    fontWeight: 500,
    color: '#42413D',
    margin: '0 0 8px 0'
};

const helpText: React.CSSProperties = {
    fontSize: '12px',
    color: '#42413D',
    margin: '0'
};

const emailLink: React.CSSProperties = {
    color: '#42413D',
    textDecoration: 'underline'
};

const footerLine: React.CSSProperties = {
    margin: '30px 0 20px 0'
};

const footerText: React.CSSProperties = {
    fontSize: '12px',
    color: '#42413D',
    margin: '0'
};

const footerLink: React.CSSProperties = {
    color: '#42413D',
    textDecoration: 'none'
};

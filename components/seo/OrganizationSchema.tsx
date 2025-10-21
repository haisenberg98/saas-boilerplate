import Script from 'next/script';

const OrganizationSchema = () => {
    const baseUrl = process.env.NEXT_PUBLIC_DOMAIN || 'http://localhost:3000';
    
    const organizationSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Kofe",
        "alternateName": "Kofe Limited",
        "url": baseUrl,
        "logo": `${baseUrl}/logo.png`,
        "description": "High-quality coffee equipment and supplies for outdoor adventures and home brewing in New Zealand and Australia",
        "address": {
            "@type": "PostalAddress",
            "addressCountry": "NZ",
            "addressRegion": "Auckland"
        },
        "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "customer service",
            "availableLanguage": ["English"]
        },
        "sameAs": [
            // Add your social media profiles here when you have them
            // "https://www.facebook.com/kofe",
            // "https://www.instagram.com/kofe",
            // "https://twitter.com/kofe"
        ],
        "areaServed": [
            {
                "@type": "Country",
                "name": "New Zealand"
            },
            {
                "@type": "Country", 
                "name": "Australia"
            }
        ],
        "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Coffee Equipment",
            "itemListElement": [
                {
                    "@type": "OfferCatalog",
                    "name": "Portable Coffee Makers",
                    "description": "Compact coffee brewing equipment for outdoor adventures"
                },
                {
                    "@type": "OfferCatalog",
                    "name": "Coffee Grinders",
                    "description": "Manual and electric grinders for perfect coffee grounds"
                },
                {
                    "@type": "OfferCatalog",
                    "name": "Espresso Equipment",
                    "description": "Professional-grade espresso machines and accessories"
                },
                {
                    "@type": "OfferCatalog",
                    "name": "Brewing Accessories",
                    "description": "Filters, scales, and other coffee brewing essentials"
                }
            ]
        }
    };

    return (
        <Script
            id="organization-schema"
            type="application/ld+json"
            dangerouslySetInnerHTML={{
                __html: JSON.stringify(organizationSchema)
            }}
        />
    );
};

export default OrganizationSchema;
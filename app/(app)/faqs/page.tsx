import React from 'react';

const FAQS = () => {
    const faqs = [
        {
            question: 'What is Kōfē?',
            answer: 'Kōfē offers high-quality coffee equipment and supplies for both outdoor adventures and home brewing enthusiasts. We provide a curated selection of portable coffee makers, grinders, and brewing kits designed for your coffee journey.'
        },
        {
            question: 'Where do you ship?',
            answer: 'We currently ship within New Zealand. If you are located outside of New Zealand and are interested in our items, please contact us to discuss shipping options.'
        },
        {
            question: 'How long does shipping take?',
            answer: 'Shipping typically takes 5-10 business days within New Zealand. Delivery times may vary depending on your location and our stock. You will receive a tracking number to monitor your fulfillment.'
        },
        {
            question: 'What payment methods do you accept?',
            answer: 'We accept major credit and debit cards, as well as other secure payment options like Stripe. All transactions are processed in New Zealand Dollars (NZD).'
        },
        {
            question: 'Can I return or exchange a item?',
            answer: 'Yes, we accept returns and exchanges within 30 days of purchase if the item is unused and in its original condition. For more information, visit our Returns and Refunds Policy.'
        },
        {
            question: 'How can I track my order?',
            answer: 'Once your order is shipped, you will receive a confirmation email with a tracking number. Use this number to check the status of your delivery.'
        },
        {
            question: 'How can I contact customer support?',
            answer: 'You can reach our customer support team via email at support@kofe.nz. We aim to respond to all inquiries within 24 hours.'
        },
        {
            question: 'Can I cancel my order?',
            answer: 'Orders can be canceled within 12 hours of placement. Please contact us immediately if you need to cancel or make changes to your order.'
        }
    ];

    return (
        <section className='container flex flex-col space-y-2 md:space-y-2 lg:mx-auto lg:max-w-4xl lg:space-y-0 xl:max-w-7xl'>
            <h2 className='mb-6 py-4 text-center'>Frequently Asked Questions</h2>
            <div className='mx-auto max-w-4xl space-y-6'>
                {faqs.map((faq, index) => (
                    <div key={index} className='p-6'>
                        <h2 className='mb-2 text-lg font-semibold'>{faq.question}</h2>
                        <p>{faq.answer}</p>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default FAQS;

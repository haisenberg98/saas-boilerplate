import React from 'react';

const ReturnPolicy = () => {
    const policies = [
        {
            title: 'Eligibility for Returns',
            content: `a. Items must be returned within 30 days of the purchase date.\n\nb. Items must be unused, in their original packaging, and in the same condition as received.\n\nc. Proof of purchase (e.g., receipt or order confirmation email) is required to process returns.`
        },
        {
            title: 'Non-Returnable Items',
            content: `a. Items that have been used, damaged, or are not in their original condition cannot be returned.\n\nb. Perishable goods such as coffee beans or consumable items are non-returnable unless defective.\n\nc. Gift cards and promotional items are non-returnable.`
        },
        {
            title: 'Return Process',
            content: `a. Contact us at support@kofe.co.nz with your order details and reason for the return.\n\nb. Once your return is approved, we will provide instructions on how and where to send your item(s).\n\nc. Customers are responsible for return shipping costs unless the return is due to a fault on our end (e.g., damaged or incorrect item).`
        },
        {
            title: 'Refunds',
            content: `a. Once your return is received and inspected, we will notify you of the approval or rejection of your refund.\n\nb. If approved, your refund will be processed, and the credit will automatically be applied to your original payment method within 5–10 business days.\n\nc. Please note that original shipping charges are non-refundable.`
        },
        {
            title: 'Exchanges',
            content: `a. If you need to exchange an item for a different item or size, please contact us at support@kofe.co.nz.\n\nb. Exchanges are subject to item availability.`
        },
        {
            title: 'Damaged or Defective Items',
            content: `a. If you receive a damaged or defective item, please contact us within 48 hours of delivery.\n\nb. Include photos of the damaged item and packaging, along with your order details.\n\nc. We will arrange for a replacement or refund as quickly as possible.`
        },
        {
            title: 'Contact Information',
            content: `If you have any questions or concerns about our Return Policy, please contact us:\n\nEmail: support@kofe.co.nz`
        }
    ];

    return (
        <section className='container flex flex-col space-y-2 md:space-y-2 lg:mx-auto lg:max-w-4xl lg:space-y-0 xl:max-w-7xl'>
            <h2 className='py-4 text-center'>Return Policy</h2>
            <p className='pb-6 text-center text-sm'>Last Updated: 01 November 2024</p>
            <div className='mx-auto max-w-4xl space-y-6'>
                {policies.map((policy, index) => (
                    <div key={index} className='p-6'>
                        <h2 className='mb-2 text-xl font-semibold'>{policy.title}</h2>
                        <p className='whitespace-pre-line'>{policy.content}</p>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default ReturnPolicy;

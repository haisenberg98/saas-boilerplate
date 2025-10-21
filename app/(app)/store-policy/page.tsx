import React from 'react';

const StorePolicy = () => {
    const policies = [
        {
            title: 'Agreement to Terms',
            content: `By accessing or using our Services, you agree to be bound by these Terms, whether you are a registered user or not. If you do not agree to these Terms, please do not use our Services.`
        },
        {
            title: 'Changes to Terms',
            content: `We may revise and update these Terms from time to time at our sole discretion. All changes are effective immediately when we post them. Your continued use of our Services following the posting of revised Terms means that you accept and agree to the changes. Please check this page regularly to stay informed about updates.`
        },
        {
            title: 'Privacy Policy',
            content: `Please review our Privacy Policy, which also governs your use of our Services, to understand our practices. By using our Services, you acknowledge that you have read and understood our Privacy Policy.`
        },
        {
            title: 'Use of Services',
            content: `a. You must be at least 18 years old to use our Services.\n\nb. You agree to use our Services only for lawful purposes and in accordance with these Terms.\n\nc. You agree not to use our Services in any way that violates any applicable law or regulation.`
        },
        {
            title: 'Intellectual Property Rights',
            content: `a. Our Services and their entire contents, features, and functionality are owned by Kōfē and are protected by copyright, trademark, and other intellectual property laws.\n\nb. You may not copy, reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any of the material on our Services without prior written consent.`
        },
        {
            title: 'Limitation of Liability',
            content: `In no event shall Kōfē, its officers, directors, employees, or agents, be liable to you for any direct, indirect, incidental, special, punitive, or consequential damages resulting from:\n\na. Errors, mistakes, or inaccuracies of content.\n\nb. Personal injury or property damage of any nature resulting from your access to and use of our Services.\n\nc. Any unauthorized access to or use of our secure servers.`
        },
        {
            title: 'Shipping and Returns',
            content: `a. We currently ship only within New Zealand. Delivery times and shipping costs are outlined at checkout.\n\nb. Returns are accepted within 30 days of purchase if the item is unused and in its original condition. Please see our Returns Policy for more details.`
        },
        {
            title: 'Governing Law',
            content: `These Terms shall be governed by and construed in accordance with the laws of New Zealand, without regard to its conflict of law principles.`
        },
        {
            title: 'Contact Us',
            content: `If you have any questions about these Terms, please contact us at:\n\nEmail: support@kofe.co.nz`
        },
        {
            title: 'Entire Agreement',
            content: `These Terms constitute the entire agreement between you and Kōfē regarding the use of our Services. They supersede and replace any prior agreements or understandings, whether written or oral.`
        }
    ];

    return (
        <section className='container flex flex-col space-y-2 md:space-y-2 lg:mx-auto lg:max-w-4xl lg:space-y-0 xl:max-w-7xl'>
            <h2 className='py-4 text-center'>Store Policy</h2>
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

export default StorePolicy;

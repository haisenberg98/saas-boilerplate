'use client';

import React, { useState } from 'react';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Icons
import { IoIosCloseCircleOutline } from 'react-icons/io';
import { MdCheck, MdEmail, MdLocalOffer } from 'react-icons/md';
import { toast } from 'react-toastify';

type NewsletterModalProps = {
    isOpen: boolean;
    onClose: () => void;
};

const NewsletterModal = ({ isOpen, onClose }: NewsletterModalProps) => {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !email.includes('@')) {
            toast.error('Please enter a valid email address');

            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch('/api/newsletter/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    source: 'popup'
                })
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Welcome! Check your email for your 15% discount code 🎉');
                onClose();

                // Store that user has seen the popup to prevent showing again
                localStorage.setItem('newsletter_popup_shown', 'true');
            } else {
                if (data.error === 'ALREADY_SUBSCRIBED') {
                    toast.info('You are already subscribed! Check your email for exclusive offers.');
                    onClose();
                } else {
                    toast.error(data.error || 'Failed to subscribe. Please try again.');
                }
            }
        } catch (error) {
            console.error('Newsletter subscription error:', error);
            toast.error('Failed to subscribe. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        // Set localStorage when user manually closes the popup
        localStorage.setItem('newsletter_popup_shown', 'true');
        onClose();
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div>
            {/* Centered with overlay on all screens */}
            <div
                className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4'
                onClick={handleBackdropClick}
                role='dialog'
                aria-modal='true'>
                <div
                    className='relative w-full max-w-sm transform rounded-md  bg-customSecondary shadow-2xl transition-all duration-300 animate-in fade-in-0 zoom-in-95'
                    onClick={(e) => e.stopPropagation()}>
                    {/* Close Button */}
                    <button
                        onClick={handleClose}
                        aria-label='Close newsletter signup'
                        className='absolute right-4 top-4 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-customPrimary text-customSecondary transition-colors '>
                        <IoIosCloseCircleOutline size={24} />
                    </button>

                    {/* Header */}
                    <div className='rounded-t-md bg-customPrimary px-6 py-4 text-customSecondary'>
                        <div className='mb-2 flex items-center'>
                            <MdLocalOffer size={24} className='mr-2 text-customSecondary' />
                            <h2 className='text-lg font-bold text-white'>Get 15% Off!</h2>
                        </div>
                        <p className='text-xs text-customSecondary/80'>Join our coffee community for exclusive deals</p>
                    </div>

                    {/* Content */}
                    <div className='px-6 py-4'>
                        <form onSubmit={handleSubmit} className='space-y-3'>
                            <div className='relative'>
                                <MdEmail
                                    className='absolute left-3 top-1/2 z-10 -translate-y-1/2 transform text-customLightGray'
                                    size={16}
                                />
                                <Input
                                    type='email'
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder='Enter your email'
                                    className='h-8 border-customGray pl-9  focus-visible:border-customPrimary focus-visible:ring-customPrimary'
                                    required
                                />
                            </div>

                            <Button
                                type='submit'
                                disabled={isSubmitting}
                                size='sm'
                                className='h-8 w-full bg-customPrimary text-sm text-customSecondary hover:bg-customTertiary'>
                                {isSubmitting ? (
                                    <div className='flex items-center justify-center'>
                                        <div className='mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-customSecondary'></div>
                                        Subscribing...
                                    </div>
                                ) : (
                                    'Claim Discount'
                                )}
                            </Button>
                        </form>

                        {/* Benefits */}
                        <div className='mt-3 space-y-1 text-xs text-customPrimary'>
                            <div className='flex items-center'>
                                <MdCheck className='mr-2 text-customGreen' size={14} />
                                Brewing guides & tips
                            </div>
                            <div className='flex items-center'>
                                <MdCheck className='mr-2 text-customGreen' size={14} />
                                New arrivals & restock alerts
                            </div>
                            <div className='flex items-center'>
                                <MdCheck className='mr-2 text-customGreen' size={14} />
                                Member discounts
                            </div>
                        </div>

                        <p className='mt-3 text-center text-xs text-customLightGray'>No spam, unsubscribe anytime.</p>
                    </div>
                </div>
            </div>

            {/* Single variant only; desktop block removed for cleanliness */}
        </div>
    );
};

export default NewsletterModal;

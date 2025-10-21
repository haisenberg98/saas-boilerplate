'use client';

import React, { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import ChatMode from '@/app/(app)/components/coffee/ChatMode';
import SimpleMode from '@/app/(app)/components/coffee/SimpleMode';
import type { ModalProps } from '@/lib/types';

import { Coffee } from 'lucide-react';
import { FaBolt, FaCoffee, FaComments } from 'react-icons/fa';
import { IoIosCloseCircleOutline } from 'react-icons/io';
import { IoShareOutline, IoSparkles } from 'react-icons/io5';
import { toast } from 'react-toastify';

const CoffeeAIModal = ({ handleCloseModal }: ModalProps) => {
    const [mode, setMode] = useState<'simple' | 'ai'>('ai');
    const router = useRouter();

    // Handle hash-based routing
    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash;
            if (hash === '#chat' || hash === '#ai') {
                setMode('ai');
            } else if (hash === '#quick' || hash === '#simple') {
                setMode('simple');
            } else {
                // Default to AI chat if no hash
                setMode('ai');
                // ensure URL reflects the default
                window.history.replaceState(null, '', `/coffee-ai#chat`);
            }
        };

        // Check initial hash
        handleHashChange();

        // Listen for hash changes
        window.addEventListener('hashchange', handleHashChange);

        return () => {
            window.removeEventListener('hashchange', handleHashChange);
        };
    }, []);

    // Update URL hash when mode changes
    const handleModeChange = (newMode: 'simple' | 'ai') => {
        setMode(newMode);
        const hash = newMode === 'ai' ? '#chat' : '#quick';

        // Use replaceState instead of pushState to avoid adding to history
        window.history.replaceState(null, '', `/coffee-ai${hash}`);
    };

    // Handle share functionality
    const handleShare = async () => {
        const hash = mode === 'ai' ? '#chat' : '#quick';
        const url = `${window.location.origin}/coffee-ai${hash}`;
        const title = `Coffee AI Assistant - ${mode === 'ai' ? 'AI Chat' : 'Quick Recipe'}`;
        const text = `Check out Kofe's Coffee AI Assistant: ${title}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title,
                    text,
                    url
                });
            } catch (error) {
                console.log(error);
            }
        } else {
            try {
                await navigator.clipboard.writeText(url);
                toast.success('Link copied to clipboard');
            } catch (error) {
                toast.error('Failed to copy link');
            }
        }
    };

    return (
        <>
            <div className='relative w-full'>
                <button className='absolute left-0 top-0 z-50 ml-4 mt-4' onClick={(e) => handleCloseModal(e)}>
                    <IoIosCloseCircleOutline size={50} />
                </button>

                <button onClick={handleShare} className='absolute right-0 top-0 z-50 mr-4 mt-4'>
                    <IoShareOutline size={40} />
                </button>

                {/* Header */}
                {/* <div className='bg-customSecondary p-4 pt-16'>
                    <div className='flex items-center justify-center space-x-3'>
                        <IoSparkles className='h-6 w-6 text-customTertiary' />
                        <h2 className='text-lg font-bold text-customPrimary md:text-xl'>Coffee AI Assistant</h2>
                    </div>
                </div> */}

                {/* Modal content */}
                <div className='px-3 pb-6 pt-20 md:px-4'>
                    <div className='mx-auto w-full max-w-2xl rounded-lg bg-white p-2 py-4 shadow-sm md:p-6'>
                        {/* Header */}
                        <div className='mb-4 text-center md:mb-6'>
                            <FaCoffee className='mx-auto h-8 w-8 text-customTertiary md:h-10 md:w-10' />
                            <h3 className='text-lg font-bold text-customPrimary md:text-xl'>Coffee AI Assistant</h3>
                            <p className='text-xs text-customDarkGray md:text-sm'>
                                Get personalized brewing advice and recipes
                            </p>
                        </div>

                        {/* Mode Toggle */}
                        <div className='mb-4 flex rounded-lg bg-customSecondary p-1 md:mb-6'>
                            <button
                                onClick={() => handleModeChange('ai')}
                                className={`flex-1 rounded-md px-2 py-2 text-xs font-medium transition-all md:px-4 md:text-sm ${
                                    mode === 'ai'
                                        ? 'bg-white text-customPrimary shadow-sm'
                                        : 'text-customDarkGray hover:text-customPrimary'
                                }`}>
                                <IoSparkles className='mr-1 inline h-4 w-4' /> Ask AI Anything
                            </button>
                            <button
                                onClick={() => handleModeChange('simple')}
                                className={`flex-1 rounded-md px-2 py-2 text-xs font-medium transition-all md:px-4 md:text-sm ${
                                    mode === 'simple'
                                        ? 'bg-white text-customPrimary shadow-sm'
                                        : 'text-customDarkGray hover:text-customPrimary'
                                }`}>
                                <FaBolt className='mr-1 inline h-4 w-4' /> Quick Recipe
                            </button>
                        </div>

                        {/* Content */}
                        <div className='min-h-0 w-full flex-1'>
                            {mode === 'simple' ? (
                                <SimpleMode onReset={() => handleModeChange('simple')} />
                            ) : (
                                <ChatMode />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CoffeeAIModal;

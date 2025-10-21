'use client';

import React from 'react';
import NewsletterModal from './NewsletterModal';
import { useNewsletterModal } from '@/hooks/useNewsletterModal';

const NewsletterModalWrapper = () => {
    const { isModalOpen, closeModal } = useNewsletterModal();

    return (
        <NewsletterModal 
            isOpen={isModalOpen} 
            onClose={closeModal} 
        />
    );
};

export default NewsletterModalWrapper;
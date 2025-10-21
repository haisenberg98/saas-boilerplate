'use client';

import React, { useState } from 'react';

import SpecificationsTab from '@/components/layouts/productdetailsmodal/SpecificationsTab';
import { useAppSelector } from '@/hooks/reduxHooks';

import ReviewsTab from './ReviewsTab';

const MenuTabs = () => {
    const [activeTab, setActiveTab] = useState('specifications');
    const selectedProduct = useAppSelector((state) => state.modal.selectedProduct);
    const reviewCount = selectedProduct?.reviews?.length || 0;

    return (
        <>
            <div className='flex w-full space-x-4 md:space-x-8 md:text-base'>
                <button
                    onClick={() => setActiveTab('specifications')}
                    className={`tabButton ${activeTab === 'specifications' ? 'tabButtonActive' : ''}`}>
                    Specifications
                </button>

                <button
                    onClick={() => setActiveTab('reviews')}
                    className={`tabButton ${activeTab === 'reviews' ? 'tabButtonActive' : ''}`}>
                    Reviews {reviewCount > 0 && <span className='ml-1 text-base opacity-70'>({reviewCount})</span>}
                </button>
            </div>
            {activeTab === 'specifications' && <SpecificationsTab />}
            {activeTab === 'reviews' && <ReviewsTab />}
        </>
    );
};

export default MenuTabs;

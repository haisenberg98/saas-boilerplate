'use client';

import React, { useEffect, useState } from 'react';

import Link from 'next/link';

//redux
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';
import { openPageModal } from '@/redux/slices/modalSlice';
//clerk
import { useAuth, useClerk } from '@clerk/nextjs';

//icons
import {
    FaHome,
    // FaInfo,
    FaInfoCircle,
    // FaSearch,
    // FaPlus,
    // FaUser,
    // FaClipboardList,
    FaShoppingCart,
    FaSignOutAlt,
    FaTags
} from 'react-icons/fa';
import { IoSparkles } from 'react-icons/io5';

const NavigationItems = () => {
    const [showBlogBadge, setShowBlogBadge] = useState(false);
    const [showAIBadge, setShowAIBadge] = useState(false);

    useEffect(() => {
        const seenBlog = localStorage.getItem('seenBlog');
        if (!seenBlog) {
            setShowBlogBadge(true);
        }
        
        const seenAI = localStorage.getItem('seenCoffeeAI');
        if (!seenAI) {
            setShowAIBadge(true);
        }
    }, []);

    const handleBlogClick = () => {
        localStorage.setItem('seenBlog', 'true');
        setShowBlogBadge(false);
    };

    const handleAIClick = () => {
        localStorage.setItem('seenCoffeeAI', 'true');
        setShowAIBadge(false);
    };

    //clerk
    const { signOut } = useClerk();
    const { isSignedIn } = useAuth();

    const dispatch = useAppDispatch();
    const [totalItems, setTotalItems] = useState(0);
    const cartTotalItems = useAppSelector((state) => state.cart.totalItems);
    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
    };

    useEffect(() => {
        setTotalItems(cartTotalItems);
    }, [cartTotalItems]);

    const handleOpenCartModal = (e: React.MouseEvent) => {
        e.preventDefault();
        dispatch(openPageModal('cart'));
    };

    const handleOpenCoffeeAI = () => {
        handleAIClick(); // Mark as seen when clicked
        // No preventDefault() - allow normal navigation to /coffee-ai
    };

    return (
        <>
            <li>
                <div className='nav-items'>
                    <Link href='/' className='nav-links' title='Home'>
                        <FaHome />
                    </Link>
                </div>
            </li>
            <li>
                <div className='nav-items'>
                    <Link href='/categories' className='nav-links' title='Categories'>
                        <FaTags />
                    </Link>
                </div>
            </li>
            <li>
                <div className='nav-items relative'>
                    <Link href='/post' className='nav-links' title='Info' onClick={handleBlogClick}>
                        <FaInfoCircle />
                    </Link>

                    {showBlogBadge && (
                        <span className='badge absolute -right-2 -top-2 flex rounded-full bg-customTertiary px-2 text-sm'>
                            1
                        </span>
                    )}
                </div>
            </li>
            <li>
                <div className='nav-items relative'>
                    <Link href='/' className='nav-links' title='Shopping Cart' onClick={(e) => handleOpenCartModal(e)}>
                        <FaShoppingCart />
                    </Link>
                    {/* badge */}
                    <span className='badge absolute -right-2 -top-2 flex rounded-full bg-customTertiary px-2 text-sm'>
                        {totalItems}
                    </span>
                </div>
            </li>
            <li>
                <div className='nav-items relative'>
                    <Link 
                        href='/coffee-ai'
                        className='nav-links' 
                        title='Coffee AI Assistant'
                        onClick={handleOpenCoffeeAI}
                    >
                        <IoSparkles />
                    </Link>
                    
                    {showAIBadge && (
                        <span className='badge absolute -right-2 -top-2 flex rounded-full bg-customTertiary px-1 py-0.5 text-xs font-bold' style={{fontSize: '10px'}}>
                            NEW
                        </span>
                    )}
                </div>
            </li>
            {isSignedIn && (
                <li>
                    <div className='nav-items'>
                        <span
                            className='nav-links'
                            title='Logout'
                            onClick={(e: React.MouseEvent) => {
                                e.preventDefault();
                                signOut({ redirectUrl: '/login' });
                            }}>
                            <FaSignOutAlt />
                        </span>
                    </div>
                </li>
            )}
        </>
    );
};

export default NavigationItems;

'use client';

import React, { useEffect, useRef, useState } from 'react';

import Link from 'next/link';

//types
import { TDropdownProps } from '@/lib/types';

type DropdownChildProps = {
    isOpen: boolean;
    show: () => void;
    hide: () => void;
};
export const Dropdown = ({ children }: { children: React.ReactNode }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent): void => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const show = () => setIsOpen(true);
    const hide = () => setIsOpen(false);

    return (
        <div ref={ref} className='relative inline-block text-left'>
            {React.Children.map(children, (child) =>
                React.isValidElement<DropdownChildProps>(child)
                    ? React.cloneElement(child, { isOpen, show, hide })
                    : child
            )}
        </div>
    );
};

const DropdownToggle = ({ isOpen, show, hide, children }: TDropdownProps) => (
    <button type='button' onClick={isOpen ? hide : show} className='rounded bg-customPrimary text-white'>
        {children}
    </button>
);

DropdownToggle.displayName = 'DropdownToggle';

const DropdownToggleBullet = ({ isOpen, show, hide, children }: TDropdownProps) => (
    <button type='button' onClick={isOpen ? hide : show}>
        {children}
    </button>
);

DropdownToggleBullet.displayName = 'DropdownToggleBullet';

const DropdownMenu = ({ isOpen, children, hide }: TDropdownProps) =>
    !isOpen ? null : (
        <div className='dropdown-menu'>
            {React.Children.map(children, (child) =>
                React.isValidElement(child)
                    ? React.isValidElement<{ hide: () => void }>(child)
                        ? React.cloneElement(child, { hide })
                        : child
                    : child
            )}
        </div>
    );

DropdownMenu.displayName = 'DropdownMenu';

const DropdownItem = ({ to = '/', onClick, hide, children }: TDropdownProps) => (
    <Link
        href={to}
        onClick={(e) => {
            // If there's a custom onClick, call it
            if (onClick) {
                onClick(e);
            }
            // Hide the dropdown menu
            if (hide) {
                hide();
            }
        }}
        className='block py-3 pl-4 text-sm text-customDarkGray hover:bg-customTransparentPrimary md:text-xl'>
        {children}
    </Link>
);

DropdownItem.displayName = 'DropdownItem';

const DropdownItemButton = ({ onClick, children }: TDropdownProps) => (
    <button
        type='button'
        onClick={onClick}
        className='w-full py-2 pl-4 text-left text-sm hover:rounded-md hover:bg-customTransparentPrimary md:text-lg'>
        {children}
    </button>
);

DropdownItemButton.displayName = 'DropdownItemButton';

Dropdown.displayName = 'Dropdown';

export default Dropdown;
export { DropdownToggle, DropdownToggleBullet, DropdownMenu, DropdownItem, DropdownItemButton };

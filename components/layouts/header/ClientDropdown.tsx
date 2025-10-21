'use client';

//icons
import CurrencySwitcher from '@/components/global/CurrencySwitcher';
//components
import Dropdown, { DropdownItem, DropdownMenu, DropdownToggle } from '@/components/global/Dropdown';
//clerk
import { useUser } from '@clerk/clerk-react';
import { useClerk } from '@clerk/nextjs';

import { FaUser } from 'react-icons/fa';

type ClientDropdownProps = {
    isAdmin: boolean;
};

const ClientDropdown = ({ isAdmin }: ClientDropdownProps) => {
    const { user } = useUser();
    const { signOut } = useClerk();

    return (
        <Dropdown>
            <DropdownToggle>
                <div className='flex space-x-2 text-customSecondary hover:cursor-pointer'>
                    <span>{user?.firstName || 'User'}</span>
                    <FaUser className='text-xl md:text-3xl' />
                </div>
            </DropdownToggle>
            <DropdownMenu>
                <DropdownItem to='/orders'>Orders</DropdownItem>
                {isAdmin && <DropdownItem to='/item/list'>Item List</DropdownItem>}
                {/* {isAdmin && <DropdownItem to='/item-review/list'>Reviews</DropdownItem>} */}
                {isAdmin && <DropdownItem to='/provider/list'>Provider List</DropdownItem>}
                {isAdmin && <DropdownItem to='/post/list'>Post List</DropdownItem>}
                {isAdmin && <DropdownItem to='/delivery/zones'>Delivery Zones</DropdownItem>}
                {isAdmin && <DropdownItem to='/searched-keyword/list'>Keywords</DropdownItem>}

                <div
                    className='border-t border-gray-200 px-4 py-2'
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}>
                    <div className='relative z-[150] flex items-center space-x-2'>
                        <span className='text-sm text-gray-600 md:text-xl'>Currency:</span>
                        <div onMouseDown={(e) => e.stopPropagation()}>
                            <CurrencySwitcher />
                        </div>
                    </div>
                </div>

                <DropdownItem
                    onClick={(e: React.MouseEvent) => {
                        e.preventDefault();
                        signOut({ redirectUrl: '/login' });
                    }}>
                    Logout
                </DropdownItem>
            </DropdownMenu>
        </Dropdown>
    );
};

export default ClientDropdown;

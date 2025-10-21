import React from 'react';

import NavigationItems from './navigations/NavigationItems';

const DefaultNavigation = () => {
    return (
        <div className='default-navigation hidden flex-col rounded-md bg-customPrimary px-4 py-8 lg:flex'>
            {/* navigation */}
            <ul className='flex flex-col space-y-10'>
                <NavigationItems />
            </ul>
        </div>
    );
};

const MobileNavigation = () => {
    return (
        <div className='mobile-navigation fixed -bottom-px left-0 z-50 flex w-full justify-center bg-customPrimary px-2 lg:hidden'>
            {/* navigation */}
            <ul className='flex justify-center space-x-4 py-4 md:space-x-10 md:py-6 '>
                <NavigationItems />
            </ul>
        </div>
    );
};

const Navigation = () => {
    return (
        <nav className='lg:pl-4'>
            <DefaultNavigation />
            <MobileNavigation />
        </nav>
    );
};

export default Navigation;

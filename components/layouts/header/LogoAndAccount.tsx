import Link from 'next/link';

//components
import ClientDropdown from '@/components/layouts/header/ClientDropdown';
//utils
import { checkUserRole } from '@/lib/serverUtils';
//clerk
import { auth } from '@clerk/nextjs/server';

//icons
import { FaUser } from 'react-icons/fa';

const LogoAndAccount = async () => {
    const { userId } = auth();
    //user
    const isAdmin = await checkUserRole('ADMIN');

    return (
        <div className='container flex justify-between md:px-4 lg:mx-auto lg:max-w-4xl xl:max-w-7xl'>
            <Link href='/' className='md:h-26 md:w-26 flex h-20 w-20 items-center'>
                <h3 className='text-customSecondary'>Kōfē</h3>
            </Link>

            <div className='flex items-center space-x-4'>
                {userId ? (
                    <ClientDropdown isAdmin={isAdmin} />
                ) : (
                    <Link
                        href='/login'
                        className='text-custom Secondary hover:text-customSecondary active:text-customSecondary'>
                        <div className='flex space-x-2'>
                            <span>Login</span>
                            <FaUser className='text-xl md:text-3xl' />
                        </div>
                    </Link>
                )}
            </div>
        </div>
    );
};

export default LogoAndAccount;

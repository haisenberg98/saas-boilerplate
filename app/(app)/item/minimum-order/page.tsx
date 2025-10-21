import { redirect } from 'next/navigation';

import { serverClient } from '@/app/_trpc/serverClient';
import { checkUserRole } from '@/lib/serverUtils';

//components
import PageForm from './components/PageForm';

export default async function Edit() {
    const initialData = await serverClient.getMinimumOrder();

    //user
    const isAdmin = await checkUserRole('ADMIN');

    if (!isAdmin) {
        redirect('/');
    }

    return (
        <>
            <section className='w-full space-y-4 px-4 md:px-4 lg:mx-auto lg:max-w-4xl lg:px-10 xl:max-w-7xl'>
                <div className='flex items-center justify-between'>
                    <h3 className='md:text-2xl'>Change minimum order</h3>
                </div>
                <div className='flex flex-col justify-center pt-2'>
                    <PageForm initialData={initialData} />
                </div>
            </section>
        </>
    );
}

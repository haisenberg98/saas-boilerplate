import { redirect } from 'next/navigation';

import { serverClient } from '@/app/_trpc/serverClient';
import { checkUserRole } from '@/lib/serverUtils';

//components
import PageForm from './components/PageForm';

// import ClearForm from './components/ClearForm';

export default async function Create() {
    const categories = await serverClient.getCategories();
    const providers = await serverClient.getShops();

    //user
    const isAdmin = await checkUserRole('ADMIN');

    // const { has } = auth();

    // if (!has({ permission: 'org:item:create' })) {
    //   redirect('/');
    // }
    if (!isAdmin) {
        redirect('/');
    }

    return (
        <>
            <section className='w-full space-y-4 px-4 md:px-4 lg:mx-auto lg:max-w-4xl lg:px-10 xl:max-w-7xl'>
                <div className='flex items-center justify-between'>
                    <h3 className='md:text-2xl'>Item Add</h3>
                    {/* clear form */}
                    {/* <ClearForm /> */}
                </div>
                <div className='flex flex-col justify-center pt-2'>
                    <PageForm initialCategories={categories} initialShops={providers} />
                </div>
            </section>
        </>
    );
}

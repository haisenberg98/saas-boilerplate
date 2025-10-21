import { redirect } from 'next/navigation';
import { checkUserRole } from '@/lib/serverUtils';

//components
import PageForm from './components/PageForm';

export default async function AddProductReview() {
    // Check if user has admin role
    const isAdmin = await checkUserRole('ADMIN');
    if (!isAdmin) {
        redirect('/');
    }

    return (
        <>
            <section className='w-full space-y-4 px-4 md:px-4 lg:mx-auto lg:max-w-4xl lg:px-10 xl:max-w-7xl'>
                <div className='flex items-center justify-between'>
                    <h3 className='md:text-2xl'>Add New Review (Admin Only)</h3>
                </div>
                <div className='flex flex-col justify-center pt-2'>
                    <PageForm />
                </div>
            </section>
        </>
    );
}
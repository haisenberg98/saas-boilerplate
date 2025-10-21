//components
import CheckCartItem from '@/components/global/CheckCartItem';

import ClearForm from './components/ClearForm';
import PageForm from './components/PageForm';

export default async function Delivery() {
    return (
        <>
            <CheckCartItem />
            <section className='w-full space-y-4 px-4 md:px-4 lg:mx-auto lg:max-w-4xl lg:px-10 xl:max-w-7xl'>
                <div className='flex items-center justify-between'>
                    <h3 className='md:text-2xl'>Delivery Details</h3>
                    {/* clear form */}
                    <ClearForm />
                </div>
                <div className='flex flex-col justify-center pt-2'>
                    <PageForm />
                </div>
            </section>
        </>
    );
}

//components
import DataList from './components/DataList';

export const dynamic = 'force-dynamic';

export default async function Orders() {
    return (
        <>
            <section className='container flex flex-col space-y-2 md:space-y-4 md:px-4 lg:mx-auto lg:max-w-4xl lg:px-10 xl:max-w-7xl'>
                <DataList />
            </section>
        </>
    );
}

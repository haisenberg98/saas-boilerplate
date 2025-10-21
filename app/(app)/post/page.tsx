import { serverClient } from '@/app/_trpc/serverClient';

//components
import DataList from './components/DataList';

export const metadata = {
    title: 'Post',
    description: `Kofe post page. Find the latest news and updates about Kofe here.`,
    openGraph: {
        title: 'Post',
        description: 'Kofe post page. Find the latest news and updates about Kofe here.'
    }
};

export default async function Home() {
    //default data
    const initialData = await serverClient.getPosts();

    return (
        <>
            <section className='container flex flex-col space-y-2 md:space-y-4 lg:mx-auto lg:max-w-4xl xl:max-w-7xl'>
                <DataList initialData={initialData} />
            </section>
        </>
    );
}

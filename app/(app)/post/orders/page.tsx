//components
import DataList from './components/DataList';

export const dynamic = 'force-dynamic';

export default async function Orders() {
  return (
    <>
      <section className='flex flex-col space-y-2 container lg:mx-auto lg:max-w-4xl xl:max-w-7xl md:space-y-4 md:px-4 lg:px-10'>
        <DataList />
      </section>
    </>
  );
}

import { redirect } from 'next/navigation';
import { checkUserRole } from '@/lib/serverUtils';
//components
import DataList from './components/DataList';

export const dynamic = 'force-dynamic';

export default async function List() {
  //user
  const isAdmin = await checkUserRole('ADMIN');
  if (!isAdmin) {
    redirect('/');
  }
  return (
    <>
      <section className='flex flex-col space-y-2 container lg:mx-auto lg:max-w-4xl xl:max-w-7xl md:space-y-4 md:px-4 lg:px-10'>
        <DataList />
      </section>
    </>
  );
}

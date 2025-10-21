import { redirect } from 'next/navigation';
import { serverClient } from '@/app/_trpc/serverClient';
import { checkUserRole } from '@/lib/serverUtils';

//components
import PageForm from './components/PageForm';

//types
type EditProps = {
  params: {
    id: string[];
  };
};

export default async function Edit({ params }: EditProps) {
  const id = params.id[0];
  const initialData = await serverClient.getDiscountCodeById(id);
  console.log(id);

  //user
  const isAdmin = await checkUserRole('ADMIN');

  if (!isAdmin) {
    redirect('/');
  }
  return (
    <>
      <section className='w-full px-4 space-y-4 lg:mx-auto lg:max-w-4xl xl:max-w-7xl md:px-4 lg:px-10'>
        <div className='flex justify-between items-center'>
          <h3 className='md:text-2xl'>{initialData?.code}</h3>
        </div>
        <div className='flex flex-col justify-center pt-2'>
          <PageForm initialData={initialData} dataId={id} />
        </div>
      </section>
    </>
  );
}

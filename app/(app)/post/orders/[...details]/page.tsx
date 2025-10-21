import React from 'react';
import { serverClient } from '@/app/_trpc/serverClient';

//components
import Details from './components/Details';

//utils
import { checkUserRole } from '@/lib/serverUtils';

type DetailsProps = {
  params: {
    details: string[];
  };
};

const OrderDetails = async ({ params }: DetailsProps) => {
  const id = params.details[1];
  const data = await serverClient.getUserOrderById(id);
  const isAdmin = await checkUserRole('ADMIN');

  return <Details initialData={data} dataId={id} isAdmin={isAdmin} />;
};

export default OrderDetails;

import React from 'react';

//components
import PageForm from '../trackingactions/PageForm';

//types
type TrackingActionsProps = {
  trackingCode: string;
  shippingProvider: string;
  shippingProviderWebsite: string;
  shopName: string;
  orderId: string;
  orderCode: string;
  shipmentId: string;
};

const TrackingActions = ({
  trackingCode,
  shippingProvider,
  shippingProviderWebsite,
  shopName,
  orderCode,
  shipmentId,
}: TrackingActionsProps) => {
  return (
    <>
      <div className='flex flex-col pb-6 '>
        <div className='flex flex-col space-y-1'>
          <PageForm
            trackingCode={trackingCode}
            shippingProvider={shippingProvider}
            shippingProviderWebsite={shippingProviderWebsite}
            shopName={shopName}
            orderCode={orderCode}
            shipmentId={shipmentId}
          />
        </div>
      </div>
    </>
  );
};

export default TrackingActions;

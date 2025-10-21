'use server';

import prisma from '@/lib/prisma';

//utils
import { formatDate } from '@/lib/utils';

//for testing
export async function retrieveOrderDetails(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: true,
      orderItems: {
        include: {
          item: {
            include: {
              images: { select: { url: true, isPrimary: true } }, // Include images to fetch primary image
            },
          },
        },
      },
    },
  });

  if (order) {
    const orderDetails = {
      orderCode: order.orderCode || '',
      fullName: order.shippingFullName || '',
      address: order.shippingAddress || '',
      suburb: order.shippingSuburb || '',
      city: order.shippingCity || '',
      postCode: order.shippingPostCode || '',
      country: order.shippingCountry || '',
      phone: order.shippingPhone || '',
      deliveryInstructions: order.deliveryInstructions || '',
      shippingMethod: order.shippingMethod || '',
      totalPrice: order.totalPrice || 0,
      createdAt: formatDate(order.createdAt) || '',
      user: {
        firstName: order?.user?.firstName || '',
        lastName: order?.user?.lastName || '',
        email: order?.user?.email || '',
      },
      orderItems: order.orderItems.map(item => {
        // Extract primary image URL
        const primaryImage = item.item?.images.find(
          img => img.isPrimary
        )?.url;

        return {
          id: item?.item?.id || '',
          name: item?.item?.name || '',
          image: primaryImage || '', // Use primaryImage here
          quantity: item.quantity || 0,
          price: item.price || 0,
        };
      }),
    };

    return { orderDetails };
  }

  return null;
}

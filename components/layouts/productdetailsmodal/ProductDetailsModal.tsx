import React, { useState } from 'react';

import Image from 'next/image';

//trpc
import { trpc } from '@/app/_trpc/client';
import AddToCart from '@/components/global/AddToCartButton';
import SliderNormal from '@/components/global/SliderNormal';
//redux
import { useAppSelector } from '@/hooks/reduxHooks';
import { useCurrency } from '@/hooks/useCurrency';
import { convertNZD, displayPrice, fmt } from '@/lib/money';
//utils
import { useUser } from '@clerk/nextjs';

//components
import QuantityCounter from '../../global/QuantityCounter';
import ClientLink from './ClientLink';
import MenuTabs from './MenuTabs';
//icons
import { IoIosCloseCircleOutline } from 'react-icons/io';
import { IoShareOutline } from 'react-icons/io5';
import { toast } from 'react-toastify';
import 'swiper/css';
import 'swiper/css/pagination';
//swiper
import { SwiperSlide } from 'swiper/react';
//lightbox
import Lightbox from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import 'yet-another-react-lightbox/styles.css';

type ProductDetailsProps = {
    handleCloseModal: (e: React.MouseEvent) => void;
};

const ProductDetailsModal = ({ handleCloseModal }: ProductDetailsProps) => {
    const currency = useCurrency();
    const selectedProduct = useAppSelector((state) => state.modal.selectedProduct);
    const cartItem = useAppSelector((state) => state.cart.cartItems?.find((item) => item.id === selectedProduct?.id));
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    // Prepare images for lightbox
    const lightboxImages =
        selectedProduct?.images?.map((image) => ({
            src: image.url,
            alt: selectedProduct?.name || 'Item image'
        })) ||
        (selectedProduct?.image
            ? [
                  {
                      src: selectedProduct.image,
                      alt: selectedProduct?.name || 'Item image'
                  }
              ]
            : []);

    const { user } = useUser();
    const userEmail = user?.primaryEmailAddress?.emailAddress || '';

    //check if user is admin
    const { data } = trpc.getUser.useQuery(userEmail);

    const handleShare = async () => {
        const url = window.location.href;
        const title = selectedProduct?.name || 'Item';
        const text = `Check out this item: ${title}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title,
                    text,
                    url
                });
            } catch (error) {
                console.log(error);
            }
        } else {
            try {
                await navigator.clipboard.writeText(url);
                toast.success('Link copied to clipboard');
            } catch (error) {
                toast.error('Failed to copy link');
            }
        }
    };

    return (
        <>
            <div className='relative w-full'>
                <button className='absolute left-0 top-0 z-50 ml-4 mt-4' onClick={(e) => handleCloseModal(e)}>
                    <IoIosCloseCircleOutline size={50} />
                </button>

                <button onClick={handleShare} className='absolute right-0 top-0 z-50 mr-4 mt-4'>
                    <IoShareOutline size={40} />
                </button>
                {data?.role === 'ADMIN' && (
                    // edit item link
                    <ClientLink />
                )}

                {selectedProduct?.images && selectedProduct.images.length > 1 ? (
                    <SliderNormal>
                        {selectedProduct?.images.map((image, index) => (
                            <SwiperSlide key={index}>
                                <div className='flex flex-col'>
                                    {image?.url ? (
                                        <Image
                                            width={500}
                                            height={1000}
                                            src={image.url}
                                            alt={selectedProduct?.name}
                                            className='mb-4 h-96 w-full cursor-zoom-in object-cover md:object-contain'
                                            onClick={() => {
                                                setLightboxIndex(index);
                                                setLightboxOpen(true);
                                            }}
                                        />
                                    ) : (
                                        <div className='mb-4 flex h-96 w-full items-center justify-center bg-gray-200'>
                                            <span className='text-lg text-customPrimary'>No Image</span>
                                        </div>
                                    )}
                                </div>
                            </SwiperSlide>
                        ))}
                    </SliderNormal>
                ) : (
                    <div className='flex flex-col'>
                        {selectedProduct?.image ? (
                            <Image
                                width={500}
                                height={1000}
                                src={selectedProduct.image}
                                alt={selectedProduct?.name || ''}
                                className='mb-4 h-96 w-full cursor-zoom-in object-cover md:object-contain'
                                onClick={() => {
                                    setLightboxIndex(0);
                                    setLightboxOpen(true);
                                }}
                            />
                        ) : (
                            <div className='mb-4 flex h-96 w-full items-center justify-center bg-gray-200'>
                                <span className='text-lg text-customPrimary'>No Image</span>
                            </div>
                        )}
                    </div>
                )}

                {/* <div className='flex px-4 mt-2 space-x-2 items-start md:px-6 '>
          <p className=''>{selectedProduct?.description}</p>
        </div> */}
            </div>
            <div className='flex flex-col px-4 md:px-6'>
                {/* details */}
                <div className='flex justify-between'>
                    <div className='flex flex-col'>
                        <h4 className='line-clamp-2 md:text-xl'>{selectedProduct?.name}</h4>
                        <ul className='flex flex-col text-sm'>
                            <li className='mt-1 flex font-medium'>
                                <span>{selectedProduct?.category?.name}</span>
                            </li>
                        </ul>
                    </div>

                    {cartItem && (
                        <div className='flex flex-col items-center md:flex-row md:space-x-4'>
                            <span className='font-semibold'>Quantity</span>
                            <QuantityCounter itemId={selectedProduct?.id || ''} />
                        </div>
                    )}
                </div>
                <div className='mt-5 flex justify-between'>
                    <div className='flex flex-col justify-between'>
                        <div className='flex'>{` `}</div>
                        <span className='text-4xl font-semibold'>{displayPrice(selectedProduct?.price, currency)}</span>
                    </div>
                    {/* add to cart */}
                    {!cartItem && (
                        <div className='flex'>
                            <AddToCart item={selectedProduct} />
                        </div>
                    )}
                </div>
                <div className='mt-8 flex flex-col space-y-4 md:space-y-6'>
                    <MenuTabs />
                </div>
            </div>

            {/* Lightbox */}
            <Lightbox
                open={lightboxOpen}
                close={() => setLightboxOpen(false)}
                index={lightboxIndex}
                slides={lightboxImages}
                animation={{ fade: 300 }}
                controller={{ closeOnBackdropClick: true }}
                plugins={[Zoom]}
                zoom={{
                    maxZoomPixelRatio: 3,
                    zoomInMultiplier: 2,
                    doubleTapDelay: 300,
                    doubleClickDelay: 300,
                    doubleClickMaxStops: 2,
                    keyboardMoveDistance: 50,
                    wheelZoomDistanceFactor: 100,
                    pinchZoomDistanceFactor: 100
                }}
            />
        </>
    );
};

export default ProductDetailsModal;

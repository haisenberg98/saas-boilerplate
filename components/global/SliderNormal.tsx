'use client';
//Swiper
import { Swiper } from 'swiper/react';
// Import Swiper style
import 'swiper/css';
import 'swiper/css/pagination';
// import required modules
import { Pagination, Navigation, Autoplay } from 'swiper/modules';

type SliderNormalProps = {
  children: React.ReactNode;
  extraSmallSlidePerView?: number;
  smallSlidePerView?: number;
  mediumSlidePerView?: number;
  largeSlidePerView?: number;
  xlSlidePerView?: number;
  spaceBetween?: number;
  autoPlay?: boolean;
};

const SliderNormal = ({
  children,
  extraSmallSlidePerView = 1,
  smallSlidePerView = 1,
  mediumSlidePerView = 1,
  largeSlidePerView = 1,
  xlSlidePerView = 1,
  spaceBetween = 0,
  autoPlay = false,
}: SliderNormalProps) => {
  let autoplayOn;
  if (autoPlay) {
    autoplayOn = {
      delay: 1500,
      disableOnInteraction: false,
    };
  }
  return (
    <Swiper
      breakpoints={{
        320: {
          slidesPerView: extraSmallSlidePerView,
        },
        390: {
          //small
          slidesPerView: smallSlidePerView,
        },
        768: {
          //medium
          slidesPerView: mediumSlidePerView,
        },
        1024: {
          //large
          slidesPerView: largeSlidePerView,
        },
        1536: {
          //XL
          slidesPerView: xlSlidePerView,
        },
      }}
      spaceBetween={spaceBetween}
      pagination={{
        clickable: true,
        renderBullet: function (index, className) {
          return '<span class="' + className + '"></span>';
        },
      }}
      autoplay={autoplayOn}
      modules={[Pagination, Autoplay]}
      className='mySwiper'
    >
      {children}
    </Swiper>
  );
};

export default SliderNormal;

'use client';
//Swiper
import { Swiper } from 'swiper/react';
// Import Swiper style
import 'swiper/css';
import 'swiper/css/free-mode';
// import required modules
import { Autoplay, FreeMode } from 'swiper/modules';

type SliderFreeModeProps = {
  children: React.ReactNode;
  extraSmallSlidePerView?: number;
  smallSlidePerView?: number;
  mediumSlidePerView?: number;
  largeSlidePerView?: number;
  xlSlidePerView?: number;
  spaceBetween?: number;
  autoPlay?: boolean;
};

const SliderFreeMode = ({
  children,
  extraSmallSlidePerView = 4.5,
  smallSlidePerView = 4.5,
  mediumSlidePerView = 6.5,
  largeSlidePerView = 9,
  xlSlidePerView = 9,
  spaceBetween = 0,
  autoPlay = false,
}: SliderFreeModeProps) => {
  let autoplayOn;
  if (autoPlay) {
    autoplayOn = {
      delay: 2500,
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
      autoplay={autoplayOn}
      freeMode={true}
      modules={[FreeMode, Autoplay]}
      className='mySwiperFreeMode'
    >
      {children}
    </Swiper>
  );
};

export default SliderFreeMode;

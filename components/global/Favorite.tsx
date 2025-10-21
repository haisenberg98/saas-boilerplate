import React from 'react';
//BS
import { BsHeart, BsHeartFill } from 'react-icons/bs';

//types
import { TFavoriteProps } from '@/lib/types';

const Favorite = (props: TFavoriteProps) => {
  return (
    <div
      className='flex items-center lg:items-start pr-2'
      onClick={props.handleAddToFavorite}
    >
      {props.favoriteStatus ? (
        <BsHeartFill className='text-customPrimary md:text-2xl' />
      ) : (
        <BsHeart className='text-customPrimary md:text-2xl' />
      )}
    </div>
  );
};

export default Favorite;

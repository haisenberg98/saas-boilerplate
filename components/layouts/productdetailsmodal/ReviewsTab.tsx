import Link from 'next/link';

import { useAppSelector } from '@/hooks/reduxHooks';
import { formatDateFromISO } from '@/lib/utils';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa'; // Add FaRegStar for empty stars

//components
import PageForm from './PageForm';
import { useUser } from '@clerk/nextjs';

const ReviewsTab = () => {
  const selectedProduct = useAppSelector(state => state.modal.selectedProduct);
  const currentUser = useUser();

  // Ensure selectedProduct and reviews are defined before calculating
  const reviewCount = selectedProduct?.reviews?.length || 0;
  const averageRating =
    reviewCount > 0 && selectedProduct?.reviews
      ? selectedProduct.reviews.reduce(
          (acc, review) => acc + review.rating,
          0
        ) / reviewCount
      : 0;

  // Function to render stars with half-star support
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating); // Full stars
    const hasHalfStar = rating % 1 >= 0.5; // Check if there's a half star
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0); // Remaining empty stars

    return (
      <div className='flex items-center'>
        {[...Array(fullStars)].map((_, i) => (
          <FaStar key={i} size={20} className='text-yellow-500' />
        ))}
        {hasHalfStar && <FaStarHalfAlt size={20} className='text-yellow-500' />}
        {[...Array(emptyStars)].map((_, i) => (
          <FaRegStar key={i} size={20} className='text-gray-300' />
        ))}
      </div>
    );
  };

  // Check if the current user has already posted a review
  const hasReviewed = selectedProduct?.reviews?.some(
    review =>
      review.user.email === currentUser?.user?.primaryEmailAddress?.emailAddress
  );

  return (
    <div className='flex flex-col w-full space-y-6'>
      {/* Overall Rating and Review Count */}
      <div className='flex items-center space-x-2 px-1 lg:text-base xl:text-xl'>
        <div className='flex items-center '>
          <p className='font-bold pt-1'>{averageRating.toFixed(1)}</p>
          <div className='ml-2'>{renderStars(averageRating)}</div>
        </div>
        <p className=' text-customDarkGray pt-1 lg:text-base '>{`(${reviewCount} review${
          reviewCount > 1 ? 's' : ''
        })`}</p>
      </div>

      {reviewCount === 0 ? (
        <p className='text-customDarkGray text-center text-base lg:text-base xl:text-xl'>
          No reviews yet. Be the first to review this item!
        </p>
      ) : (
        <div className='flex flex-col space-y-6'>
          {selectedProduct?.reviews?.map(review => (
            <div
              key={review.id}
              className='flex flex-col p-4 border rounded-lg shadow-sm '
            >
              <div className='flex items-center justify-between mb-2'>
                {/* User's Name */}
                <div className='flex items-center space-x-3'>
                  <p className='font-medium text-base text-customPrimary'>
                    {review.user.firstName}
                  </p>
                </div>
                {/* Star Rating */}
                <div className='flex items-center space-x-1'>
                  {renderStars(review.rating)}
                </div>
              </div>

              {/* Review Content */}
              <p className='text-customDarkGray mb-3 text-base xl:text-xl'>
                {review.review}
              </p>

              {/* Review Date */}
              <div className='text-sm text-customPrimary'>
                Reviewed on {formatDateFromISO(review.createdAt)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Post a review */}
      <p className='text-customDarkGray text-center text-base xl:text-xl'>
        {currentUser.isSignedIn ? (
          hasReviewed ? (
            <>You have already reviewed this item.</>
          ) : (
            <PageForm />
          )
        ) : (
          <>
            Please{' '}
            <Link
              href={`/login`}
              className='underline underline-offset-2 text-base xl:text-xl'
            >
              login
            </Link>{' '}
            to post a review.
          </>
        )}
      </p>
    </div>
  );
};

export default ReviewsTab;

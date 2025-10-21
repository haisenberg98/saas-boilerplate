import NewOrderNotificationEmail from '@/components/global/NewOrderNotificationEmail';
//components
import OrderReceiptEmail from '@/components/global/OrderReceiptEmail';
import ShippedItemsEmail from '@/components/global/ShippedItemsEmail';
// Import Prisma types

//GCS
import { bucket } from '@/lib/googleStorage';
import { Currency } from '@/lib/money';
import prisma from '@/lib/prisma';
import { checkUserRole } from '@/lib/serverUtils';
//utils
import { formatDate, generateUniqueOrderCode } from '@/lib/utils';
//clerk
import { currentUser } from '@clerk/nextjs/server';
import {
    Currency as DbCurrency,
    DeliveryZone,
    OrderStatus,
    PaymentStatus,
    Prisma,
    Item,
    Provider
} from '@prisma/client';
//trpc
import { TRPCError } from '@trpc/server';

import { publicProcedure, router } from './trpc';
import { Resend } from 'resend';
import { z } from 'zod';

//resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Define a type that includes the item and images

export type ItemWithImageAndProvider = Item & {
    provider?: Provider | null;
    image: string | null;
};

type OrderItem = {
    itemId: string;
    quantity: number;
    price: number;
    providerId: string; // Assuming providerId represents the supplier/provider
};

function assignPrimaryImage(
    item: Item & { images: { url: string; isPrimary?: boolean }[]; provider?: Provider | null }
): ItemWithImageAndProvider {
    const primaryImageUrl = item.images.find((image) => image.isPrimary)?.url;
    const firstImageUrl = item.images[0]?.url; // Fallback to first image

    return {
        ...item,
        image: primaryImageUrl || firstImageUrl || null
    };
}

function normalizeCountry(code: string): string {
    switch (code) {
        case 'NZ':
            return 'New Zealand';
        case 'AU':
            return 'Australia';
        default:
            return code; // fallback: keep as-is
    }
}

export const appRouter = router({
    getUser: publicProcedure.input(z.string()).query(async ({ input }) => {
        const user = await prisma.user.findUnique({
            where: { email: input }
        });

        return user;
    }),

    bulkToggleProductsByShop: publicProcedure
        .input(
            z.object({
                providerId: z.string(),
                action: z.enum(['publish', 'unpublish'])
            })
        )
        .mutation(async ({ input }) => {
            const { providerId, action } = input;

            // Get provider name for response message
            const provider = await prisma.provider.findUnique({
                where: { id: providerId },
                select: { name: true }
            });

            const result = await prisma.item.updateMany({
                where: { providerId: providerId },
                data: { published: action === 'publish' }
            });

            const actionText = action === 'publish' ? 'published' : 'unpublished';
            const shopName = provider?.name || 'Unknown Provider';

            return {
                success: true,
                count: result.count,
                action,
                shopName,
                message: `Successfully ${actionText} ${result.count} items from ${shopName}`
            };
        }),

    getShopsWithProductCounts: publicProcedure.query(async () => {
        const providers = await prisma.provider.findMany({
            include: {
                items: {
                    select: {
                        id: true,
                        published: true
                    }
                }
            }
        });

        return providers.map((provider) => ({
            id: provider.id,
            name: provider.name,
            totalProducts: provider.items.length,
            publishedProducts: provider.items.filter((p) => p.published).length,
            unpublishedProducts: provider.items.filter((p) => !p.published).length
        }));
    }),

    getCategories: publicProcedure.query(async () => {
        const categories = await prisma.category.findMany({
            include: {
                items: {
                    select: {
                        id: true,
                        published: true
                    }
                }
            },
            orderBy: { orderNumber: 'asc' }
        });

        // Convert Date fields to strings for consistency
        return categories.map((category) => ({
            ...category,
            createdAt: category.createdAt instanceof Date ? category.createdAt.toISOString() : category.createdAt,
            updatedAt: category.updatedAt instanceof Date ? category.updatedAt.toISOString() : category.updatedAt
        }));
    }),

    getCategoryById: publicProcedure.input(z.string()).query(async ({ input }) => {
        const category = await prisma.category.findUnique({
            where: { id: input },
            include: {
                items: {
                    include: {
                        images: { select: { url: true, isPrimary: true } },
                        provider: { select: { id: true, name: true, phone: true } },
                        category: {
                            select: {
                                id: true,
                                name: true,
                                image: true,
                                createdAt: true,
                                updatedAt: true,
                                orderNumber: true
                            }
                        },
                        reviews: {
                            include: {
                                user: { select: { id: true, firstName: true, lastName: true, email: true } }
                            }
                        }
                    }
                }
            }
        });

        if (!category) return null;

        const productsWithImages = category.items.map((item) => ({
            ...item,
            image: item.images.find((img) => img.isPrimary)?.url || item.images[0]?.url || null,
            createdAt: item.createdAt instanceof Date ? item.createdAt.toISOString() : item.createdAt,
            updatedAt: item.updatedAt instanceof Date ? item.updatedAt.toISOString() : item.updatedAt,
            category: item.category
                ? {
                      ...item.category,
                      createdAt:
                          item.category.createdAt instanceof Date
                              ? item.category.createdAt.toISOString()
                              : item.category.createdAt,
                      updatedAt:
                          item.category.updatedAt instanceof Date
                              ? item.category.updatedAt.toISOString()
                              : item.category.updatedAt
                  }
                : null,
            reviews: item.reviews.map((review) => ({
                ...review,
                createdAt: review.createdAt instanceof Date ? review.createdAt.toISOString() : review.createdAt,
                updatedAt: review.updatedAt instanceof Date ? review.updatedAt.toISOString() : review.updatedAt
            }))
        }));

        return {
            ...category,
            createdAt: category.createdAt instanceof Date ? category.createdAt.toISOString() : category.createdAt,
            updatedAt: category.updatedAt instanceof Date ? category.updatedAt.toISOString() : category.updatedAt,
            items: productsWithImages
        };
    }),

    getUsers: publicProcedure.query(async () => {
        // Check if user is admin
        const isAdmin = await checkUserRole('ADMIN');
        if (!isAdmin) {
            throw new TRPCError({
                code: 'UNAUTHORIZED',
                message: 'Only admins can access user list'
            });
        }

        const users = await prisma.user.findMany({
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
            },
            orderBy: { createdAt: 'desc' }
        });

        return users;
    }),
    getUserOrders: publicProcedure.query(async () => {
        //check if user is admin
        const isAdmin = await checkUserRole('ADMIN');

        //get current user email
        const userData = await currentUser();
        const userEmail = userData?.primaryEmailAddress?.emailAddress;

        // If user is admin, fetch all orders, otherwise fetch orders related to the user's email
        const orders = await prisma.order.findMany({
            where: isAdmin ? {} : { user: { email: userEmail } },
            orderBy: { createdAt: 'desc' }
        });

        // Convert Date fields to strings
        return orders.map((order) => ({
            ...order,
            createdAt: order.createdAt.toISOString(),
            updatedAt: order.updatedAt.toISOString()
        }));
    }),
    getProducts: publicProcedure.query(async () => {
        const items = await prisma.item.findMany({
            where: { published: true },
            include: {
                // provider: { select: { id: true, name: true, phone: true } },
                provider: true,
                category: true, //include category
                images: { select: { url: true, isPrimary: true } }
            },
            orderBy: { clickCounts: 'desc' }
        });

        return items.map(assignPrimaryImage);
    }),
    getAllProducts: publicProcedure.query(async () => {
        const items = await prisma.item.findMany({
            include: {
                provider: true,
                category: true,
                images: { select: { url: true, isPrimary: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        return items.map(assignPrimaryImage);
    }),
    getShops: publicProcedure.query(async () => {
        const providers = await prisma.provider.findMany({
            select: {
                id: true,
                name: true,
                phone: true,
                address: true,
                minDeliveryTime: true,
                maxDeliveryTime: true
            },
            orderBy: { name: 'asc' }
        });

        return providers;
    }),
    getDiscountCodes: publicProcedure.query(async () => {
        const discounts = await prisma.discountCode.findMany({
            select: {
                id: true,
                code: true,
                discountValue: true,
                isPercentage: true,
                usageCount: true,
                maxUsage: true,
                createdAt: true,
                updatedAt: true
            },
            orderBy: { createdAt: 'desc' }
        });

        // Convert Date fields to strings
        return discounts.map((discount) => ({
            ...discount,
            createdAt: discount.createdAt instanceof Date ? discount.createdAt.toISOString() : discount.createdAt,
            updatedAt: discount.updatedAt instanceof Date ? discount.updatedAt.toISOString() : discount.updatedAt
        }));
    }),
    getProductReviews: publicProcedure.query(async () => {
        const productReviews = await prisma.itemReview.findMany({
            include: {
                item: { select: { name: true } },
                user: { select: { firstName: true, lastName: true, email: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        return productReviews.map((review) => ({
            ...review,
            createdAt: review.createdAt instanceof Date ? review.createdAt.toISOString() : review.createdAt
        }));
    }),
    getProductReviewById: publicProcedure.input(z.string()).query(async ({ input }) => {
        const review = await prisma.itemReview.findUnique({
            where: { id: input },
            include: {
                item: { select: { name: true } },
                user: { select: { firstName: true, lastName: true, email: true } }
            }
        });

        return {
            ...review,
            createdAt: review?.createdAt instanceof Date ? review?.createdAt.toISOString() : review?.createdAt,
            updatedAt: review?.updatedAt instanceof Date ? review?.updatedAt.toISOString() : review?.updatedAt
        };
    }),
    updateProductReview: publicProcedure
        .input(
            z.object({
                id: z.string(),
                rating: z.number(),
                review: z.string()
            })
        )
        .mutation(async ({ input }) => {
            const updatedReview = await prisma.itemReview.update({
                where: { id: input.id },
                data: {
                    rating: input.rating,
                    review: input.review,
                    updatedAt: new Date()
                }
            });

            return updatedReview;
        }),
    createProductReview: publicProcedure
        .input(
            z.object({
                rating: z.number().min(1).max(5),
                review: z.string().min(2),
                itemId: z.string(),
                userId: z.string()
            })
        )
        .mutation(async ({ input }) => {
            // Check if user is admin
            const isAdmin = await checkUserRole('ADMIN');
            if (!isAdmin) {
                throw new TRPCError({
                    code: 'UNAUTHORIZED',
                    message: 'Only admins can create fake reviews'
                });
            }

            const newReview = await prisma.itemReview.create({
                data: {
                    rating: input.rating,
                    review: input.review,
                    itemId: input.itemId,
                    userId: input.userId
                }
            });

            return newReview;
        }),
    deleteProductReview: publicProcedure.input(z.string()).mutation(async ({ input }) => {
        const deletedReview = await prisma.itemReview.delete({
            where: { id: input }
        });

        return deletedReview;
    }),
    seedProductReviews: publicProcedure
        .input(
            z.object({
                providerId: z.string().optional()
            })
        )
        .mutation(async ({ input }) => {
            // Check if user is admin
            const isAdmin = await checkUserRole('ADMIN');
            if (!isAdmin) {
                throw new TRPCError({
                    code: 'UNAUTHORIZED',
                    message: 'Only admins can seed reviews'
                });
            }

            // Get providers with their items (filter by providerId if provided)
            const providers = await prisma.provider.findMany({
                where: input.providerId ? { id: input.providerId } : undefined,
                include: {
                    items: {
                        where: { published: true }
                    }
                }
            });

            console.log(`Found ${providers.length} providers`);
            const totalProducts = providers.reduce((sum, provider) => sum + provider.items.length, 0);
            console.log(`Found ${totalProducts} published items across all providers`);

            // Get all users to assign as reviewers
            const users = await prisma.user.findMany({
                select: { id: true }
            });

            console.log(`Found ${users.length} users`);

            if (users.length === 0) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'No users found to assign reviews'
                });
            }

            if (totalProducts === 0) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'No published items found to review'
                });
            }

            const reviewTexts = [
                'Great item! Really happy with this purchase.',
                'excellent quality, exactly what i was looking for',
                'Good value for money, would recommend.',
                'fast shipping and great customer service!',
                'Perfect for my needs, very satisfied.',
                'AMAZING QUALITY! Exceeded my expectations.',
                'love this item, works perfectly',
                'Fantastic purchase, highly recommend to others.',
                'great build quality and very reliable...',
                'Excellent item, worth every penny!',
                'outstanding item quality!! exactly what i needed and more',
                'Super impressed with this purchase. fast delivery and great packaging',
                'really solid build quality, feels premium and well-made',
                'This has become one of my favorite purchases... Highly recommended!',
                'fantastic value for the price. works perfectly as advertised',
                'Amazing customer service and the item EXCEEDED expectations!',
                'love the attention to detail in this item. very well designed',
                'Perfect fit for what I was looking for. will definitely buy again',
                'great quality materials and excellent craftsmanship throughout',
                'smooth ordering process and the item is even better than expected',
                'this item has made my life so much easier. Very satisfied!',
                'Impressive quality and functionality... worth every dollar spent',
                "EXCELLENT durability and performance. couldn't be happier with it!",
                'beautiful design and works flawlessly. truly a great purchase',
                'Top-notch quality and arrived quickly! exactly as described',
                'really happy with this buy. good value and reliable performance',
                'Sleek design and excellent functionality. highly recommend to others',
                'perfect for my specific needs. Quality construction throughout',
                'Great experience from order to delivery... item is fantastic!',
                'this has exceeded my expectations in every way possible',
                'bought this last month and its been great so far',
                'Works as expected, no complaints here',
                'pretty good item, does what it says',
                'Solid purchase. Would buy from this seller again.',
                'nice quality for the price point',
                'LOVE IT! been using it daily',
                'Good stuff, arrived on time',
                'exactly what i ordered, thanks!',
                'decent quality, happy with purchase',
                'Great value! recommended',
                'works well, no issues',
                'Perfect! exactly as described',
                'good item, fast delivery',
                'Really pleased with this item',
                'awesome quality, will order again',
                'Does the job perfectly',
                'excellent build quality',
                'Very happy customer here!',
                'good buy, would recommend',
                'works great, no problems'
            ];

            let totalReviews = 0;

            for (const provider of providers) {
                if (provider.items.length === 0) continue;

                for (const item of provider.items) {
                    // Generate 2-3 random reviews per item
                    const reviewCount = Math.floor(Math.random() * 2) + 2; // 2 or 3 reviews

                    for (let i = 0; i < reviewCount; i++) {
                        const randomUser = users[Math.floor(Math.random() * users.length)];
                        const randomReview = reviewTexts[Math.floor(Math.random() * reviewTexts.length)];
                        const randomRating = Math.floor(Math.random() * 2) + 4; // 4 or 5 stars

                        // Generate random date within the last 6 months
                        const now = new Date();
                        const sixMonthsAgo = new Date();
                        sixMonthsAgo.setMonth(now.getMonth() - 6);
                        const randomTimestamp = new Date(
                            sixMonthsAgo.getTime() + Math.random() * (now.getTime() - sixMonthsAgo.getTime())
                        );

                        await prisma.itemReview.create({
                            data: {
                                rating: randomRating,
                                review: randomReview,
                                itemId: item.id,
                                userId: randomUser.id,
                                createdAt: randomTimestamp,
                                updatedAt: randomTimestamp
                            }
                        });

                        totalReviews++;
                    }
                }
            }

            return { count: totalReviews };
        }),
    seedProductReviewsForSingle: publicProcedure
        .input(
            z.object({
                itemId: z.string()
            })
        )
        .mutation(async ({ input }) => {
            // Check if user is admin
            const isAdmin = await checkUserRole('ADMIN');
            if (!isAdmin) {
                throw new TRPCError({
                    code: 'UNAUTHORIZED',
                    message: 'Only admins can seed reviews'
                });
            }

            // Get the item with provider info
            const item = await prisma.item.findUnique({
                where: { id: input.itemId },
                include: {
                    provider: { select: { name: true } }
                }
            });

            if (!item) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Item not found'
                });
            }

            // Get all users to assign as reviewers
            const users = await prisma.user.findMany({
                select: { id: true }
            });

            if (users.length === 0) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'No users found to assign reviews'
                });
            }

            const reviewTexts = [
                'Great item! Really happy with this purchase.',
                'excellent quality, exactly what i was looking for',
                'Good value for money, would recommend.',
                'fast shipping and great customer service!',
                'Perfect for my needs, very satisfied.',
                'AMAZING QUALITY! Exceeded my expectations.',
                'love this item, works perfectly',
                'Fantastic purchase, highly recommend to others.',
                'great build quality and very reliable...',
                'Excellent item, worth every penny!',
                'outstanding item quality!! exactly what i needed and more',
                'Super impressed with this purchase. fast delivery and great packaging',
                'really solid build quality, feels premium and well-made',
                'This has become one of my favorite purchases... Highly recommended!',
                'fantastic value for the price. works perfectly as advertised',
                'Amazing customer service and the item EXCEEDED expectations!',
                'love the attention to detail in this item. very well designed',
                'Perfect fit for what I was looking for. will definitely buy again',
                'great quality materials and excellent craftsmanship throughout',
                'smooth ordering process and the item is even better than expected',
                'this item has made my life so much easier. Very satisfied!',
                'Impressive quality and functionality... worth every dollar spent',
                "EXCELLENT durability and performance. couldn't be happier with it!",
                'beautiful design and works flawlessly. truly a great purchase',
                'Top-notch quality and arrived quickly! exactly as described',
                'really happy with this buy. good value and reliable performance',
                'Sleek design and excellent functionality. highly recommend to others',
                'perfect for my specific needs. Quality construction throughout',
                'Great experience from order to delivery... item is fantastic!',
                'this has exceeded my expectations in every way possible'
            ];

            // Generate 1-2 random reviews for this item
            const reviewCount = Math.floor(Math.random() * 2) + 1; // 1 or 2 reviews
            let totalReviews = 0;

            for (let i = 0; i < reviewCount; i++) {
                const randomUser = users[Math.floor(Math.random() * users.length)];
                const randomReview = reviewTexts[Math.floor(Math.random() * reviewTexts.length)];
                const randomRating = Math.floor(Math.random() * 2) + 4; // 4 or 5 stars

                // Generate random date within the last 3 months
                const now = new Date();
                const threeMonthsAgo = new Date();
                threeMonthsAgo.setMonth(now.getMonth() - 3);
                const randomTimestamp = new Date(
                    threeMonthsAgo.getTime() + Math.random() * (now.getTime() - threeMonthsAgo.getTime())
                );

                // Check if this user already has a review for this item
                const existingReview = await prisma.itemReview.findFirst({
                    where: {
                        userId: randomUser.id,
                        itemId: input.itemId
                    }
                });

                // Skip if user already reviewed this item
                if (existingReview) {
                    continue;
                }

                await prisma.itemReview.create({
                    data: {
                        rating: randomRating,
                        review: randomReview,
                        itemId: input.itemId,
                        userId: randomUser.id,
                        createdAt: randomTimestamp,
                        updatedAt: randomTimestamp
                    }
                });

                totalReviews++;
            }

            return {
                count: totalReviews,
                productName: item.name
            };
        }),
    fixDuplicateReviews: publicProcedure.mutation(async () => {
        // Check if user is admin
        const isAdmin = await checkUserRole('ADMIN');
        if (!isAdmin) {
            throw new TRPCError({
                code: 'UNAUTHORIZED',
                message: 'Only admins can fix duplicate reviews'
            });
        }

        // Find duplicate reviews (same user reviewing the same item multiple times)
        const duplicateGroups = await prisma.itemReview.groupBy({
            by: ['userId', 'itemId'],
            _count: {
                id: true
            },
            having: {
                id: {
                    _count: {
                        gt: 1
                    }
                }
            }
        });

        console.log(`Found ${duplicateGroups.length} duplicate user-item combinations`);

        const variedReviewTexts = [
            'Outstanding item quality! Exactly what I needed and more.',
            'Super impressed with this purchase. Fast delivery and great packaging.',
            'Really solid build quality, feels premium and well-made.',
            'This has become one of my favorite purchases. Highly recommended!',
            'Fantastic value for the price. Works perfectly as advertised.',
            'Amazing customer service and the item exceeded expectations.',
            'Love the attention to detail in this item. Very well designed.',
            'Perfect fit for what I was looking for. Will definitely buy again.',
            'Great quality materials and excellent craftsmanship throughout.',
            'Smooth ordering process and the item is even better than expected.',
            'This item has made my life so much easier. Very satisfied.',
            'Impressive quality and functionality. Worth every dollar spent.',
            "Excellent durability and performance. Couldn't be happier with it.",
            'Beautiful design and works flawlessly. Truly a great purchase.',
            'Top-notch quality and arrived quickly. Exactly as described.',
            'Really happy with this buy. Good value and reliable performance.',
            'Sleek design and excellent functionality. Highly recommend to others.',
            'Perfect for my specific needs. Quality construction throughout.',
            'Great experience from order to delivery. Item is fantastic.',
            'This has exceeded my expectations in every way possible.',
            'Absolutely love this item! Worth every penny spent.',
            'Great customer service and quick shipping. Item is amazing.',
            'Perfect quality and exactly as described. Highly satisfied.',
            'Excellent build and fantastic performance. Will buy again.',
            'Really impressed with the attention to detail. Great purchase!',
            'Fast delivery and item exceeded my expectations completely.',
            'Top quality materials and superb craftsmanship throughout.',
            "Amazing value for money. Couldn't be happier with this buy.",
            'Perfect for my needs and works exactly as advertised.',
            'Outstanding customer experience from start to finish.'
        ];

        let deletedCount = 0;
        const updatedCount = 0;

        for (const duplicate of duplicateGroups) {
            // Get all reviews for this user-item combination
            const reviews = await prisma.itemReview.findMany({
                where: {
                    userId: duplicate.userId,
                    itemId: duplicate.itemId
                },
                include: {
                    user: { select: { firstName: true, lastName: true } },
                    item: { select: { name: true } }
                },
                orderBy: { createdAt: 'asc' }
            });

            if (reviews.length <= 1) continue; // Skip if somehow no duplicates found

            console.log(
                `Processing ${reviews.length} duplicate reviews from ${reviews[0].user?.firstName} ${reviews[0].user?.lastName} for item: ${reviews[0].item?.name}`
            );

            // Keep the first review (oldest), handle the rest
            for (let i = 1; i < reviews.length; i++) {
                const review = reviews[i];

                // Option 1: Delete the duplicate review entirely (recommended)
                await prisma.itemReview.delete({
                    where: { id: review.id }
                });
                deletedCount++;

                // Option 2: Alternatively, you could update with different text instead of deleting:
                // const newReviewText = variedReviewTexts[Math.floor(Math.random() * variedReviewTexts.length)];
                // await prisma.itemReview.update({
                //     where: { id: review.id },
                //     data: { review: newReviewText }
                // });
                // updatedCount++;
            }
        }

        return {
            duplicateGroups: duplicateGroups.length,
            deletedReviews: deletedCount,
            updatedReviews: updatedCount,
            message: `Fixed ${duplicateGroups.length} duplicate user-item combinations by deleting ${deletedCount} duplicate reviews`
        };
    }),
    seedProductSoldCounts: publicProcedure
        .input(
            z.object({
                providerId: z.string().optional()
            })
        )
        .mutation(async ({ input }) => {
            // Check if user is admin
            const isAdmin = await checkUserRole('ADMIN');
            if (!isAdmin) {
                throw new TRPCError({
                    code: 'UNAUTHORIZED',
                    message: 'Only admins can seed sold counts'
                });
            }

            // Get items from specified provider or all providers
            const items = await prisma.item.findMany({
                where: input.providerId ? { providerId: input.providerId } : undefined,
                include: {
                    provider: { select: { name: true } }
                }
            });

            if (items.length === 0) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'No items found to update sold counts'
                });
            }

            let updatedCount = 0;

            for (const item of items) {
                // Generate random sold count between 2-10
                const soldCount = Math.floor(Math.random() * 9) + 2; // 2 to 10

                await prisma.item.update({
                    where: { id: item.id },
                    data: { soldCount: soldCount }
                });

                updatedCount++;
            }

            return { count: updatedCount };
        }),
    deleteAllProductsForShop: publicProcedure
        .input(
            z.object({
                providerId: z.string()
            })
        )
        .mutation(async ({ input }) => {
            // Check if user is admin
            const isAdmin = await checkUserRole('ADMIN');
            if (!isAdmin) {
                throw new TRPCError({
                    code: 'UNAUTHORIZED',
                    message: 'Only admins can delete items'
                });
            }

            // Get all items from the specified provider (to count and get provider name)
            const items = await prisma.item.findMany({
                where: { providerId: input.providerId },
                include: {
                    provider: { select: { name: true } }
                }
            });

            if (items.length === 0) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'No items found in this provider'
                });
            }

            // Delete all items and related data in a transaction
            const itemIds = items.map((item) => item.id);

            await prisma.$transaction(async (tx) => {
                // Delete all reviews for these items
                await tx.itemReview.deleteMany({
                    where: { itemId: { in: itemIds } }
                });

                // Delete all item images
                await tx.itemImage.deleteMany({
                    where: { itemId: { in: itemIds } }
                });

                // Finally, delete all items from the provider
                await tx.item.deleteMany({
                    where: { providerId: input.providerId }
                });
            });

            return { count: items.length, shopName: items[0].provider?.name };
        }),
    getPromotions: publicProcedure.query(async () => {
        const promotions = await prisma.promotion.findMany({
            include: {
                images: { select: { url: true, isPrimary: true } }
            },
            orderBy: { createdAt: 'desc' },
            where: { published: true }
        });

        return promotions.map((promotion) => ({
            ...promotion,
            image: promotion.images[0]?.url || null,
            startDate: promotion.startDate instanceof Date ? promotion.startDate.toISOString() : promotion.startDate,
            endDate: promotion.endDate instanceof Date ? promotion.endDate.toISOString() : promotion.endDate,
            createdAt: promotion.createdAt instanceof Date ? promotion.createdAt.toISOString() : promotion.createdAt,
            updatedAt: promotion.updatedAt instanceof Date ? promotion.updatedAt.toISOString() : promotion.updatedAt
        }));
    }),
    getAllPromotions: publicProcedure.query(async () => {
        const promotions = await prisma.promotion.findMany({
            include: {
                images: { select: { url: true, isPrimary: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        const primaryImageUrl = promotions[0]?.images[0]?.url || null;

        return promotions.map((promotion) => ({
            ...promotion,
            image: primaryImageUrl,
            startDate: promotion.startDate instanceof Date ? promotion.startDate.toISOString() : promotion.startDate,
            endDate: promotion.endDate instanceof Date ? promotion.endDate.toISOString() : promotion.endDate,
            createdAt: promotion.createdAt instanceof Date ? promotion.createdAt.toISOString() : promotion.createdAt,
            updatedAt: promotion.updatedAt instanceof Date ? promotion.updatedAt.toISOString() : promotion.updatedAt
        }));
    }),
    getPromotionById: publicProcedure.input(z.string()).query(async ({ input }) => {
        const promotion = await prisma.promotion.findUnique({
            where: { id: input },
            include: {
                images: { select: { url: true, isPrimary: true } }
            }
        });

        return {
            ...promotion,
            image: promotion?.images[0]?.url || null,
            startDate: promotion?.startDate instanceof Date ? promotion?.startDate.toISOString() : promotion?.startDate,
            endDate: promotion?.endDate instanceof Date ? promotion?.endDate.toISOString() : promotion?.endDate,
            createdAt: promotion?.createdAt instanceof Date ? promotion?.createdAt.toISOString() : promotion?.createdAt,
            updatedAt: promotion?.updatedAt instanceof Date ? promotion?.updatedAt.toISOString() : promotion?.updatedAt
        };
    }),
    addPromotion: publicProcedure
        .input(
            z.object({
                title: z.string().min(2, { message: 'Promotion title must be at least 2 characters' }),
                hasLink: z.boolean(),
                published: z.boolean(),
                description: z.string()
            })
        )
        .mutation(async ({ input }) => {
            const promotion = await prisma.promotion.create({
                data: {
                    title: input.title,
                    description: input.description,
                    hasLink: input.hasLink,
                    published: input.published,
                    startDate: new Date(),
                    endDate: new Date()
                }
            });

            return promotion;
        }),
    updatePromotion: publicProcedure
        .input(
            z.object({
                id: z.string(),
                title: z.string().min(2, { message: 'Promotion title must be at least 2 characters' }),
                hasLink: z.boolean(),
                published: z.boolean(),
                description: z.string()
            })
        )
        .mutation(async ({ input }) => {
            const promotion = await prisma.promotion.update({
                where: { id: input.id },
                data: {
                    title: input.title,
                    description: input.description,
                    hasLink: input.hasLink,
                    published: input.published,
                    startDate: new Date(),
                    endDate: new Date()
                }
            });

            return promotion;
        }),
    deletePromotion: publicProcedure.input(z.string()).mutation(async ({ input }) => {
        try {
            // Fetch images from the database
            const dataImages = await prisma.promotionImages.findMany({
                where: { promotionId: input },
                select: { url: true }
            });

            // Delete images from Google Cloud Storage
            const deleteImagePromises = dataImages.map(async (image) => {
                const fileName = image.url.split('/').pop();
                if (fileName) {
                    const file = bucket.file(`uploads/promotions/${fileName}`);
                    try {
                        await file.delete();
                        console.log(`Deleted image from GCS: ${fileName}`);
                    } catch (err) {
                        console.error(`Failed to delete image from GCS: ${fileName}`, err);
                    }
                }
            });

            await Promise.all(deleteImagePromises);

            // Delete item images data from the database
            await prisma.promotionImages.deleteMany({
                where: { promotionId: input }
            });

            // Delete the item data from the database
            await prisma.promotion.delete({
                where: { id: input }
            });

            console.log('Data and related images deleted successfully.');
        } catch (error) {
            console.error('Error deleting data:', error);
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to delete data'
            });
        }
    }),
    getDiscountCodeById: publicProcedure.input(z.string()).query(async ({ input }) => {
        const discount = await prisma.discountCode.findUnique({
            where: { id: input }
        });

        return {
            ...discount,
            expirationDate:
                discount?.expirationDate instanceof Date
                    ? discount?.expirationDate.toISOString()
                    : discount?.expirationDate,
            createdAt: discount?.createdAt instanceof Date ? discount?.createdAt.toISOString() : discount?.createdAt,
            updatedAt: discount?.updatedAt instanceof Date ? discount?.updatedAt.toISOString() : discount?.updatedAt
        };
    }),
    getSearchedKeywords: publicProcedure.query(async () => {
        const keywords = await prisma.searchedKeyword.findMany({
            select: { id: true, keyword: true, counts: true },
            orderBy: { counts: 'desc' }
        });

        return keywords;
    }),
    getPostCategories: publicProcedure.query(async () => {
        const postCategories = await prisma.postCategory.findMany({
            select: {
                id: true,
                name: true,
                createdAt: true,
                updatedAt: true
            },
            orderBy: { name: 'asc' }
        });

        // Convert Date fields to strings
        return postCategories.map((category) => ({
            ...category,
            createdAt: category.createdAt instanceof Date ? category.createdAt.toISOString() : category.createdAt,
            updatedAt: category.updatedAt instanceof Date ? category.updatedAt.toISOString() : category.updatedAt
        }));
    }),
    getPosts: publicProcedure.query(async () => {
        const posts = await prisma.post.findMany({
            include: {
                category: true,
                images: {
                    orderBy: {
                        isPrimary: 'desc' // Sort images by isPrimary, primary images first
                    },
                    select: {
                        url: true,
                        isPrimary: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Convert Date fields to strings
        return posts.map((post) => ({
            ...post,
            image: post.images[0]?.url || null,
            createdAt: post.createdAt instanceof Date ? post.createdAt.toISOString() : post.createdAt,
            updatedAt: post.updatedAt instanceof Date ? post.updatedAt.toISOString() : post.updatedAt,

            category: post.category
                ? {
                      ...post.category,
                      createdAt:
                          post.category.createdAt instanceof Date
                              ? post.category.createdAt.toISOString()
                              : post.category.createdAt,
                      updatedAt:
                          post.category.updatedAt instanceof Date
                              ? post.category.updatedAt.toISOString()
                              : post.category.updatedAt
                  }
                : null
        }));
    }),
    getProductById: publicProcedure.input(z.string()).query(async ({ input }) => {
        const item = await prisma.item.findUnique({
            where: { id: input },
            include: {
                provider: { select: { id: true, name: true, phone: true } },
                category: true,
                images: {
                    orderBy: {
                        isPrimary: 'desc' // Sort images by isPrimary, primary images first
                    },
                    select: {
                        url: true,
                        isPrimary: true
                    }
                },
                reviews: {
                    select: {
                        id: true,
                        rating: true,
                        review: true,
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true
                            }
                        },
                        createdAt: true
                    },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!item) {
            return null; // Explicitly return null if the item is not found
        }

        // Extract the primary image URL
        const primaryImageUrl = item.images[0]?.url || null;

        // Convert Date fields to strings if they are Date objects
        return {
            ...item,
            createdAt: item.createdAt instanceof Date ? item.createdAt.toISOString() : item.createdAt,
            updatedAt: item.updatedAt instanceof Date ? item.updatedAt.toISOString() : item.updatedAt,
            image: primaryImageUrl, // Add the primary image directly
            category: item.category
                ? {
                      ...item.category,
                      createdAt:
                          item.category.createdAt instanceof Date
                              ? item.category.createdAt.toISOString()
                              : item.category.createdAt,
                      updatedAt:
                          item.category.updatedAt instanceof Date
                              ? item.category.updatedAt.toISOString()
                              : item.category.updatedAt
                  }
                : null,
            reviews: item.reviews.map((review) => ({
                ...review,
                createdAt: review.createdAt instanceof Date ? review.createdAt.toISOString() : review.createdAt
            }))
        };
    }),

    getShopById: publicProcedure.input(z.string()).query(async ({ input }) => {
        const provider = await prisma.provider.findUnique({
            where: { id: input }
        });

        return provider;
    }),

    getPostById: publicProcedure.input(z.string()).query(async ({ input }) => {
        const post = await prisma.post.findUnique({
            where: { id: input },
            include: {
                category: true,
                images: {
                    orderBy: {
                        isPrimary: 'desc' // Sort images by isPrimary, primary images first
                    },
                    select: {
                        url: true,
                        isPrimary: true
                    }
                }
            }
        });

        // Extract the primary image URL
        const primaryImageUrl = post?.images[0]?.url || null;

        return post
            ? {
                  ...post,
                  createdAt: post.createdAt instanceof Date ? post.createdAt.toISOString() : post.createdAt,
                  updatedAt: post.updatedAt instanceof Date ? post.updatedAt.toISOString() : post.updatedAt,
                  image: primaryImageUrl, // Assign the primary image URL to 'image'
                  category: post.category
                      ? {
                            ...post.category,
                            createdAt:
                                post.category.createdAt instanceof Date
                                    ? post.category.createdAt.toISOString()
                                    : post.category.createdAt,
                            updatedAt:
                                post.category.updatedAt instanceof Date
                                    ? post.category.updatedAt.toISOString()
                                    : post.category.updatedAt
                        }
                      : null
              }
            : null;
    }),

    getMinimumOrder: publicProcedure.query(async () => {
        //get the first row
        const minOrder = await prisma.minimumOrder.findFirst({
            orderBy: { createdAt: 'asc' }
        });
        // console.log('[getMinimumOrder]', minOrder);

        return minOrder
            ? {
                  ...minOrder,
                  createdAt: minOrder.createdAt instanceof Date ? minOrder.createdAt.toISOString() : minOrder.createdAt,
                  updatedAt: minOrder.updatedAt instanceof Date ? minOrder.updatedAt.toISOString() : minOrder.updatedAt
              }
            : null;
    }),

    updateMinimumOrder: publicProcedure.input(z.object({ amount: z.number() })).mutation(async ({ input }) => {
        //get the first row
        const minOrder = await prisma.minimumOrder.findFirst({
            orderBy: { createdAt: 'asc' }
        });

        if (minOrder) {
            //update the row
            const updatedMinOrder = await prisma.minimumOrder.update({
                where: { id: minOrder.id },
                data: {
                    amount: input.amount,
                    updatedAt: new Date()
                }
            });

            return updatedMinOrder;
        }
    }),

    getUserOrderById: publicProcedure.input(z.string()).query(async ({ input }) => {
        const isAdmin = await checkUserRole('ADMIN');

        const userData = await currentUser();
        const userEmail = userData?.primaryEmailAddress?.emailAddress;

        const order = await prisma.order.findUnique({
            where: {
                orderCode: input.toUpperCase(),
                ...(isAdmin ? {} : { user: { email: userEmail } }) // If not admin, filter by email
            },
            include: {
                user: true, // Include user details
                fulfillments: {
                    include: {
                        provider: true,
                        orderItems: {
                            include: {
                                item: {
                                    include: {
                                        images: {
                                            orderBy: {
                                                isPrimary: 'desc' // Sort images by isPrimary, primary images first
                                            },
                                            select: {
                                                url: true,
                                                isPrimary: true
                                            }
                                        }
                                    }
                                }
                            },
                            orderBy: {
                                createdAt: 'asc' // Sort order items by creation time
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'asc' // Sort fulfillments by creation time
                    }
                }
            }
        });

        if (order) {
            return {
                ...order,
                createdAt: order.createdAt instanceof Date ? order.createdAt.toISOString() : order.createdAt, // Convert Date to string
                updatedAt: order.updatedAt instanceof Date ? order.updatedAt.toISOString() : order.updatedAt, // Convert Date to string
                user: {
                    ...order.user,
                    createdAt:
                        order.user?.createdAt instanceof Date
                            ? order.user.createdAt.toISOString()
                            : order.user?.createdAt, // Convert Date to string if user exists
                    updatedAt:
                        order.user?.updatedAt instanceof Date
                            ? order.user.updatedAt.toISOString()
                            : order.user?.updatedAt // Convert Date to string if user exists
                },
                fulfillments: order.fulfillments.map((fulfillment) => ({
                    ...fulfillment,
                    createdAt:
                        fulfillment.createdAt instanceof Date ? fulfillment.createdAt.toISOString() : fulfillment.createdAt, // Convert Date to string
                    updatedAt:
                        fulfillment.updatedAt instanceof Date ? fulfillment.updatedAt.toISOString() : fulfillment.updatedAt, // Convert Date to string
                    orderItems: fulfillment.orderItems.map((item) => {
                        const primaryImageUrl = item.item?.images[0]?.url || null;

                        return {
                            ...item,
                            createdAt: item.createdAt instanceof Date ? item.createdAt.toISOString() : item.createdAt, // Convert Date to string
                            updatedAt: item.updatedAt instanceof Date ? item.updatedAt.toISOString() : item.updatedAt, // Convert Date to string
                            item: {
                                ...item.item,
                                image: primaryImageUrl,
                                id: item.item?.id || '',
                                name: item.item?.name || '',
                                price: item.item?.price || 0,
                                categoryId: item.item?.categoryId || null,
                                published: item.item?.published || false,
                                createdAt:
                                    item.item?.createdAt instanceof Date
                                        ? item.item.createdAt.toISOString()
                                        : item.item?.createdAt, // Convert Date to string
                                updatedAt:
                                    item.item?.updatedAt instanceof Date
                                        ? item.item.updatedAt.toISOString()
                                        : item.item?.updatedAt // Convert Date to string
                            }
                        };
                    })
                }))
            };
        }

        return null;
    }),
    getItemsByCategory: publicProcedure.input(z.string()).query(async ({ input }) => {
        const items = await prisma.item.findMany({
            where: { published: true, category: { name: input } },
            include: {
                provider: { select: { id: true, name: true, phone: true } },
                category: true,
                images: {
                    orderBy: {
                        isPrimary: 'desc' // Sort images by isPrimary, primary images first
                    },
                    select: {
                        url: true,
                        isPrimary: true
                    }
                },
                reviews: {
                    select: {
                        id: true,
                        rating: true,
                        review: true,
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true
                            }
                        },
                        createdAt: true
                    },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        // Map over the items and ensure `createdAt` and `updatedAt` are Date objects
        return items.map((item) => ({
            ...item,
            image: item.images[0]?.url || null, // Assign the primary image URL to 'image'
            createdAt: item.createdAt instanceof Date ? item.createdAt.toISOString() : item.createdAt, // Already a string
            updatedAt: item.updatedAt
                ? item.updatedAt instanceof Date
                    ? item.updatedAt.toISOString()
                    : item.updatedAt // Already a string or null
                : null,
            category: item.category
                ? {
                      ...item.category,
                      createdAt:
                          item.category.createdAt instanceof Date
                              ? item.category.createdAt.toISOString()
                              : item.category.createdAt, // Already a string
                      updatedAt:
                          item.category.updatedAt instanceof Date
                              ? item.category.updatedAt.toISOString()
                              : item.category.updatedAt // Already a string or null
                  }
                : null,
            images: item.images.map((image) => ({
                ...image
            })),
            reviews: item.reviews.map((review) => ({
                ...review,
                createdAt: review.createdAt instanceof Date ? review.createdAt.toISOString() : review.createdAt
            }))
        }));
    }),

    getSearchedItems: publicProcedure.input(z.string()).query(async ({ input }) => {
        // Simple sanitization for search input (trim and lowercase)
        const sanitizedInput = input.trim().toLowerCase();

        // Create a version of the input without a trailing 's' if present
        const singularInput = sanitizedInput.endsWith('s') ? sanitizedInput.slice(0, -1) : sanitizedInput;

        /* Save keyword logic */
        const keyword = await prisma.searchedKeyword.findFirst({
            where: { keyword: sanitizedInput }
        });

        // Create or update keyword count
        if (!keyword) {
            await prisma.searchedKeyword.create({
                data: { keyword: sanitizedInput }
            });
        } else {
            await prisma.searchedKeyword.update({
                where: { id: keyword.id },
                data: { counts: keyword.counts + 1 }
            });
        }

        /* Search for items */
        const items = await prisma.item.findMany({
            where: {
                published: true,
                OR: [
                    {
                        name: {
                            contains: sanitizedInput, // Search for the original input
                            mode: 'insensitive'
                        }
                    },
                    {
                        name: {
                            contains: singularInput, // Search for the singular form
                            mode: 'insensitive'
                        }
                    }
                ]
            },
            include: {
                // provider: { select: { id: true, name: true, phone: true } },
                provider: true,
                category: true,
                images: { select: { url: true, isPrimary: true } }
            }
        });

        return items.map(assignPrimaryImage); // Assuming assignPrimaryImage is a helper function
    }),
    getOrderStatus: publicProcedure.query(async () => {
        return Object.values(OrderStatus);
    }),
    addUser: publicProcedure
        .input(
            z.object({
                firstName: z.string().min(2, { message: 'First name must be at least 2 characters' }),
                lastName: z.string().min(2, { message: 'Last name must be at least 2 characters' }),
                email: z.string().email()
            })
        )
        .mutation(async ({ input }) => {
            const userCheck = await prisma.user.findFirst({
                where: { email: input.email }
            });
            if (!userCheck) {
                const user = await prisma.user.create({
                    data: {
                        firstName: input.firstName,
                        lastName: input.lastName,
                        email: input.email
                    }
                });

                return user;
            }

            return null;
        }),
    addDeliveryDetails: publicProcedure
        .input(
            z.object({
                firstName: z.string().min(2, { message: 'First name must be at least 2 characters' }),
                lastName: z.string().min(2, { message: 'Last name must be at least 2 characters' }),
                phone: z.string().min(8, { message: 'Phone number must be at least 10 characters' }),
                address: z.string().min(10, { message: 'Address must be at least 10 characters' }),
                suburb: z.string().min(2, { message: 'Suburb must be at least 2 characters' }),
                city: z.string().min(2, { message: 'City must be at least 2 characters' }),
                postCode: z.string().min(4, { message: 'Post code must be at least 4 characters' }),
                country: z.string(),
                deliveryInstructions: z.string(),
                deliveryMethod: z.string()
            })
        )
        .mutation(async ({ input }) => {
            //check if user exists in database, if not, add user data to database and get the user id, this is for google login users
            const userData = await currentUser();
            const userEmail = userData?.primaryEmailAddress?.emailAddress;

            const user = await prisma.user.findUnique({
                where: { email: userEmail }
            });

            if (!user) {
                await prisma.user.create({
                    data: {
                        firstName: input.firstName,
                        lastName: input.lastName,
                        email: userEmail
                    }
                });
            }

            //return the user
            return user;
        }),
    addProduct: publicProcedure
        .input(
            z.object({
                categoryId: z.string().min(1, { message: 'Category is required' }),
                providerId: z.string().min(1, { message: 'Provider is required' }),
                name: z.string().min(2, { message: 'Item name must be at least 2 characters' }),
                price: z.coerce
                    .number({
                        message: 'Price must be a number'
                    })
                    .gte(1, 'Must be 1 and above'),
                soldCount: z.coerce
                    .number({
                        message: 'Sold count must be a number'
                    })
                    .gte(0, 'Must be 0 and above'),
                description: z.string(),
                specification: z.string()
            })
        )
        .mutation(async ({ input }) => {
            const item = await prisma.item.create({
                data: {
                    name: input.name,
                    price: input.price,
                    soldCount: input.soldCount,
                    description: input.description,
                    specification: input.specification,
                    categoryId: input.categoryId,
                    providerId: input.providerId,
                    published: true,
                    updatedAt: new Date()
                }
            });

            return item;
        }),
    addProductsBulk: publicProcedure
        .input(
            z.array(
                z.object({
                    categoryName: z.string(),
                    shopName: z.string(),
                    name: z.string(),
                    price: z.number(),
                    description: z.string(),
                    specification: z.string()
                })
            )
        )
        .mutation(async ({ input }) => {
            try {
                // First validate that all categories and providers exist
                const categoryMap = new Map();
                const shopMap = new Map();
                const missingCategories: string[] = [];
                const missingShops: string[] = [];

                // Get all unique category and provider names
                const uniqueCategories = [...new Set(input.map((p) => p.categoryName))];
                const uniqueShops = [...new Set(input.map((p) => p.shopName))];

                // Check if all categories exist
                for (const categoryName of uniqueCategories) {
                    const category = await prisma.category.findFirst({
                        where: { name: categoryName }
                    });

                    if (!category) {
                        missingCategories.push(categoryName);
                    } else {
                        categoryMap.set(categoryName, category.id);
                    }
                }

                // Check if all providers exist
                for (const shopName of uniqueShops) {
                    const provider = await prisma.provider.findFirst({
                        where: { name: shopName }
                    });

                    if (!provider) {
                        missingShops.push(shopName);
                    } else {
                        shopMap.set(shopName, provider.id);
                    }
                }

                // If any categories or providers are missing, throw error
                if (missingCategories.length > 0 || missingShops.length > 0) {
                    const errorMessages: string[] = [];

                    if (missingCategories.length > 0) {
                        errorMessages.push(`Categories not found: ${missingCategories.join(', ')}`);
                    }

                    if (missingShops.length > 0) {
                        errorMessages.push(`Providers not found: ${missingShops.join(', ')}`);
                    }

                    throw new TRPCError({
                        code: 'BAD_REQUEST',
                        message: `Upload failed. ${errorMessages.join('. ')}. Please create missing categories and providers first.`
                    });
                }

                // Now create item creation promises for transaction
                const productPromises = input.map((productData) =>
                    prisma.item.create({
                        data: {
                            name: productData.name,
                            price: productData.price,
                            description: productData.description,
                            specification: productData.specification,
                            categoryId: categoryMap.get(productData.categoryName),
                            providerId: shopMap.get(productData.shopName),
                            published: false,
                            clickCounts: 0
                        }
                    })
                );

                // Execute item creation in transaction
                const items = await prisma.$transaction(productPromises);

                return items;
            } catch (error) {
                console.error('Error adding items in bulk:', error);
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to add items in bulk'
                });
            }
        }),
    addShop: publicProcedure
        .input(
            z.object({
                name: z.string().min(2, { message: 'Provider name must be at least 2 characters' }),
                address: z.string().min(2, { message: 'Address must be at least 2 characters' }),
                phone: z.string().min(2, { message: 'Phone must be at least 2 characters' }),
                openingHours: z.string().min(2, { message: 'Opening hours must be at least 2 characters' }),
                minDeliveryTime: z.coerce
                    .number({
                        message: 'Minimum Average Delivery Time must be at least 2 characters'
                    })
                    .gte(1, 'Must be 1 and above'),
                maxDeliveryTime: z.coerce
                    .number({
                        message: 'Maximum Average Delivery Time must be at least 2 characters'
                    })
                    .gte(1, 'Must be 1 and above')
            })
        )
        .mutation(async ({ input }) => {
            const provider = await prisma.provider.create({
                data: {
                    name: input.name,
                    address: input.address,
                    phone: input.phone,
                    openingHours: input.openingHours,
                    minDeliveryTime: input.minDeliveryTime,
                    maxDeliveryTime: input.maxDeliveryTime
                }
            });

            return provider;
        }),
    addPost: publicProcedure
        .input(
            z.object({
                categoryId: z.string().min(1, { message: 'Category is required' }),
                title: z.string().min(2, { message: 'Post title must be at least 2 characters' }),
                content: z.string()
            })
        )
        .mutation(async ({ input }) => {
            const post = await prisma.post.create({
                data: {
                    postCategoryId: input.categoryId,
                    title: input.title,
                    content: input.content
                }
            });

            return post;
        }),
    addDiscountCode: publicProcedure
        .input(
            z.object({
                code: z.string().min(2, { message: 'Code must be at least 2 characters' }),
                discountValue: z.coerce
                    .number({
                        message: 'Discount Value must be a number'
                    })
                    .gte(1, 'Must be 1 and above'),
                isPercentage: z.boolean(),
                isPublished: z.boolean(),
                maxUsage: z.coerce
                    .number({
                        message: 'Max Usage must be a number'
                    })
                    .gte(1, 'Must be 1 and above')
            })
        )
        .mutation(async ({ input }) => {
            const discount = await prisma.discountCode.create({
                data: {
                    code: input.code,
                    discountValue: input.discountValue,
                    isPercentage: input.isPercentage,
                    published: input.isPublished,
                    usageCount: 0,
                    maxUsage: input.maxUsage
                }
            });

            return discount;
        }),
    updateDiscountCode: publicProcedure
        .input(
            z.object({
                id: z.string(),
                code: z.string().min(2, { message: 'Code must be at least 2 characters' }),
                discountValue: z.coerce
                    .number({
                        message: 'Discount Value must be a number'
                    })
                    .gte(1, 'Must be 1 and above'),
                isPercentage: z.boolean(),
                isPublished: z.boolean(),
                usageCount: z.coerce.number({
                    message: 'Usage Count must be a number'
                }),
                maxUsage: z.coerce
                    .number({
                        message: 'Max Usage must be a number'
                    })
                    .gte(1, 'Must be 1 and above')
            })
        )
        .mutation(async ({ input }) => {
            const discount = await prisma.discountCode.update({
                where: { id: input.id },
                data: {
                    code: input.code,
                    discountValue: input.discountValue,
                    isPercentage: input.isPercentage,
                    published: input.isPublished,
                    usageCount: input.usageCount,
                    maxUsage: input.maxUsage,
                    updatedAt: new Date()
                }
            });

            return discount;
        }),

    updateProduct: publicProcedure
        .input(
            z.object({
                id: z.string(),
                categoryId: z.string().min(1, { message: 'Category is required' }),
                providerId: z.string().min(1, { message: 'Provider is required' }),
                name: z.string().min(2, { message: 'Item name must be at least 2 characters' }),
                price: z.coerce
                    .number({
                        message: 'Price must be a number'
                    })
                    .gte(1, 'Must be 1 and above'),
                soldCount: z.coerce
                    .number({
                        message: 'Sold count must be a number'
                    })
                    .gte(0, 'Must be 0 and above'),
                clickCounts: z.coerce.number({
                    message: 'Click Counts must be a number'
                }),
                description: z.string(),
                specification: z.string()
            })
        )
        .mutation(async ({ input }) => {
            const item = await prisma.item.update({
                where: { id: input.id },
                data: {
                    name: input.name,
                    price: input.price,
                    soldCount: input.soldCount,
                    clickCounts: input.clickCounts,
                    description: input.description,
                    specification: input.specification,
                    categoryId: input.categoryId,
                    providerId: input.providerId,
                    updatedAt: new Date()
                }
            });

            return item;
        }),
    toggleProductPublish: publicProcedure.input(z.string()).mutation(async ({ input }) => {
        try {
            const item = await prisma.item.findUnique({
                where: { id: input },
                select: { published: true }
            });

            if (!item) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Item not found'
                });
            }

            const updatedProduct = await prisma.item.update({
                where: { id: input },
                data: { published: !item.published }
            });

            return updatedProduct;
        } catch (error) {
            console.error('Error toggling item publish status:', error);
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to toggle item publish status'
            });
        }
    }),
    deleteProduct: publicProcedure.input(z.string()).mutation(async ({ input }) => {
        try {
            // Fetch item images from the database
            const productImages = await prisma.itemImage.findMany({
                where: { itemId: input },
                select: { url: true }
            });

            // Delete images from Google Cloud Storage
            const deleteImagePromises = productImages.map(async (image) => {
                const fileName = image.url.split('/').pop();
                if (fileName) {
                    const file = bucket.file(`uploads/items/${fileName}`);
                    try {
                        await file.delete();
                        console.log(`Deleted image from GCS: ${fileName}`);
                    } catch (err) {
                        console.error(`Failed to delete image from GCS: ${fileName}`, err);
                    }
                }
            });

            await Promise.all(deleteImagePromises);

            // Delete item images data from the database
            await prisma.itemImage.deleteMany({
                where: { itemId: input }
            });

            // Delete the item data from the database
            await prisma.item.delete({
                where: { id: input }
            });

            console.log('Item and related images deleted successfully.');
        } catch (error) {
            console.error('Error deleting item:', error);
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to delete item'
            });
        }
    }),
    addOrder: publicProcedure
        .input(
            z.object({
                userId: z.string(),
                paymentMethod: z.string(),
                shippingFullName: z.string(),
                shippingAddress: z.string(),
                shippingSuburb: z.string(),
                shippingCity: z.string(),
                shippingPostCode: z.string(),
                shippingCountry: z.string(),
                shippingPhone: z.string(),
                deliveryInstructions: z.string(),
                shippingMethod: z.string(),
                shippingMethodLabel: z.string(),
                deliveryFee: z.number(),
                paymentIntentId: z.string(),
                discountCode: z.string().nullable(),
                discountAmount: z.number().nullable(),
                discountApplied: z.string().nullable(),
                preTotalPrice: z.number(),
                priceAfterDiscount: z.number(),
                currency: z.enum(['NZD', 'AUD']),
                totalPrice: z.number(),
                orderItems: z.array(
                    z.object({
                        itemId: z.string(),
                        quantity: z.number(),
                        price: z.number(),
                        providerId: z.string()
                    })
                )
            })
        )
        .mutation(async ({ input }) => {
            //create order
            const order = await prisma.order.create({
                data: {
                    userId: input.userId,
                    orderCode: await generateUniqueOrderCode(),
                    paymentMethod: input.paymentMethod,
                    paymentStatus: 'PAID',
                    shippingFullName: input.shippingFullName,
                    shippingAddress: input.shippingAddress,
                    shippingSuburb: input.shippingSuburb,
                    shippingCity: input.shippingCity,
                    shippingPostCode: input.shippingPostCode,
                    shippingCountry: normalizeCountry(input.shippingCountry),
                    shippingPhone: input.shippingPhone,
                    deliveryInstructions: input.deliveryInstructions,
                    shippingMethod: input.shippingMethod,
                    shippingMethodLabel: input.shippingMethodLabel,
                    deliveryFee: input.deliveryFee,
                    paymentIntentId: input.paymentIntentId,
                    discountCode: input.discountCode,
                    discountAmount: input.discountAmount,
                    discountApplied: input.discountApplied,
                    preTotalPrice: input.preTotalPrice,
                    priceAfterDiscount: input.priceAfterDiscount,
                    currency: input.currency,
                    totalPrice: input.totalPrice
                },
                include: { user: true }
            });

            // Group order items by supplier
            const groupedItemsBySupplier = input.orderItems.reduce<Record<string, OrderItem[]>>((group, item) => {
                const providerId = item.providerId;

                if (!group[providerId]) {
                    group[providerId] = [];
                }

                group[providerId].push(item);

                return group;
            }, {});

            // Create fulfillments and order items for each supplier
            for (const [providerId, items] of Object.entries(groupedItemsBySupplier)) {
                // Create a fulfillment for each supplier
                const fulfillment = await prisma.fulfillment.create({
                    data: {
                        orderId: order.id,
                        providerId: providerId,
                        trackingCode: null,
                        shippingProvider: null
                    }
                });

                // Create the order items for this fulfillment
                await prisma.orderItem.createMany({
                    data: items.map((item) => ({
                        orderId: order.id,
                        itemId: item.itemId,
                        quantity: item.quantity,
                        price: item.price,
                        shipmentId: fulfillment.id // Associate the item with the created fulfillment
                    }))
                });
            }

            // Return the full order data with items and items, including images
            const fullOrder = await prisma.order.findUnique({
                where: {
                    id: order.id
                },
                include: {
                    user: true,
                    orderItems: {
                        include: {
                            item: {
                                include: {
                                    images: { select: { url: true, isPrimary: true } } // Include images to fetch primary image
                                }
                            }
                        }
                    },
                    fulfillments: {
                        include: {
                            provider: true,
                            orderItems: {
                                include: {
                                    item: {
                                        include: {
                                            images: { select: { url: true, isPrimary: true } } // Include images to fetch primary image
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });

            //send order confirmation email
            if (fullOrder) {
                const orderDetails = {
                    orderCode: fullOrder.orderCode || '',
                    fullName: fullOrder.shippingFullName || '',
                    address: fullOrder.shippingAddress || '',
                    suburb: fullOrder.shippingSuburb || '',
                    city: fullOrder.shippingCity || '',
                    postCode: fullOrder.shippingPostCode || '',
                    country: fullOrder.shippingCountry || '',
                    phone: fullOrder.shippingPhone || '',
                    deliveryInstructions: fullOrder.deliveryInstructions || '',
                    shippingMethod: fullOrder.shippingMethod || '',
                    shippingMethodLabel: fullOrder.shippingMethodLabel || '',
                    deliveryFee: fullOrder.deliveryFee ?? 0,

                    preTotalPrice: fullOrder.preTotalPrice || 0,
                    discountCode: fullOrder.discountCode || '',
                    discountAmount: fullOrder.discountAmount || 0,
                    discountApplied: fullOrder.discountApplied || '',
                    priceAfterDiscount: fullOrder.priceAfterDiscount || 0,
                    currency: fullOrder.currency as Currency,
                    totalPrice: fullOrder.totalPrice || 0,

                    createdAt: formatDate(fullOrder.createdAt) || '',
                    user: {
                        firstName: fullOrder?.user?.firstName || '',
                        lastName: fullOrder?.user?.lastName || '',
                        email: fullOrder?.user?.email || ''
                    },

                    orderItems: fullOrder.orderItems.map((item) => {
                        const primaryImage = item.item?.images.find((img) => img.isPrimary)?.url;

                        return {
                            id: item.item?.id || '',
                            name: item.item?.name || '',
                            image: primaryImage || '',
                            quantity: item.quantity || 0,
                            price: item.price || 0
                        };
                    }),

                    shipmentCounts: fullOrder.fulfillments.length
                };

                const userEmail: string = fullOrder?.user?.email || '';

                if (userEmail) {
                    const { error } = await resend.emails.send({
                        from: 'Kofe Store <support@kofe.co.nz>',
                        to: [userEmail],
                        subject: 'Thank you for your order',
                        react: OrderReceiptEmail({
                            orderDetails
                        }) as React.ReactElement
                    });

                    if (error) {
                        console.log('Error sending order confirmation email:', error);
                        // return;
                    }
                }

                const { error } = await resend.emails.send({
                    from: 'Kofe Store <support@kofe.co.nz>',
                    to: ['support@kofe.co.nz'],
                    subject: 'New Order Notification',
                    react: NewOrderNotificationEmail({
                        orderDetails
                    }) as React.ReactElement
                });

                if (error) {
                    console.log('Error sending new order notification email:', error);
                    // return;
                }
            }

            return order;
        }),
    updateOrder: publicProcedure
        .input(
            z.object({
                orderId: z.string(),
                orderStatus: z.string()
            })
        )
        .mutation(async ({ input }) => {
            const order = await prisma.order.update({
                where: { id: input.orderId },
                data: {
                    orderStatus: input.orderStatus as OrderStatus
                },
                include: {
                    user: true,
                    orderItems: {
                        include: {
                            item: {
                                include: {
                                    images: {
                                        orderBy: { isPrimary: 'desc' }, // Sort images by isPrimary, primary images first
                                        select: { url: true, isPrimary: true } // Fetch only image URL and primary status
                                    }
                                }
                            }
                        },
                        orderBy: {
                            createdAt: 'asc' // Sort order items by creation time
                        }
                    },
                    fulfillments: {
                        include: {
                            provider: true,
                            orderItems: {
                                include: {
                                    item: {
                                        include: {
                                            images: {
                                                orderBy: { isPrimary: 'desc' }, // Sort images by isPrimary
                                                select: { url: true, isPrimary: true } // Fetch only image URL and primary status
                                            }
                                        }
                                    }
                                },
                                orderBy: {
                                    createdAt: 'asc' // Sort order items by creation time
                                }
                            }
                        },
                        orderBy: {
                            createdAt: 'asc' // Sort fulfillments by creation time
                        }
                    }
                }
            });

            // Return the updated order data with proper date formatting
            if (order) {
                return {
                    ...order,
                    createdAt: order.createdAt instanceof Date ? order.createdAt.toISOString() : order.createdAt, // Convert Date to string
                    updatedAt: order.updatedAt instanceof Date ? order.updatedAt.toISOString() : order.updatedAt, // Convert Date to string
                    user: {
                        ...order.user,
                        createdAt:
                            order.user?.createdAt instanceof Date
                                ? order.user.createdAt.toISOString()
                                : order.user?.createdAt, // Convert Date to string if user exists
                        updatedAt:
                            order.user?.updatedAt instanceof Date
                                ? order.user.updatedAt.toISOString()
                                : order.user?.updatedAt // Convert Date to string if user exists
                    },
                    fulfillments: order.fulfillments.map((fulfillment) => ({
                        ...fulfillment,
                        createdAt:
                            fulfillment.createdAt instanceof Date ? fulfillment.createdAt.toISOString() : fulfillment.createdAt, // Convert Date to string
                        updatedAt:
                            fulfillment.updatedAt instanceof Date ? fulfillment.updatedAt.toISOString() : fulfillment.updatedAt, // Convert Date to string
                        orderItems: fulfillment.orderItems.map((item) => {
                            const primaryImageUrl = item.item?.images[0]?.url || null;

                            return {
                                ...item,
                                createdAt:
                                    item.createdAt instanceof Date ? item.createdAt.toISOString() : item.createdAt, // Convert Date to string
                                updatedAt:
                                    item.updatedAt instanceof Date ? item.updatedAt.toISOString() : item.updatedAt, // Convert Date to string
                                item: {
                                    ...item.item,
                                    image: primaryImageUrl,
                                    id: item.item?.id || '',
                                    name: item.item?.name || '',
                                    price: item.item?.price || 0,
                                    categoryId: item.item?.categoryId || null,
                                    published: item.item?.published || false,
                                    createdAt:
                                        item.item?.createdAt instanceof Date
                                            ? item.item.createdAt.toISOString()
                                            : item.item?.createdAt, // Convert Date to string
                                    updatedAt:
                                        item.item?.updatedAt instanceof Date
                                            ? item.item.updatedAt.toISOString()
                                            : item.item?.updatedAt // Convert Date to string
                                }
                            };
                        })
                    }))
                };
            }

            return null;
        }),
    updateShipment: publicProcedure
        .input(
            z.object({
                shipmentId: z.string(),
                trackingCode: z.string(),
                shippingProvider: z.string(),
                shippingProviderWebsite: z.string()
            })
        )
        .mutation(async ({ input }) => {
            const fulfillment = await prisma.fulfillment.update({
                where: { id: input.shipmentId },
                data: {
                    trackingCode: input.trackingCode,
                    shippingProvider: input.shippingProvider,
                    shippingProviderWebsite: input.shippingProviderWebsite,
                    shipmentStatus: 'SHIPPED' // Set fulfillment status to SHIPPED
                },
                include: {
                    orderItems: {
                        include: {
                            item: {
                                include: {
                                    images: { select: { url: true, isPrimary: true } } // Include images to fetch primary image
                                }
                            }
                        }
                    }
                }
            });

            const order = await prisma.order.findUnique({
                where: { id: fulfillment.orderId },
                include: {
                    user: true,
                    orderItems: {
                        include: {
                            item: {
                                include: {
                                    images: { select: { url: true, isPrimary: true } } // Include images to fetch primary image
                                }
                            }
                        }
                    },
                    fulfillments: {
                        include: {
                            provider: true,
                            orderItems: {
                                include: {
                                    item: {
                                        include: {
                                            images: { select: { url: true, isPrimary: true } } // Include images to fetch primary image
                                        }
                                    }
                                },
                                orderBy: {
                                    createdAt: 'asc' // Sort order items by creation time
                                }
                            }
                        },
                        orderBy: {
                            createdAt: 'asc' // Sort fulfillments by creation time
                        }
                    }
                }
            });

            if (order) {
                const orderDetails = {
                    orderCode: order?.orderCode || '',
                    fullName: order?.shippingFullName || '',
                    address: order?.shippingAddress || '',
                    suburb: order?.shippingSuburb || '',
                    city: order?.shippingCity || '',
                    postCode: order?.shippingPostCode || '',
                    country: order?.shippingCountry || '',
                    phone: order?.shippingPhone || '',
                    deliveryInstructions: order?.deliveryInstructions || '',
                    shippingMethod: order?.shippingMethod || '',
                    totalPrice: order?.totalPrice || 0,
                    createdAt: formatDate(order?.createdAt) || '',
                    trackingCode: fulfillment.trackingCode || '',
                    shippingProvider: fulfillment.shippingProvider || '',
                    shippingProviderWebsite: fulfillment.shippingProviderWebsite || '',
                    user: {
                        firstName: order?.user?.firstName || '',
                        lastName: order?.user?.lastName || '',
                        email: order?.user?.email || ''
                    },
                    orderItems: fulfillment?.orderItems.map((item) => {
                        const primaryImage = item.item?.images.find((img) => img.isPrimary)?.url; //get primary image

                        return {
                            id: item.item?.id || '',
                            name: item.item?.name || '',
                            image: primaryImage || '', // use primary image URL
                            quantity: item.quantity || 0,
                            price: item.price || 0
                        };
                    }),
                    shipmentCounts: order?.fulfillments.length
                };
                const userEmail: string = order?.user?.email || '';

                if (userEmail) {
                    const { error } = await resend.emails.send({
                        from: 'Kofe Store <support@kofe.co.nz>',
                        to: [userEmail],
                        subject: 'Your order has been shipped',
                        react: ShippedItemsEmail({
                            orderDetails
                        }) as React.ReactElement
                    });

                    if (error) {
                        console.log('Error sending order confirmation email:', error);
                        // return;
                    }
                }

                return {
                    ...order,
                    createdAt: order.createdAt instanceof Date ? order.createdAt.toISOString() : order.createdAt, // Convert Date to string
                    updatedAt: order.updatedAt instanceof Date ? order.updatedAt.toISOString() : order.updatedAt, // Convert Date to string
                    user: {
                        ...order.user,
                        createdAt:
                            order.user?.createdAt instanceof Date
                                ? order.user.createdAt.toISOString()
                                : order.user?.createdAt, // Convert Date to string if user exists
                        updatedAt:
                            order.user?.updatedAt instanceof Date
                                ? order.user.updatedAt.toISOString()
                                : order.user?.updatedAt // Convert Date to string if user exists
                    },
                    fulfillments: order.fulfillments.map((fulfillment) => ({
                        ...fulfillment,
                        createdAt:
                            fulfillment.createdAt instanceof Date ? fulfillment.createdAt.toISOString() : fulfillment.createdAt, // Convert Date to string
                        updatedAt:
                            fulfillment.updatedAt instanceof Date ? fulfillment.updatedAt.toISOString() : fulfillment.updatedAt, // Convert Date to string
                        orderItems: fulfillment.orderItems.map((item) => {
                            const primaryImageUrl = item.item?.images[0]?.url || null;

                            return {
                                ...item,
                                createdAt:
                                    item.createdAt instanceof Date ? item.createdAt.toISOString() : item.createdAt, // Convert Date to string
                                updatedAt:
                                    item.updatedAt instanceof Date ? item.updatedAt.toISOString() : item.updatedAt, // Convert Date to string
                                item: {
                                    ...item.item,
                                    image: primaryImageUrl,
                                    id: item.item?.id || '',
                                    name: item.item?.name || '',
                                    price: item.item?.price || 0,
                                    categoryId: item.item?.categoryId || null,
                                    published: item.item?.published || false,
                                    createdAt:
                                        item.item?.createdAt instanceof Date
                                            ? item.item.createdAt.toISOString()
                                            : item.item?.createdAt, // Convert Date to string
                                    updatedAt:
                                        item.item?.updatedAt instanceof Date
                                            ? item.item.updatedAt.toISOString()
                                            : item.item?.updatedAt // Convert Date to string
                                }
                            };
                        })
                    }))
                };
            }

            return null;
        }),
    updateOrderPaymentStatus: publicProcedure
        .input(
            z.object({
                orderId: z.string(),
                PaymentStatus: z.string()
            })
        )
        .mutation(async ({ input }) => {
            await prisma.order.update({
                where: { id: input.orderId },
                data: { paymentStatus: input.PaymentStatus as PaymentStatus }
            });
        }),
    updateShop: publicProcedure
        .input(
            z.object({
                id: z.string(),
                name: z.string().min(2, { message: 'Provider name must be at least 2 characters' }),
                address: z.string().min(2, { message: 'Address must be at least 2 characters' }),
                phone: z.string().min(2, { message: 'Phone must be at least 2 characters' }),
                openingHours: z.string().min(2, { message: 'Opening hours must be at least 2 characters' }),
                minDeliveryTime: z.coerce
                    .number({
                        message: 'Minimum Average Delivery Time must be at least 2 characters'
                    })
                    .gte(1, 'Must be 1 and above'),
                maxDeliveryTime: z.coerce
                    .number({
                        message: 'Maximum Average Delivery Time must be at least 2 characters'
                    })
                    .gte(1, 'Must be 1 and above')
            })
        )
        .mutation(async ({ input }) => {
            const provider = await prisma.provider.update({
                where: { id: input.id },
                data: {
                    name: input.name,
                    address: input.address,
                    phone: input.phone,
                    openingHours: input.openingHours,
                    minDeliveryTime: input.minDeliveryTime,
                    maxDeliveryTime: input.maxDeliveryTime
                }
            });

            return provider;
        }),
    deleteShop: publicProcedure.input(z.string()).mutation(async ({ input }) => {
        try {
            //delete fulfillments associated with the provider
            await prisma.fulfillment.deleteMany({
                where: { providerId: input }
            });
            //delete items associated with the provider
            await prisma.item.deleteMany({
                where: { providerId: input }
            });
            // Delete the provider data from the database
            await prisma.provider.delete({
                where: { id: input }
            });

            console.log('Provider deleted successfully.');
        } catch (error) {
            console.error('Error deleting provider:', error);
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to delete provider'
            });
        }
    }),
    deleteDiscountCode: publicProcedure.input(z.string()).mutation(async ({ input }) => {
        await prisma.discountCode.delete({
            where: { id: input }
        });
    }),
    updatePost: publicProcedure
        .input(
            z.object({
                id: z.string(),
                categoryId: z.string().min(1, { message: 'Category is required' }),
                title: z.string(),
                content: z.string()
            })
        )
        .mutation(async ({ input }) => {
            const post = await prisma.post.update({
                where: { id: input.id },
                data: {
                    postCategoryId: input.categoryId,
                    title: input.title,
                    content: input.content
                }
            });

            return post;
        }),
    deletePost: publicProcedure.input(z.string()).mutation(async ({ input }) => {
        try {
            // Fetch images from the database
            const dataImages = await prisma.postImages.findMany({
                where: { postId: input },
                select: { url: true }
            });

            // Delete images from Google Cloud Storage
            const deleteImagePromises = dataImages.map(async (image) => {
                const fileName = image.url.split('/').pop();
                if (fileName) {
                    const file = bucket.file(`uploads/posts/${fileName}`);
                    try {
                        await file.delete();
                        console.log(`Deleted image from GCS: ${fileName}`);
                    } catch (err) {
                        console.error(`Failed to delete image from GCS: ${fileName}`, err);
                    }
                }
            });

            await Promise.all(deleteImagePromises);

            // Delete item images data from the database
            await prisma.postImages.deleteMany({
                where: { postId: input }
            });

            // Delete the item data from the database
            await prisma.post.delete({
                where: { id: input }
            });

            console.log('Data and related images deleted successfully.');
        } catch (error) {
            console.error('Error deleting data:', error);
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to delete data'
            });
        }
    }),
    deleteKeyword: publicProcedure.input(z.string()).mutation(async ({ input }) => {
        await prisma.searchedKeyword.delete({
            where: { id: input }
        });
    }),
    deleteAllOrders: publicProcedure.mutation(async () => {
        // Delete all OrderItems first since they are dependent on Orders
        await prisma.orderItem.deleteMany({});
        console.log('Deleted all order items.');

        await prisma.fulfillment.deleteMany({}); // Delete all Fulfillments
        console.log('Deleted all fulfillments.');

        // Delete all Orders
        await prisma.order.deleteMany({});
        console.log('Deleted all orders.');
    }),
    updateProductClickCount: publicProcedure.input(z.string()).mutation(async ({ input }) => {
        const isAdmin = await checkUserRole('ADMIN');
        if (!isAdmin) {
            const item = await prisma.item.update({
                where: { id: input },
                data: {
                    clickCounts: {
                        increment: isAdmin ? 0 : 1 // no increment if admin
                    },
                    updatedAt: new Date()
                }
            });

            return item;
        }
    }),
    updatePostViewCount: publicProcedure.input(z.string()).mutation(async ({ input }) => {
        const isAdmin = await checkUserRole('ADMIN');
        if (!isAdmin) {
            const post = await prisma.post.update({
                where: { id: input },
                data: {
                    viewCounts: {
                        increment: isAdmin ? 0 : 1 // no increment if admin
                    }
                }
            });

            return post;
        }
    }),
    checkDiscountCode: publicProcedure
        .input(
            z.object({
                discountCode: z.string().min(2, { message: 'Discount code must be at least 2 characters' }),
                totalPrice: z.coerce
                    .number({
                        message: 'Total price must be a number'
                    })
                    .gte(1, 'Must be 1 and above')
            })
        )
        .mutation(async ({ input }) => {
            const { totalPrice, discountCode } = input;

            const discount = await prisma.discountCode.findFirst({
                where: { code: discountCode, published: true }
            });

            if (!discount) throw new Error('Invalid discount code');

            if (discount.expirationDate && discount.expirationDate < new Date()) {
                throw new Error('Discount code expired');
            }

            if (discount.maxUsage && discount.usageCount >= discount.maxUsage) {
                throw new Error('Discount code max usage reached');
            }

            // ✅ Update usage count (optional, you can move this to AFTER success if needed)
            await prisma.discountCode.update({
                where: { id: discount.id },
                data: { usageCount: discount.usageCount + 1 }
            });

            // ✅ Determine applied amount just for display
            const isPercentageDiscount = discount.isPercentage;
            const discountRule = discount.discountValue; // e.g. 10 (%), or 15 ($)
            const appliedAmount = isPercentageDiscount
                ? Math.round(totalPrice * discountRule * 100) / 10000 // → cents safe → /100
                : discountRule;

            const finalTotalPrice = Math.max(totalPrice - appliedAmount, 0);

            const discountMessage = isPercentageDiscount
                ? `Discount applied: ${discountRule}% off`
                : `Discount applied: $${discountRule.toFixed(2)} off`;

            return {
                // return the rule (for Redux logic)
                discountAmount: discountRule, // e.g. 10 (%), or 15 ($)
                isPercentageDiscount,
                discountMessage,

                // optional: display only
                appliedAmount: appliedAmount, // e.g. $18.35
                newTotalPrice: finalTotalPrice
            };
        }),
    addReview: publicProcedure
        .input(
            z.object({
                itemId: z.string(),
                rating: z.number(),
                review: z.string()
            })
        )
        .mutation(async ({ input }) => {
            const user = await currentUser();
            const userEmail = user?.primaryEmailAddress?.emailAddress;
            let userId = '';

            const userCheck = await prisma.user.findFirst({
                where: { email: userEmail }
            });
            userId = userCheck?.id || '';
            if (!userCheck) {
                const newUser = await prisma.user.create({
                    data: {
                        email: userEmail
                    }
                });
                userId = newUser.id;
            }
            await prisma.itemReview.create({
                data: {
                    itemId: input.itemId,
                    userId: userId || '',
                    rating: input.rating,
                    review: input.review
                }
            });

            const item = await prisma.item.findUnique({
                where: { id: input.itemId },
                include: {
                    provider: { select: { id: true, name: true, phone: true } },
                    category: true,
                    images: {
                        orderBy: {
                            isPrimary: 'desc' // Sort images by isPrimary, primary images first
                        },
                        select: {
                            url: true,
                            isPrimary: true
                        }
                    },
                    reviews: {
                        select: {
                            id: true,
                            rating: true,
                            review: true,
                            user: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true,
                                    email: true
                                }
                            },
                            createdAt: true
                        },
                        orderBy: { createdAt: 'desc' }
                    }
                }
            });

            if (!item) {
                return null; // Explicitly return null if the item is not found
            }

            // Extract the primary image URL
            const primaryImageUrl = item.images[0]?.url || null;

            // Convert Date fields to strings if they are Date objects
            return {
                ...item,
                createdAt: item.createdAt instanceof Date ? item.createdAt.toISOString() : item.createdAt,
                updatedAt: item.updatedAt instanceof Date ? item.updatedAt.toISOString() : item.updatedAt,
                image: primaryImageUrl, // Add the primary image directly
                category: item.category
                    ? {
                          ...item.category,
                          createdAt:
                              item.category.createdAt instanceof Date
                                  ? item.category.createdAt.toISOString()
                                  : item.category.createdAt,
                          updatedAt:
                              item.category.updatedAt instanceof Date
                                  ? item.category.updatedAt.toISOString()
                                  : item.category.updatedAt
                      }
                    : null,
                reviews: item.reviews.map((review) => ({
                    ...review,
                    createdAt: review.createdAt instanceof Date ? review.createdAt.toISOString() : review.createdAt
                }))
            };
        }),

    // Delivery Zone Management
    getDeliveryZones: publicProcedure.query(async () => {
        const zones = await prisma.deliveryZone.findMany({
            include: {
                shippingMethods: {
                    where: { isActive: true },
                    orderBy: { sortOrder: 'asc' }
                }
            },
            orderBy: { countryCode: 'asc' }
        });

        return zones.map((zone) => ({
            ...zone,
            createdAt: zone.createdAt instanceof Date ? zone.createdAt.toISOString() : zone.createdAt,
            updatedAt: zone.updatedAt instanceof Date ? zone.updatedAt.toISOString() : zone.updatedAt,
            shippingMethods: zone.shippingMethods.map((method) => ({
                ...method,
                createdAt: method.createdAt instanceof Date ? method.createdAt.toISOString() : method.createdAt,
                updatedAt: method.updatedAt instanceof Date ? method.updatedAt.toISOString() : method.updatedAt
            }))
        }));
    }),

    getDeliveryZoneByCountry: publicProcedure.input(z.string()).query(async ({ input }) => {
        const zone = await prisma.deliveryZone.findUnique({
            where: { countryCode: input },
            include: {
                shippingMethods: {
                    where: { isActive: true },
                    orderBy: { sortOrder: 'asc' }
                }
            }
        });

        if (!zone) return null;

        return {
            ...zone,
            createdAt: zone.createdAt instanceof Date ? zone.createdAt.toISOString() : zone.createdAt,
            updatedAt: zone.updatedAt instanceof Date ? zone.updatedAt.toISOString() : zone.updatedAt,
            shippingMethods: zone.shippingMethods.map((method) => ({
                ...method,
                createdAt: method.createdAt instanceof Date ? method.createdAt.toISOString() : method.createdAt,
                updatedAt: method.updatedAt instanceof Date ? method.updatedAt.toISOString() : method.updatedAt
            }))
        };
    }),

    createDeliveryZone: publicProcedure
        .input(
            z.object({
                name: z.string().min(2, { message: 'Zone name must be at least 2 characters' }),
                countryCode: z.string().min(2, { message: 'Country code is required' }),
                currency: z.enum(['NZD', 'AUD']),
                freeThreshold: z.number().min(0, { message: 'Free threshold must be 0 or greater' }),
                isActive: z.boolean()
            })
        )
        .mutation(async ({ input }) => {
            const isAdmin = await checkUserRole('ADMIN');
            if (!isAdmin) {
                throw new TRPCError({
                    code: 'UNAUTHORIZED',
                    message: 'Only admins can create delivery zones'
                });
            }

            const createData: Prisma.DeliveryZoneCreateInput = {
                name: input.name,
                countryCode: input.countryCode,
                currency: input.currency as DbCurrency,
                freeThreshold: input.freeThreshold,
                isActive: input.isActive
            };

            const zone = await prisma.deliveryZone.create({
                data: createData
            });

            return zone;
        }),

    updateDeliveryZone: publicProcedure
        .input(
            z.object({
                id: z.string(),
                name: z.string().min(2, { message: 'Zone name must be at least 2 characters' }),
                countryCode: z.string().min(2, { message: 'Country code is required' }),
                currency: z.enum(['NZD', 'AUD']),
                freeThreshold: z.number().min(0, { message: 'Free threshold must be 0 or greater' }),
                isActive: z.boolean()
            })
        )
        .mutation(async ({ input }) => {
            const isAdmin = await checkUserRole('ADMIN');
            if (!isAdmin) {
                throw new TRPCError({
                    code: 'UNAUTHORIZED',
                    message: 'Only admins can update delivery zones'
                });
            }

            const { id, ...data } = input;
            const updateData: Prisma.DeliveryZoneUpdateInput = {
                name: data.name,
                countryCode: data.countryCode,
                currency: data.currency as DbCurrency,
                freeThreshold: data.freeThreshold,
                isActive: data.isActive,
                updatedAt: new Date()
            };

            const zone = await prisma.deliveryZone.update({
                where: { id },
                data: updateData
            });

            return zone;
        }),

    deleteDeliveryZone: publicProcedure.input(z.string()).mutation(async ({ input }) => {
        const isAdmin = await checkUserRole('ADMIN');
        if (!isAdmin) {
            throw new TRPCError({
                code: 'UNAUTHORIZED',
                message: 'Only admins can delete delivery zones'
            });
        }

        await prisma.deliveryZone.delete({
            where: { id: input }
        });
    }),

    // Shipping Method Management
    createShippingMethod: publicProcedure
        .input(
            z.object({
                deliveryZoneId: z.string(),
                methodId: z.string().min(2, { message: 'Method ID is required' }),
                label: z.string().min(2, { message: 'Label must be at least 2 characters' }),
                price: z.number().min(0, { message: 'Price must be 0 or greater' }),
                estimatedDays: z.string().min(1, { message: 'Estimated days is required' }),
                isFreeEligible: z.boolean(),
                isActive: z.boolean(),
                sortOrder: z.number().min(0, { message: 'Sort order must be 0 or greater' })
            })
        )
        .mutation(async ({ input }) => {
            const isAdmin = await checkUserRole('ADMIN');
            if (!isAdmin) {
                throw new TRPCError({
                    code: 'UNAUTHORIZED',
                    message: 'Only admins can create shipping methods'
                });
            }

            const method = await prisma.shippingMethod.create({
                data: input
            });

            return method;
        }),

    updateShippingMethod: publicProcedure
        .input(
            z.object({
                id: z.string(),
                deliveryZoneId: z.string(),
                methodId: z.string().min(2, { message: 'Method ID is required' }),
                label: z.string().min(2, { message: 'Label must be at least 2 characters' }),
                price: z.number().min(0, { message: 'Price must be 0 or greater' }),
                estimatedDays: z.string().min(1, { message: 'Estimated days is required' }),
                isFreeEligible: z.boolean(),
                isActive: z.boolean(),
                sortOrder: z.number().min(0, { message: 'Sort order must be 0 or greater' })
            })
        )
        .mutation(async ({ input }) => {
            const isAdmin = await checkUserRole('ADMIN');
            if (!isAdmin) {
                throw new TRPCError({
                    code: 'UNAUTHORIZED',
                    message: 'Only admins can update shipping methods'
                });
            }

            const { id, deliveryZoneId, ...data } = input;

            // Validate that the delivery zone exists
            const zone = await prisma.deliveryZone.findUnique({
                where: { id: deliveryZoneId }
            });

            if (!zone) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Delivery zone not found'
                });
            }

            // Check if method with same methodId already exists in the target zone (excluding current method)
            const existingMethod = await prisma.shippingMethod.findFirst({
                where: {
                    deliveryZoneId,
                    methodId: data.methodId,
                    id: { not: id }
                }
            });

            if (existingMethod) {
                throw new TRPCError({
                    code: 'CONFLICT',
                    message: 'A shipping method with this ID already exists in the selected zone'
                });
            }

            const method = await prisma.shippingMethod.update({
                where: { id },
                data: {
                    ...data,
                    deliveryZoneId,
                    updatedAt: new Date()
                }
            });

            return method;
        }),

    deleteShippingMethod: publicProcedure.input(z.string()).mutation(async ({ input }) => {
        const isAdmin = await checkUserRole('ADMIN');
        if (!isAdmin) {
            throw new TRPCError({
                code: 'UNAUTHORIZED',
                message: 'Only admins can delete shipping methods'
            });
        }

        await prisma.shippingMethod.delete({
            where: { id: input }
        });
    }),

    // Seed default delivery zones and methods
    seedDeliveryData: publicProcedure.mutation(async () => {
        const isAdmin = await checkUserRole('ADMIN');
        if (!isAdmin) {
            throw new TRPCError({
                code: 'UNAUTHORIZED',
                message: 'Only admins can seed delivery data'
            });
        }

        // Check if data already exists
        const existingZones = await prisma.deliveryZone.count();
        if (existingZones > 0) {
            throw new TRPCError({
                code: 'BAD_REQUEST',
                message: 'Delivery zones already exist'
            });
        }

        // Create NZ zone
        const nzZone = await prisma.deliveryZone.create({
            data: {
                name: 'New Zealand',
                countryCode: 'NZ',
                currency: DbCurrency.NZD,
                freeThreshold: 150,
                isActive: true
            }
        });

        // Create AU zone
        const auZone = await prisma.deliveryZone.create({
            data: {
                name: 'Australia',
                countryCode: 'AU',
                currency: DbCurrency.AUD,
                freeThreshold: 200,
                isActive: true
            }
        });

        // Create NZ shipping methods
        await prisma.shippingMethod.createMany({
            data: [
                {
                    deliveryZoneId: nzZone.id,
                    methodId: 'nz_tracked',
                    label: 'Economy',
                    price: 14,
                    estimatedDays: '1-3 business days',
                    isFreeEligible: true,
                    isActive: true,
                    sortOrder: 1
                },
                {
                    deliveryZoneId: nzZone.id,
                    methodId: 'nz_express',
                    label: 'Courier',
                    price: 18,
                    estimatedDays: '1-2 business days',
                    isFreeEligible: false,
                    isActive: true,
                    sortOrder: 2
                }
            ]
        });

        // Create AU shipping methods
        await prisma.shippingMethod.createMany({
            data: [
                {
                    deliveryZoneId: auZone.id,
                    methodId: 'au_standard',
                    label: 'Standard Tracked',
                    price: 29,
                    estimatedDays: '3-10 business days',
                    isFreeEligible: true,
                    isActive: true,
                    sortOrder: 1
                },
                {
                    deliveryZoneId: auZone.id,
                    methodId: 'au_express',
                    label: 'Courier',
                    price: 48,
                    estimatedDays: '2-6 business days',
                    isFreeEligible: false,
                    isActive: true,
                    sortOrder: 2
                }
            ]
        });

        return { message: 'Delivery data seeded successfully' };
    }),
    getNewsletterEmails: publicProcedure.query(async () => {
        const subscribers = await prisma.newsletterSubscriber.findMany({
            where: { isActive: true },
            select: { email: true }
        });

        return subscribers.map((s) => s.email).filter((e): e is string => !!e);
    }),

    // Category Management
    addCategory: publicProcedure
        .input(
            z.object({
                name: z.string().min(2, { message: 'Category name must be at least 2 characters' }),
                image: z.string().optional(),
                orderNumber: z.coerce
                    .number({
                        message: 'Order number must be a number'
                    })
                    .int()
                    .min(0, 'Order number must be 0 or above')
                    .optional()
            })
        )
        .mutation(async ({ input }) => {
            const isAdmin = await checkUserRole('ADMIN');
            if (!isAdmin) {
                throw new TRPCError({
                    code: 'UNAUTHORIZED',
                    message: 'Only admins can create categories'
                });
            }

            const category = await prisma.category.create({
                data: {
                    name: input.name,
                    image: input.image,
                    orderNumber: input.orderNumber || 0
                }
            });

            return category;
        }),

    updateCategory: publicProcedure
        .input(
            z.object({
                id: z.string(),
                name: z.string().min(2, { message: 'Category name must be at least 2 characters' }),
                image: z.string().optional(),
                orderNumber: z.coerce
                    .number({
                        message: 'Order number must be a number'
                    })
                    .int()
                    .min(0, 'Order number must be 0 or above')
                    .optional()
            })
        )
        .mutation(async ({ input }) => {
            const isAdmin = await checkUserRole('ADMIN');
            if (!isAdmin) {
                throw new TRPCError({
                    code: 'UNAUTHORIZED',
                    message: 'Only admins can update categories'
                });
            }

            const category = await prisma.category.update({
                where: { id: input.id },
                data: {
                    name: input.name,
                    image: input.image,
                    orderNumber: input.orderNumber || 0,
                    updatedAt: new Date()
                }
            });

            return category;
        }),

    deleteCategory: publicProcedure.input(z.string()).mutation(async ({ input }) => {
        const isAdmin = await checkUserRole('ADMIN');
        if (!isAdmin) {
            throw new TRPCError({
                code: 'UNAUTHORIZED',
                message: 'Only admins can delete categories'
            });
        }

        // Check if category has items
        const productsCount = await prisma.item.count({
            where: { categoryId: input }
        });

        if (productsCount > 0) {
            throw new TRPCError({
                code: 'BAD_REQUEST',
                message: `Cannot delete category. It has ${productsCount} item(s) assigned to it.`
            });
        }

        await prisma.category.delete({
            where: { id: input }
        });
    }),

    updateCategoryOrder: publicProcedure
        .input(
            z.array(
                z.object({
                    id: z.string(),
                    orderNumber: z.number()
                })
            )
        )
        .mutation(async ({ input }) => {
            const isAdmin = await checkUserRole('ADMIN');
            if (!isAdmin) {
                throw new TRPCError({
                    code: 'UNAUTHORIZED',
                    message: 'Only admins can update category order'
                });
            }

            // Update all categories in a transaction
            await prisma.$transaction(
                input.map((item) =>
                    prisma.category.update({
                        where: { id: item.id },
                        data: {
                            orderNumber: item.orderNumber,
                            updatedAt: new Date()
                        }
                    })
                )
            );

            return { success: true, message: 'Category order updated successfully' };
        })
});

export type AppRouter = typeof appRouter;

import prisma from '@/lib/prisma';

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import DOMPurify from 'dompurify';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(string: string) {
  return string
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '') // Remove invalid characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Replace multiple hyphens with a single hyphen
}

export function convertToCents(amount: number, factor = 100): number {
  return Math.round(amount * factor);
}

export function convertToDollar(amount: number): number {
  return parseFloat((amount / 100).toFixed(2)); // Convert the string back to a number
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function generateOrderCode(): string {
  const prefix = 'TRX';
  const randomString = Math.random()
    .toString(36)
    .substring(2, 10)
    .toUpperCase();
  return `${prefix}${randomString}`;
}

export async function generateUniqueOrderCode(): Promise<string> {
  const prefix = 'TRX';
  let orderCode = '';

  while (true) {
    // Generate the random code
    const randomString = Math.random()
      .toString(36)
      .substring(2, 10)
      .toUpperCase();
    orderCode = `${prefix}${randomString}`;

    // Check if this code already exists in the database
    const existingOrder = await prisma.order.findUnique({
      where: { orderCode: orderCode },
    });

    if (!existingOrder) {
      break; // The code is unique, exit the loop
    }
  }

  return orderCode;
}

export const getFullName = (firstName: string, lastName: string): string => {
  return `${firstName} ${lastName}`;
};

export function formatDateFromISO(isoString: string | undefined): string {
  if (!isoString) return '';

  const date = new Date(isoString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false, // Use `false` for 24-hour time format
  });
}

export function countSubtotal(quantity: number, price: number): number {
  return price * quantity;
}

// Sanitize HTML content before submission
export function sanitizeContent(html: string): string {
  return DOMPurify.sanitize(html, {
    ADD_TAGS: ['iframe', 'figure'], // Allowed tags
    ADD_ATTR: [
      'allow',
      'allowfullscreen',
      'autoplay',
      'controls',
      'start',
      'endtime',
      'loop',
      'modestbranding',
      'ivloadpolicy',
      'src',
      'frameborder',
      'width',
      'height',
      'style',
      'target',
    ], // Allow necessary attributes
  });
}

export function stripTagsAndExtractText(
  htmlString: string,
  maxLength = 160
): string {
  // Regular expression to remove HTML tags
  const plainText = htmlString.replace(/<[^>]*>?/gm, '');

  // Truncate the text if it's longer than maxLength
  const truncatedText =
    plainText.length > maxLength
      ? plainText.substring(0, maxLength) + '...'
      : plainText;

  return truncatedText;
}

export function stripTags(htmlString: string): string {
  return htmlString.replace(/<[^>]*>?/gm, '');
}

export function truncate(text: string, length: number): string {
  return text.length > length ? text.substring(0, length) + '...' : text;
}

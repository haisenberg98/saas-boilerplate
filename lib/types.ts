import { Category, Item, Provider } from '@prisma/client';

export type TCategory = {
    _id: string;
    category: string;
    image: string;
};

export type LayoutProps = {
    children: React.ReactNode;
};
export type TSliderFreeModeProps = {
    children: React.ReactNode;
    xlSlidePerView?: number;
    spaceBetween?: number;
};

export type TCategoryListProps = {
    categories: TCategory[];
};

export type TFavoriteProps = {
    favoriteStatus?: boolean;
    handleAddToFavorite?: () => void;
};

export type TDropdownProps = {
    isOpen?: boolean;
    show?: () => void;
    hide?: () => void;
    children?: React.ReactNode;
    onClick?: (e: React.MouseEvent) => void;
    to?: string;
};

export type CartItem = {
    id: string;
    name: string;
    price: number;
    quantity: number;
    description: string;
    image?: string;
    specification?: string;
    subTotal?: number;
    providerId: string;
};

export type DeliveryInfo = {
    firstName: string;
    lastName: string;
    phone: string;
    address: string;
    suburb: string;
    city: string;
    postCode: string;
    country: string;
    region?: string;
    deliveryInstructions?: string;
    deliveryMethod: string; // "nz_express"
    deliveryMethodLabel?: string; // "Courier"
    deliveryFee?: number;
};

export type DiscountInfo = {
    code: string;
    discountAmount: number;
    isPercentageDiscount: boolean;
    discountMessage: string;
    appliedAmount?: number;
};

export type CartState = {
    cartItems: CartItem[];
    totalItems: number;
    discountInfo: DiscountInfo | null;
    priceAfterDiscount: number;
    preTotalPrice: number;
    totalPrice: number;
    deliveryInfo: DeliveryInfo | null;
};

export type ModalProps = {
    handleCloseModal: (e: React.MouseEvent) => void;
};

export type ProductWithImageAndRelations = Item & {
    image: string | null;
    provider?: Provider | null;
    category?: Category | null;
};

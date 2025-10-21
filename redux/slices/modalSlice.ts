import { serverClient } from '@/app/_trpc/serverClient';
import { type PayloadAction, createSlice } from '@reduxjs/toolkit';

type ModalState = {
    isPageModalOpen: boolean;
    selectedProduct: Awaited<ReturnType<(typeof serverClient)['getProductById']>> | null;
    selectedOrder: Awaited<ReturnType<(typeof serverClient)['getUserOrderById']>> | null;
    selectedPost: Awaited<ReturnType<(typeof serverClient)['getPostById']>> | null;
    selectedPromotion: Awaited<ReturnType<(typeof serverClient)['getPromotionById']>> | null;
    modalName: string;
    isAdmin: boolean;
};

const initialState: ModalState = {
    isPageModalOpen: false,
    selectedProduct: null,
    selectedOrder: null,
    selectedPost: null,
    selectedPromotion: null,
    modalName: '',
    isAdmin: false
};

export const modalSlice = createSlice({
    name: 'modal',
    initialState: initialState,
    reducers: {
        openPageModal: (state, action: PayloadAction<string>) => {
            state.isPageModalOpen = true;
            state.modalName = action.payload;
        },
        setSelectedProduct: (state, action) => {
            state.selectedProduct = action.payload;
        },
        setSelectedOrder: (state, action) => {
            state.selectedOrder = action.payload;
        },
        setSelectedPost: (state, action) => {
            state.selectedPost = action.payload;
        },
        setSelectedPromotion: (state, action) => {
            state.selectedPromotion = action.payload;
        },
        setIsAdmin: (state, action) => {
            state.isAdmin = action.payload;
        },
        closePageModal: (state) => {
            state.isPageModalOpen = false;
            state.selectedProduct = null;
        }
    }
});

export const {
    openPageModal,
    closePageModal,
    setSelectedProduct,
    setSelectedOrder,
    setSelectedPost,
    setSelectedPromotion,
    setIsAdmin
} = modalSlice.actions;

export const selectIsPageModalOpen = (state: { modal: ModalState }) => state.modal.isPageModalOpen;

export const selectSelectedProduct = (state: { modal: ModalState }) => state.modal.selectedProduct;

export const selectSelectedOrder = (state: { modal: ModalState }) => state.modal.selectedOrder;

export const selectSelectedPost = (state: { modal: ModalState }) => state.modal.selectedPost;

export const selectSelectedPromotion = (state: { modal: ModalState }) => state.modal.selectedPromotion;

export const selectModalName = (state: { modal: ModalState }) => state.modal.modalName;

export const selectIsAdmin = (state: { modal: ModalState }) => state.modal.isAdmin;

export default modalSlice.reducer;

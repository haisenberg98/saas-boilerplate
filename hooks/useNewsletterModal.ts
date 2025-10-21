'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface UseNewsletterModalReturn {
    isModalOpen: boolean;
    openModal: () => void;
    closeModal: () => void;
}

export const useNewsletterModal = (): UseNewsletterModalReturn => {
    const ALWAYS_SHOW = process.env.NEXT_PUBLIC_NEWSLETTER_ALWAYS_SHOW === '1';
    const [isModalOpen, setIsModalOpen] = useState(false);
    const dismissedThisSession = useRef(false);
    const timers = useRef<{ showTimeout?: NodeJS.Timeout; scrollTimeout?: NodeJS.Timeout }>(Object.create(null));
    const listenersAdded = useRef(false);

    const DISMISS_TTL_MS = 24 * 60 * 60 * 1000; // 1 day

    const openModal = useCallback(() => {
        if (!ALWAYS_SHOW) {
            if (dismissedThisSession.current) return;
            // Respect persisted TTL
            try {
                const expires = localStorage.getItem('newsletter_popup_expires');
                if (expires && Date.now() < Number(expires)) return;
            } catch (err) {
                // Non-fatal: localStorage may be unavailable (privacy mode/SSR)
                console.debug('NewsletterModal: read expires failed', err);
            }
        }
        setIsModalOpen(true);
    }, [ALWAYS_SHOW]);

    const closeModal = useCallback(() => {
        if (!ALWAYS_SHOW) {
            dismissedThisSession.current = true;
            // Persist dismissal for 1 day
            try {
                localStorage.setItem('newsletter_popup_shown', 'true');
                localStorage.setItem('newsletter_popup_expires', String(Date.now() + DISMISS_TTL_MS));
            } catch (err) {
                // Non-fatal: storage could be blocked; proceed without persistence
                console.debug('NewsletterModal: persist dismissal failed', err);
            }
        }
        setIsModalOpen(false);
        // Cleanup timers and listeners immediately
        if (timers.current.showTimeout) clearTimeout(timers.current.showTimeout);
        if (timers.current.scrollTimeout) clearTimeout(timers.current.scrollTimeout);
        if (listenersAdded.current) {
            document.removeEventListener('mouseleave', handleMouseLeave);
            window.removeEventListener('scroll', handleScroll);
            listenersAdded.current = false;
        }
    }, [ALWAYS_SHOW]);
    // Define handlers outside effect to allow cleanup in closeModal
    const handleMouseLeave = useCallback(
        (e: MouseEvent) => {
            if (e.clientY <= 0) openModal();
        },
        [openModal]
    );
    const handleScroll = useCallback(() => {
        if (window.scrollY < 100) {
            if (timers.current.scrollTimeout) clearTimeout(timers.current.scrollTimeout);
            timers.current.scrollTimeout = setTimeout(() => {
                if (window.scrollY === 0) openModal();
            }, 500);
        }
    }, [openModal]);

    useEffect(() => {
        // In debug mode, ignore persisted TTL
        if (!ALWAYS_SHOW) {
            try {
                const expires = localStorage.getItem('newsletter_popup_expires');
                if (expires && Date.now() < Number(expires)) return;
            } catch (err) {
                console.debug('NewsletterModal: check expires failed', err);
            }
        }

        // Time-based trigger: 10s
        timers.current.showTimeout = setTimeout(() => {
            openModal();
        }, 10000);

        // Exit-intent after short delay
        const listenerInit = setTimeout(() => {
            if (!listenersAdded.current) {
                document.addEventListener('mouseleave', handleMouseLeave);
                window.addEventListener('scroll', handleScroll);
                listenersAdded.current = true;
            }
        }, 3000);

        return () => {
            if (timers.current.showTimeout) clearTimeout(timers.current.showTimeout);
            if (timers.current.scrollTimeout) clearTimeout(timers.current.scrollTimeout);
            clearTimeout(listenerInit);
            if (listenersAdded.current) {
                document.removeEventListener('mouseleave', handleMouseLeave);
                window.removeEventListener('scroll', handleScroll);
                listenersAdded.current = false;
            }
        };
    }, [ALWAYS_SHOW, openModal, handleMouseLeave, handleScroll]);

    return {
        isModalOpen,
        openModal,
        closeModal
    };
};

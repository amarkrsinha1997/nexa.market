"use client";

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

export function useNotifications() {
    const [isSupported, setIsSupported] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [permission, setPermission] = useState<NotificationPermission>('default');

    const checkSubscription = async () => {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();

        // Also check DB status
        try {
            const response = await apiClient.get<{ subscribed: boolean }>('/notifications/subscribe');
            // Check if response has property directly or inside data (depending on apiClient implementation)
            // Assuming apiClient returns the JSON body directly based on usage elsewhere
            setIsSubscribed(!!subscription || !!(response as any).subscribed);
        } catch (e) {
            setIsSubscribed(!!subscription);
        }
    };

    const urlBase64ToUint8Array = (base64String: string) => {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    };

    useEffect(() => {
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
            setIsSupported(true);
            setPermission(Notification.permission);
            checkSubscription();
        }
    }, []);

    const subscribe = async () => {
        if (!isSupported) return;

        try {
            if (!VAPID_PUBLIC_KEY) {
                console.error("VAPID Public Key missing");
                return;
            }

            const permissionResult = await Notification.requestPermission();
            setPermission(permissionResult);

            if (permissionResult !== 'granted') return;

            // Register Service Worker if not ready (though usually done in layout/entry)
            // We assume it is registered, or we register it here just in case for robustness as requested
            let registration = await navigator.serviceWorker.getRegistration();
            if (!registration) {
                registration = await navigator.serviceWorker.register('/sw.js');
            }
            await navigator.serviceWorker.ready;

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
            });

            // Send to backend
            await apiClient.post('/notifications/subscribe', { subscription });
            setIsSubscribed(true);
            return true;
        } catch (error) {
            console.error('Failed to subscribe to push notifications', error);
            return false;
        }
    };

    return {
        isSupported,
        isSubscribed,
        permission,
        subscribe
    };
}

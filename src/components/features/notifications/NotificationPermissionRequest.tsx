"use client";

import { useNotifications } from "@/lib/hooks/useNotifications";
import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { MixpanelUtils } from "@/lib/utils/mixpanel";
import { MixpanelEvents } from "@/lib/config/mixpanel-events";

export default function NotificationPermissionRequest() {
    const { isSupported, isSubscribed, permission, subscribe } = useNotifications();
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Show if supported, not subscribed, and permission is not denied
        if (isSupported && !isSubscribed && permission !== 'denied') {
            const timeout = setTimeout(() => setVisible(true), 2000); // Delay slightly
            return () => clearTimeout(timeout);
        } else {
            setVisible(false);
        }
    }, [isSupported, isSubscribed, permission]);

    if (!visible) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 animate-fade-in-up">
            <div className="bg-[#1a1b23] border border-blue-500/30 rounded-xl p-4 shadow-2xl max-w-sm flex items-start gap-4">
                <div className="p-3 bg-blue-500/10 rounded-full shrink-0">
                    <Bell className="text-blue-400" size={24} />
                </div>
                <div className="space-y-3">
                    <div>
                        <h4 className="font-semibold text-white">Enable Notifications</h4>
                        <p className="text-sm text-gray-400 mt-1">
                            Get instant updates on your orders and payments.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => { subscribe(); MixpanelUtils.track(MixpanelEvents.NOTIFICATION_SUBSCRIBE_CLICKED, { permission }); }}
                            className="text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            {permission === 'granted' ? 'Retry' : 'Enable'}
                        </button>
                        <button
                            onClick={() => { setVisible(false); MixpanelUtils.track(MixpanelEvents.NOTIFICATION_LATER_CLICKED); }}
                            className="text-xs font-medium text-gray-400 hover:text-white px-2 py-2"
                        >
                            Later
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

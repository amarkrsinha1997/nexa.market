"use client";

import { MixpanelUtils } from "@/lib/utils/mixpanel";
import { MixpanelEvents } from "@/lib/config/mixpanel-events";

interface PaymentDeeplinkProps {
    upiString: string;
}

export default function PaymentDeeplink({ upiString }: PaymentDeeplinkProps) {
    return (
        <a
            href={upiString}
            onClick={() => MixpanelUtils.track(MixpanelEvents.PAYMENT_PAGE_PAY_BUTTON_CLICKED, { upiString })}
            className="block w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-xl transition-colors text-center"
        >
            Pay <span className="text-sm">(भुगतान करें)</span>
        </a>
    );
}

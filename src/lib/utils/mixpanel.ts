import mixpanel, { Dict } from "mixpanel-browser";
import { User } from "@prisma/client"; // Assuming User type is here as seen in AuthContext

const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN || "";
const MIXPANEL_API_HOST = process.env.NEXT_PUBLIC_MIXPANEL_API_HOST || "https://api-eu.mixpanel.com";

export const MixpanelUtils = {
    init: () => {
        if (!MIXPANEL_TOKEN) {
            console.warn("Mixpanel Token not found");
            return;
        }

        mixpanel.init(MIXPANEL_TOKEN, {
            autocapture: true,
            record_sessions_percent: 100,
            api_host: MIXPANEL_API_HOST,
            debug: process.env.NODE_ENV === "development",
            track_pageview: false, // We will manually track page views for Next.js routing
            persistence: "localStorage",
        });
    },

    identify: (id: string) => {
        if (MIXPANEL_TOKEN) mixpanel.identify(id);
    },

    alias: (id: string) => {
        if (MIXPANEL_TOKEN) mixpanel.alias(id);
    },

    track: (name: string, props?: Dict) => {
        if (MIXPANEL_TOKEN) mixpanel.track(name, props);
    },

    people: {
        set: (props: Dict) => {
            if (MIXPANEL_TOKEN) mixpanel.people.set(props);
        },
    },

    calculateAge: (dob: Date | string | null): number | null => {
        if (!dob) return null;
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    },

    getDeviceType: (): string => {
        if (typeof navigator === "undefined") return "Unknown";
        const ua = navigator.userAgent;
        if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
            return "Tablet";
        }
        if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
            return "MobileView";
        }
        return "Desktop";
    },

    /**
     * Extracts and sets user profile data to Mixpanel
     */
    setUserProfile: (user: User) => {
        if (!user || !MIXPANEL_TOKEN) return;

        const age = MixpanelUtils.calculateAge(user.dateOfBirth);
        const device = MixpanelUtils.getDeviceType();

        const profileData = {
            "$email": user.email,
            "$name": user.name,
            "$phone": user.phoneNumber,
            "User Id": user.id,
            "Google Id": user.googleId,
            "DOB": user.dateOfBirth,
            "Age": age,
            "Wallet Address": user.nexaWalletAddress,
            "Joined At": user.createdAt,
            "Role": user.role,
            "Device": device,
        };

        // Register as Super Properties (attached to ALL events)
        if (MIXPANEL_TOKEN) mixpanel.register(profileData);

        // Standard Mixpanel People properties
        if (MIXPANEL_TOKEN) mixpanel.people.set(profileData);

        // Also identify if not already
        // mixpanel.identify(user.id); // Usually called separately
    }
};

"use client";

interface PaymentDeeplinkProps {
    upiString: string;
}

export default function PaymentDeeplink({ upiString }: PaymentDeeplinkProps) {
    return (
        <a
            href={upiString}
            className="block w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-xl transition-colors"
        >
            Pay via App
        </a>
    );
}

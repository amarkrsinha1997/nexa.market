"use client";

interface PaymentDeeplinkProps {
    upiString: string;
}

export default function PaymentDeeplink({ upiString }: PaymentDeeplinkProps) {
    return (
        <a
            href={upiString}
            className="block w-full bg-[#2a2b36] hover:bg-[#343542] text-white font-medium py-3 rounded-xl transition-colors"
        >
            Pay via App
        </a>
    );
}

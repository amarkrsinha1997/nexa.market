"use client";

import { QRCodeSVG } from "qrcode.react";

interface PaymentQRCodeProps {
    upiString: string;
}

export default function PaymentQRCode({ upiString }: PaymentQRCodeProps) {
    return (
        <div className="bg-white p-4 rounded-xl inline-block mx-auto">
            <QRCodeSVG value={upiString} size={150} />
        </div>
    );
}

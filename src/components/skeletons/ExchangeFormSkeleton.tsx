export default function ExchangeFormSkeleton() {
    return (
        <div className="max-w-md mx-auto space-y-6 pt-8 px-4 animate-pulse">
            <div className="bg-[#1a1b23] rounded-2xl p-6 shadow-xl border border-gray-800 space-y-6">
                {/* Header */}
                <div className="h-8 w-48 bg-gray-800 rounded mx-auto"></div>

                {/* Amount Input */}
                <div className="space-y-2">
                    <div className="h-4 w-24 bg-gray-800/50 rounded"></div>
                    <div className="h-14 w-full bg-[#0f1016] rounded-lg border border-gray-800"></div>
                </div>

                {/* Wallet Address */}
                <div className="space-y-2">
                    <div className="h-4 w-32 bg-gray-800/50 rounded"></div>
                    <div className="h-14 w-full bg-[#0f1016] rounded-lg border border-gray-800"></div>
                </div>

                {/* Exchange Rate */}
                <div className="flex justify-between items-center p-3 bg-[#0f1016] rounded-lg border border-gray-800/50">
                    <div className="h-4 w-20 bg-gray-800/50 rounded"></div>
                    <div className="h-4 w-28 bg-gray-800 rounded"></div>
                </div>

                {/* You'll Receive */}
                <div className="space-y-2">
                    <div className="h-4 w-28 bg-gray-800/50 rounded"></div>
                    <div className="h-10 w-full bg-[#0f1016] rounded-lg border border-gray-800 flex items-center justify-center">
                        <div className="h-5 w-32 bg-gray-800 rounded"></div>
                    </div>
                </div>

                {/* Action Button */}
                <div className="h-14 w-full bg-gray-800 rounded-xl"></div>
            </div>
        </div>
    );
}

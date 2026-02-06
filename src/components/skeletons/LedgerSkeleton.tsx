export default function LedgerSkeleton() {
    return (
        <div className="flex flex-col gap-2 px-4 md:px-0">
            {[1, 2, 3, 4, 5].map((i) => (
                <div
                    key={i}
                    className="bg-[#1a1b23] border border-gray-800 rounded-xl p-3 space-y-1.5 shadow-sm animate-pulse"
                >
                    {/* Amount and Status */}
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <div className="h-5 w-24 bg-gray-800 rounded"></div>
                            <div className="h-3 w-32 bg-gray-800/50 rounded"></div>
                        </div>
                        <div className="h-6 w-20 bg-gray-800 rounded-full"></div>
                    </div>

                    {/* Nexa Amount */}
                    <div className="flex justify-between items-center text-xs bg-[#0f1016] p-1.5 rounded-md border border-gray-800/50">
                        <div className="h-3 w-16 bg-gray-800 rounded"></div>
                        <div className="h-3 w-28 bg-gray-800 rounded"></div>
                    </div>

                    {/* Order ID */}
                    <div className="h-3 w-full bg-gray-800/50 rounded"></div>

                    {/* Transaction ID */}
                    <div className="h-3 w-3/4 bg-gray-800/50 rounded"></div>

                    {/* Payment Method */}
                    <div className="h-3 w-2/3 bg-gray-800/50 rounded"></div>

                    {/* Nexa Address */}
                    <div className="bg-[#0f1016]/50 p-2.5 rounded-xl border border-gray-800/50 space-y-1">
                        <div className="h-3 w-32 bg-gray-800 rounded"></div>
                        <div className="h-3 w-full bg-gray-800/50 rounded"></div>
                    </div>
                </div>
            ))}
        </div>
    );
}

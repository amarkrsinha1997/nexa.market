export default function OrderDetailsSkeleton() {
    return (
        <div className="min-h-screen bg-[#0f1016] p-4 md:p-8 text-white space-y-8 animate-pulse">
            {/* Header */}
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 bg-gray-800 rounded-lg"></div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="h-7 w-40 bg-gray-800 rounded"></div>
                            <div className="h-6 w-24 bg-gray-800 rounded-full"></div>
                        </div>
                        <div className="h-4 w-64 bg-gray-800/50 rounded"></div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left Column: Order Info & Lifecycle */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Summary Card */}
                        <div className="bg-[#1a1b23] border border-gray-800 rounded-2xl p-6 space-y-4">
                            <div className="h-6 w-48 bg-gray-800 rounded"></div>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="p-4 bg-gray-900/50 rounded-xl border border-gray-800/50 space-y-2">
                                        <div className="h-3 w-20 bg-gray-800 rounded"></div>
                                        <div className="h-6 w-24 bg-gray-800 rounded"></div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Lifecycle Timeline */}
                        <div className="bg-[#1a1b23] border border-gray-800 rounded-2xl p-6 space-y-6">
                            <div className="h-6 w-40 bg-gray-800 rounded"></div>
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="w-5 h-5 rounded-full bg-gray-800"></div>
                                        <div className="flex-1 bg-gray-900/50 rounded-xl p-4 border border-gray-800/50 space-y-2">
                                            <div className="h-4 w-32 bg-gray-800 rounded"></div>
                                            <div className="h-3 w-full bg-gray-800/50 rounded"></div>
                                            <div className="h-3 w-24 bg-gray-800/50 rounded"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: User & Actions */}
                    <div className="space-y-6">
                        {/* User Profile */}
                        <div className="bg-[#1a1b23] border border-gray-800 rounded-2xl p-6 space-y-4">
                            <div className="h-6 w-28 bg-gray-800 rounded"></div>
                            <div className="flex flex-col items-center text-center space-y-3">
                                <div className="w-20 h-20 rounded-full bg-gray-800"></div>
                                <div className="h-5 w-32 bg-gray-800 rounded"></div>
                                <div className="h-3 w-40 bg-gray-800/50 rounded"></div>
                            </div>
                            <div className="space-y-3">
                                <div className="h-4 w-full bg-gray-800/50 rounded"></div>
                                <div className="h-16 w-full bg-gray-900 rounded-lg border border-gray-800"></div>
                            </div>
                        </div>

                        {/* Admin Actions */}
                        <div className="bg-[#1a1b23] border border-gray-800 rounded-2xl p-6 space-y-4">
                            <div className="h-6 w-24 bg-gray-800 rounded"></div>
                            <div className="h-12 w-full bg-gray-800 rounded-xl"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

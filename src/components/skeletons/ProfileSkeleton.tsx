export default function ProfileSkeleton() {
    return (
        <div className="max-w-md mx-auto space-y-6 pt-8 pb-20 animate-pulse">
            {/* Header */}
            <header className="text-center space-y-1">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-800 mb-4 border-2 border-gray-700"></div>
                <div className="h-7 w-40 bg-gray-800 rounded mx-auto mb-2"></div>
                <div className="h-6 w-32 bg-gray-800/50 rounded-full mx-auto"></div>
            </header>

            {/* Account Details Card */}
            <div className="bg-[#1a1b23] rounded-2xl p-6 shadow-xl border border-gray-800 space-y-6">
                <div className="h-6 w-40 bg-gray-800 rounded"></div>

                {/* Read Only Fields */}
                <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="space-y-1">
                            <div className="h-3 w-24 bg-gray-800/50 rounded"></div>
                            <div className="bg-[#0f1016] p-3 rounded-lg border border-gray-800">
                                <div className="h-4 w-full bg-gray-800 rounded"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Edit Information Card */}
            <div className="bg-[#1a1b23] rounded-2xl p-6 shadow-xl border border-gray-800 space-y-6">
                <div className="h-6 w-36 bg-gray-800 rounded"></div>

                <div className="space-y-4">
                    {/* Phone Input */}
                    <div className="space-y-1">
                        <div className="h-3 w-20 bg-gray-800/50 rounded"></div>
                        <div className="h-12 w-full bg-[#0f1016] rounded-lg border border-gray-800"></div>
                    </div>

                    {/* Save Button */}
                    <div className="h-12 w-full bg-gray-800 rounded-xl"></div>
                </div>
            </div>

            {/* Logout Button */}
            <div className="px-4">
                <div className="h-12 w-full bg-gray-800/50 rounded-xl"></div>
            </div>
        </div>
    );
}

export default function UPISkeleton() {
    return (
        <div className="animate-pulse">
            {/* Desktop Table View */}
            <div className="hidden md:block bg-[#15161c] rounded-2xl border border-gray-800 overflow-hidden shadow-xl">
                <table className="w-full">
                    <thead className="bg-[#1a1b20] border-b border-gray-800">
                        <tr className="text-left text-xs uppercase tracking-wider text-gray-500 font-medium">
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Current State</th>
                            <th className="px-6 py-4">UPI Details</th>
                            <th className="px-6 py-4">Schedule</th>
                            <th className="px-6 py-4">Usage</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/50">
                        {[1, 2, 3, 4].map((i) => (
                            <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                                <td className="px-6 py-4">
                                    <div className="h-6 w-11 bg-gray-800 rounded-full"></div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="h-6 w-16 bg-gray-800 rounded-full"></div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="h-4 w-48 bg-gray-800 rounded mb-1"></div>
                                    <div className="h-3 w-32 bg-gray-800/50 rounded"></div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="h-4 w-32 bg-gray-800 rounded"></div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="h-4 w-20 bg-gray-800 rounded mb-1"></div>
                                    <div className="h-3 w-24 bg-gray-800/50 rounded"></div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-end gap-2">
                                        <div className="h-8 w-8 bg-gray-800 rounded-lg"></div>
                                        <div className="h-8 w-8 bg-gray-800 rounded-lg"></div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden grid grid-cols-1 gap-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-[#15161c] rounded-2xl border border-gray-800 p-5 shadow-lg">
                        {/* Header Row */}
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                                <div className="h-5 w-40 bg-gray-800 rounded mb-2"></div>
                                <div className="h-3 w-28 bg-gray-800/50 rounded"></div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <div className="h-3 w-3 bg-gray-800 rounded-full"></div>
                                <div className="h-6 w-11 bg-gray-800 rounded-full"></div>
                            </div>
                        </div>

                        {/* Info Grid */}
                        <div className="bg-[#0f1016] rounded-xl p-3 border border-gray-800/50 grid grid-cols-2 gap-3 mb-4">
                            <div>
                                <div className="h-3 w-16 bg-gray-800/50 rounded mb-1"></div>
                                <div className="h-4 w-24 bg-gray-800 rounded"></div>
                            </div>
                            <div>
                                <div className="h-3 w-12 bg-gray-800/50 rounded mb-1"></div>
                                <div className="h-4 w-20 bg-gray-800 rounded"></div>
                            </div>
                        </div>

                        {/* Action Footer */}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-800/50">
                            <div className="h-3 w-24 bg-gray-800/50 rounded"></div>
                            <div className="flex gap-1">
                                <div className="h-8 w-8 bg-gray-800 rounded-lg"></div>
                                <div className="h-8 w-8 bg-gray-800 rounded-lg"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

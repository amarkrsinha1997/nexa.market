"use client";

import { useRole } from "@/lib/hooks/useRole";

export default function AdminProfilePage() {
    const { user, isSuperAdmin } = useRole();

    return (
        <div className="p-8 max-w-3xl mx-auto space-y-8">
            <h1 className="text-2xl font-bold text-white">Admin Profile</h1>

            <div className="bg-[#1a1b23] rounded-2xl p-8 border border-gray-800 space-y-6 relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                <div className="flex flex-col md:flex-row items-center gap-8 z-10 relative">
                    {user?.picture ? (
                        <img src={user.picture} alt={user.name || "Admin"} className="w-32 h-32 rounded-full border-4 border-[#0f1016] shadow-xl" />
                    ) : (
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-4xl font-bold text-white border-4 border-[#0f1016] shadow-xl">
                            {user?.name?.[0] || "A"}
                        </div>
                    )}

                    <div className="text-center md:text-left space-y-2">
                        <div className="flex items-center justify-center md:justify-start gap-3">
                            <h2 className="text-3xl font-bold text-white">{user?.name}</h2>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase border ${isSuperAdmin
                                    ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                                    : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                }`}>
                                {user?.role}
                            </span>
                        </div>
                        <p className="text-gray-400 text-lg">{user?.email}</p>
                        <p className="text-gray-500 text-sm">Member since {user?.createdAt ? new Date(user.createdAt).getFullYear() : "-"}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-gray-800 mt-2">
                    <div className="bg-[#0f1016] p-4 rounded-xl border border-gray-800">
                        <label className="text-xs text-gray-500 block mb-1 uppercase tracking-wider">User ID</label>
                        <p className="text-gray-300 font-mono text-sm break-all">{user?.userId}</p>
                    </div>
                    <div className="bg-[#0f1016] p-4 rounded-xl border border-gray-800">
                        <label className="text-xs text-gray-500 block mb-1 uppercase tracking-wider">Account Status</label>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <p className="text-emerald-400 font-medium text-sm">Active</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

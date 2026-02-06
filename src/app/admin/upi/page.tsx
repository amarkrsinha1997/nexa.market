"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api/client";
import { Plus, Edit, Trash2, Power, PowerOff, Clock, Search, Zap, Filter } from "lucide-react";
import UPIFormModal from "@/components/features/admin/UPIFormModal";
import { MixpanelUtils } from "@/lib/utils/mixpanel";
import { MixpanelEvents } from "@/lib/config/mixpanel-events";
import UPISkeleton from "@/components/skeletons/UPISkeleton";

interface UPI {
    id: string;
    vpa: string;
    merchantName: string | null;
    isActive: boolean;
    scheduleStart: string | null;
    scheduleEnd: string | null;
    priority: number;
    lastUsedAt: string | null;
    usageCount: number;
    notes: string | null;
    maxDailyLimit: number | null;
    isFallback: boolean;
}

export default function UPIManagementPage() {
    const [upis, setUpis] = useState<UPI[]>([]);
    const [filteredUpis, setFilteredUpis] = useState<UPI[]>([]);
    const [filterStatus, setFilterStatus] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingUPI, setEditingUPI] = useState<UPI | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    const fetchUPIs = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get<{ upis: UPI[] }>('/admin/upi');
            if (res.success && res.data) {
                // Sort by scheduleStart time (nulls last or first depending on pref, user asked sort by schedule)
                // "Sort it by the schedule time"
                const sorted = res.data.upis.sort((a, b) => {
                    const timeA = a.scheduleStart || "24:00"; // Treat 24/7 as later or separate
                    const timeB = b.scheduleStart || "24:00";
                    return timeA.localeCompare(timeB);
                });
                setUpis(sorted);
            }
        } catch (error) {
            console.error('Failed to fetch UPIs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUPIs();
    }, []);

    // Filter logic
    useEffect(() => {
        if (filterStatus === "ALL") {
            setFilteredUpis(upis);
        } else {
            const isActive = filterStatus === "ACTIVE";
            setFilteredUpis(upis.filter(u => u.isActive === isActive));
        }
    }, [upis, filterStatus]);

    const handleToggle = async (id: string) => {
        try {
            const res = await apiClient.post(`/admin/upi/${id}/toggle`, {});
            if (res.success) {
                fetchUPIs(); // Refresh list
            }
        } catch (error) {
            console.error('Failed to toggle UPI:', error);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const res = await apiClient.delete(`/admin/upi/${id}`);
            if (res.success) {
                setDeleteConfirm(null);
                fetchUPIs();
            }
        } catch (error) {
            console.error('Failed to delete UPI:', error);
        }
    };

    const handleAdd = () => {
        setEditingUPI(null);
        setModalOpen(true);
    };

    const handleEdit = (upi: UPI) => {
        setEditingUPI(upi);
        setModalOpen(true);
    };

    const handleSave = () => {
        setModalOpen(false);
        setEditingUPI(null);
        fetchUPIs();
    };

    // Helper to check if currently "Live" (Active + Within Schedule)
    const isLive = (upi: UPI) => {
        if (!upi.isActive) return false;
        if (!upi.scheduleStart || !upi.scheduleEnd) return true; // 24/7 active

        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        // Simple comparison for same-day schedule
        if (upi.scheduleStart <= upi.scheduleEnd) {
            return currentTime >= upi.scheduleStart && currentTime <= upi.scheduleEnd;
        }
        // Overnight schedule (e.g. 22:00 to 06:00)
        else {
            return currentTime >= upi.scheduleStart || currentTime <= upi.scheduleEnd;
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0b0f] text-white p-4 md:p-6 pb-24">
            <div className="max-w-7xl mx-auto">
                {/* Header with Filters */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold mb-1">UPI Management</h1>
                    </div>

                    {/* Status Filter */}
                    <div className="flex bg-[#1a1b20] p-1 rounded-xl border border-gray-800 self-start">
                        {(["ALL", "ACTIVE", "INACTIVE"] as const).map((status) => (
                            <button
                                key={status}
                                onClick={() => { setFilterStatus(status); MixpanelUtils.track(MixpanelEvents.ADMIN_UPI_FILTER_STATUS_CHANGED, { status }); }}
                                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${filterStatus === status
                                    ? "bg-gray-700 text-white shadow-sm"
                                    : "text-gray-400 hover:text-gray-200"
                                    }`}
                            >
                                {status === "ALL" ? "All" : status === "ACTIVE" ? "Enabled" : "Disabled"}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <UPISkeleton />
                ) : filteredUpis.length === 0 ? (
                    <div className="text-center py-20 bg-[#15161c] rounded-2xl border border-gray-800/50">
                        <div className="bg-gray-800/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                            <Filter size={24} />
                        </div>
                        <p className="text-gray-300 font-medium">No UPIs found</p>
                        <p className="text-gray-500 text-sm mt-1">
                            {upis.length === 0 ? "Add your first payment method to get started" : "Try changing your filters"}
                        </p>
                        {upis.length === 0 && (
                            <button
                                onClick={() => { handleAdd(); MixpanelUtils.track(MixpanelEvents.ADMIN_UPI_ADD_CLICKED, { source: "Empty State" }); }}
                                className="mt-6 text-blue-500 hover:text-blue-400 font-medium text-sm"
                            >
                                + Add New UPI
                            </button>
                        )}
                    </div>
                ) : (
                    <>
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
                                    {filteredUpis.map((upi) => {
                                        const live = isLive(upi);
                                        return (
                                            <tr key={upi.id} className="hover:bg-white/[0.02] transition-colors group">
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() => { handleToggle(upi.id); MixpanelUtils.track(MixpanelEvents.ADMIN_UPI_TOGGLE_CLICKED, { id: upi.id, active: !upi.isActive }); }}
                                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#15161c] ${upi.isActive ? 'bg-blue-600' : 'bg-gray-700'
                                                            }`}
                                                    >
                                                        <span
                                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${upi.isActive ? 'translate-x-6' : 'translate-x-1'
                                                                }`}
                                                        />
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {live ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                                            <span className="relative flex h-2 w-2">
                                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                                            </span>
                                                            Live
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-500 text-xs">Offline</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-mono text-sm text-white">{upi.vpa}</div>
                                                    {upi.merchantName && (
                                                        <div className="text-xs text-gray-500 mt-0.5">{upi.merchantName}</div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {upi.scheduleStart ? (
                                                        <div className="flex items-center gap-2 text-sm text-gray-300">
                                                            <Clock size={14} className="text-blue-500" />
                                                            <span>{upi.scheduleStart} - {upi.scheduleEnd}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs font-medium bg-gray-800 text-gray-400 px-2 py-1 rounded">24/7 Always On</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-white">{upi.usageCount} orders</div>
                                                    <div className="text-xs text-gray-500">
                                                        Last: {upi.lastUsedAt ? new Date(upi.lastUsedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {upi.isFallback && (
                                                            <span className="px-2 py-1 bg-purple-500/10 text-purple-400 text-xs rounded border border-purple-500/20 mr-2">
                                                                Main Fallback
                                                            </span>
                                                        )}
                                                        <button
                                                            onClick={() => handleEdit(upi)}
                                                            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        {deleteConfirm === upi.id ? (
                                                            <button
                                                                onClick={() => { handleDelete(upi.id); MixpanelUtils.track(MixpanelEvents.ADMIN_UPI_DELETE_CONFIRMED, { id: upi.id }); }}
                                                                className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-medium transition-colors"
                                                            >
                                                                Confirm
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => setDeleteConfirm(upi.id)}
                                                                className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                                                                title="Delete"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden grid grid-cols-1 gap-4">
                            {filteredUpis.map((upi) => {
                                const live = isLive(upi);
                                return (
                                    <div key={upi.id} className="bg-[#15161c] rounded-2xl border border-gray-800 p-5 shadow-lg relative overflow-hidden">
                                        {/* Header Row */}
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <div className="font-mono text-base font-medium text-white break-all">{upi.vpa}</div>
                                                    {upi.isFallback && (
                                                        <span className="px-1.5 py-0.5 bg-purple-500/10 text-purple-400 text-[10px] rounded border border-purple-500/20 uppercase font-bold tracking-wider">
                                                            Main
                                                        </span>
                                                    )}
                                                </div>
                                                {upi.merchantName && (
                                                    <div className="text-sm text-gray-500 mt-1">{upi.merchantName}</div>
                                                )}
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                {live && (
                                                    <span className="flex h-3 w-3 relative">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                                    </span>
                                                )}
                                                <button
                                                    onClick={() => { handleToggle(upi.id); MixpanelUtils.track(MixpanelEvents.ADMIN_UPI_TOGGLE_CLICKED, { id: upi.id, active: !upi.isActive }); }}
                                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#15161c] ${upi.isActive ? 'bg-blue-600' : 'bg-gray-700'}`}
                                                >
                                                    <span
                                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${upi.isActive ? 'translate-x-6' : 'translate-x-1'}`}
                                                    />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Info Grid */}
                                        <div className="bg-[#0f1016] rounded-xl p-3 border border-gray-800/50 grid grid-cols-2 gap-3 mb-4">
                                            <div>
                                                <div className="text-xs text-gray-500 mb-1">Schedule</div>
                                                {upi.scheduleStart ? (
                                                    <div className="text-sm font-medium text-white flex items-center gap-1.5">
                                                        <Clock size={12} className="text-blue-500" />
                                                        {upi.scheduleStart}-{upi.scheduleEnd}
                                                    </div>
                                                ) : (
                                                    <div className="text-sm font-medium text-gray-400">24/7 Active</div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="text-xs text-gray-500 mb-1">Usage</div>
                                                <div className="text-sm font-medium text-white">{upi.usageCount} orders</div>
                                            </div>
                                        </div>

                                        {/* Action Footer */}
                                        <div className="flex items-center justify-between pt-2 border-t border-gray-800/50">
                                            <div className="text-xs text-gray-500">
                                                Used: {upi.lastUsedAt ? new Date(upi.lastUsedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Never'}
                                            </div>
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => handleEdit(upi)}
                                                    className="p-2 bg-gray-800 rounded-lg text-gray-300 hover:text-white"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                {deleteConfirm === upi.id ? (
                                                    <button
                                                        onClick={() => { handleDelete(upi.id); MixpanelUtils.track(MixpanelEvents.ADMIN_UPI_DELETE_CONFIRMED, { id: upi.id, device: "Mobile" }); }}
                                                        className="px-3 py-2 bg-red-600 rounded-lg text-white text-xs font-bold"
                                                    >
                                                        Confirm
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => setDeleteConfirm(upi.id)}
                                                        className="p-2 bg-gray-800 rounded-lg text-gray-300 hover:text-red-500"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}

                {/* Floating Add Button */}
                <button
                    onClick={() => { handleAdd(); MixpanelUtils.track(MixpanelEvents.ADMIN_UPI_ADD_CLICKED, { source: "Floating Button" }); }}
                    className="fixed bottom-24 right-6 md:bottom-10 md:right-10 z-50 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 md:px-6 md:py-3 shadow-lg hover:shadow-xl transition-all shadow-blue-900/30 active:scale-95"
                >
                    <Plus size={24} />
                    <span className="hidden md:inline font-medium">Add UPI</span>
                </button>

                {/* UPI Form Modal */}
                {modalOpen && (
                    <UPIFormModal
                        upi={editingUPI}
                        onClose={() => setModalOpen(false)}
                        onSave={handleSave}
                    />
                )}
            </div>
        </div>
    );
}

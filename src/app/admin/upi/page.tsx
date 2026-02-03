"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api/client";
import { Plus, Edit, Trash2, Power, PowerOff, Clock } from "lucide-react";
import UPIFormModal from "@/components/features/admin/UPIFormModal";

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
}

export default function UPIManagementPage() {
    const [upis, setUpis] = useState<UPI[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingUPI, setEditingUPI] = useState<UPI | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    const fetchUPIs = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get<{ upis: UPI[] }>('/admin/upi');
            if (res.success && res.data) {
                setUpis(res.data.upis);
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

    return (
        <div className="min-h-screen bg-[#0a0b0f] text-white p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">UPI Management</h1>
                        <p className="text-gray-400">Manage payment methods with scheduling and rotation</p>
                    </div>
                    <button
                        onClick={handleAdd}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
                    >
                        <Plus size={20} />
                        Add UPI
                    </button>
                </div>

                {/* UPI Table */}
                {loading ? (
                    <div className="text-center py-12 text-gray-400">Loading UPIs...</div>
                ) : upis.length === 0 ? (
                    <div className="text-center py-12 bg-gray-800/30 rounded-lg">
                        <p className="text-gray-400 mb-4">No UPIs configured</p>
                        <button
                            onClick={handleAdd}
                            className="text-blue-500 hover:text-blue-400"
                        >
                            Add your first UPI
                        </button>
                    </div>
                ) : (
                    <div className="bg-gray-800/30 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-800/50">
                                    <tr className="text-left text-sm text-gray-400">
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3">UPI ID</th>
                                        <th className="px-4 py-3">Merchant</th>
                                        <th className="px-4 py-3">Schedule</th>
                                        <th className="px-4 py-3">Priority</th>
                                        <th className="px-4 py-3">Usage</th>
                                        <th className="px-4 py-3">Last Used</th>
                                        <th className="px-4 py-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {upis.map((upi) => (
                                        <tr key={upi.id} className="hover:bg-gray-800/30 transition-colors">
                                            <td className="px-4 py-3">
                                                <button
                                                    onClick={() => handleToggle(upi.id)}
                                                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${upi.isActive
                                                            ? 'bg-emerald-500/20 text-emerald-500'
                                                            : 'bg-gray-500/20 text-gray-500'
                                                        }`}
                                                >
                                                    {upi.isActive ? <Power size={12} /> : <PowerOff size={12} />}
                                                    {upi.isActive ? 'Active' : 'Inactive'}
                                                </button>
                                            </td>
                                            <td className="px-4 py-3 font-mono text-sm">{upi.vpa}</td>
                                            <td className="px-4 py-3 text-gray-400">{upi.merchantName || '-'}</td>
                                            <td className="px-4 py-3">
                                                {upi.scheduleStart && upi.scheduleEnd ? (
                                                    <div className="flex items-center gap-1 text-sm text-gray-400">
                                                        <Clock size={14} />
                                                        {upi.scheduleStart} - {upi.scheduleEnd}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-600">24/7</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-500 text-xs font-semibold">
                                                    {upi.priority}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-gray-400">{upi.usageCount}x</td>
                                            <td className="px-4 py-3 text-gray-400 text-sm">
                                                {upi.lastUsedAt ? new Date(upi.lastUsedAt).toLocaleString() : 'Never'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleEdit(upi)}
                                                        className="p-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    {deleteConfirm === upi.id ? (
                                                        <div className="flex gap-1">
                                                            <button
                                                                onClick={() => handleDelete(upi.id)}
                                                                className="px-2 py-1 rounded bg-red-500 text-white text-xs"
                                                            >
                                                                Confirm
                                                            </button>
                                                            <button
                                                                onClick={() => setDeleteConfirm(null)}
                                                                className="px-2 py-1 rounded bg-gray-600 text-white text-xs"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => setDeleteConfirm(upi.id)}
                                                            className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* UPI Form Modal */}
            {modalOpen && (
                <UPIFormModal
                    upi={editingUPI}
                    onClose={() => setModalOpen(false)}
                    onSave={handleSave}
                />
            )}
        </div>
    );
}

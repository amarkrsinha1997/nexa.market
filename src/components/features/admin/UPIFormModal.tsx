"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api/client";
import { X } from "lucide-react";

interface UPI {
    id: string;
    vpa: string;
    merchantName: string | null;
    isActive: boolean;
    scheduleStart: string | null;
    scheduleEnd: string | null;
    priority: number;
    notes: string | null;
    maxDailyLimit: number | null;
}

interface UPIFormModalProps {
    upi: UPI | null; // null for new UPI, populated for edit
    onClose: () => void;
    onSave: () => void;
}

export default function UPIFormModal({ upi, onClose, onSave }: UPIFormModalProps) {
    const [formData, setFormData] = useState({
        vpa: upi?.vpa || "",
        merchantName: upi?.merchantName || "",
        scheduleStart: upi?.scheduleStart || "",
        scheduleEnd: upi?.scheduleEnd || "",
        priority: upi?.priority?.toString() || "0",
        notes: upi?.notes || "",
        maxDailyLimit: upi?.maxDailyLimit?.toString() || "",
        isActive: upi?.isActive ?? true
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSaving(true);

        try {
            const payload = {
                ...formData,
                merchantName: formData.merchantName || null,
                scheduleStart: formData.scheduleStart || null,
                scheduleEnd: formData.scheduleEnd || null,
                priority: parseInt(formData.priority) || 0,
                notes: formData.notes || null,
                maxDailyLimit: formData.maxDailyLimit ? parseFloat(formData.maxDailyLimit) : null
            };

            if (upi) {
                // Update existing UPI
                const res = await apiClient.put(`/admin/upi/${upi.id}`, payload);
                if (!res.success) {
                    setError(res.message || "Failed to update UPI");
                    return;
                }
            } else {
                // Create new UPI
                const res = await apiClient.post('/admin/upi', payload);
                if (!res.success) {
                    setError(res.message || "Failed to create UPI");
                    return;
                }
            }

            onSave();
        } catch (err: any) {
            setError(err.message || "An error occurred");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1a1b20] rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-800">
                    <h2 className="text-xl font-bold text-white">
                        {upi ? 'Edit UPI' : 'Add New UPI'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-500 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    {/* UPI ID */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            UPI ID <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.vpa}
                            onChange={(e) => setFormData({ ...formData, vpa: e.target.value })}
                            placeholder="merchant@paytm"
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                            required
                        />
                    </div>

                    {/* Merchant Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Merchant Name
                        </label>
                        <input
                            type="text"
                            value={formData.merchantName}
                            onChange={(e) => setFormData({ ...formData, merchantName: e.target.value })}
                            placeholder="Optional merchant name"
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    {/* Schedule */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Schedule Start (HH:mm)
                            </label>
                            <input
                                type="time"
                                value={formData.scheduleStart}
                                onChange={(e) => setFormData({ ...formData, scheduleStart: e.target.value })}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                            />
                            <p className="text-xs text-gray-500 mt-1">Leave empty for 24/7</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Schedule End (HH:mm)
                            </label>
                            <input
                                type="time"
                                value={formData.scheduleEnd}
                                onChange={(e) => setFormData({ ...formData, scheduleEnd: e.target.value })}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                            />
                            <p className="text-xs text-gray-500 mt-1">End time (inclusive)</p>
                        </div>
                    </div>

                    {/* Priority */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Priority (Lower = Higher Priority)
                        </label>
                        <input
                            type="number"
                            value={formData.priority}
                            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                            min="0"
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">0 = highest priority</p>
                    </div>

                    {/* Max Daily Limit */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Max Daily Limit (₹)
                        </label>
                        <input
                            type="number"
                            value={formData.maxDailyLimit}
                            onChange={(e) => setFormData({ ...formData, maxDailyLimit: e.target.value })}
                            min="0"
                            step="0.01"
                            placeholder="Optional daily limit"
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Notes
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Optional notes or comments"
                            rows={3}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 resize-none"
                        />
                    </div>

                    {/* Active Status */}
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="isActive"
                            checked={formData.isActive}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                            className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-700 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="isActive" className="text-sm text-gray-300">
                            Active (Can be selected for payments)
                        </label>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white font-medium py-2 rounded-lg transition-colors"
                        >
                            {saving ? 'Saving...' : (upi ? 'Update UPI' : 'Add UPI')}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

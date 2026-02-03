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
    isFallback: boolean;
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
        isActive: upi?.isActive ?? true,
        isFallback: upi?.isFallback || false
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
                priority: 0, // Default to 0 as UI control is removed
                notes: formData.notes || null,
                maxDailyLimit: formData.maxDailyLimit ? parseFloat(formData.maxDailyLimit) : null,
                isFallback: formData.isFallback
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
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-500 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* Active Toggle & Merchant */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                UPI ID <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.vpa}
                                onChange={(e) => setFormData({ ...formData, vpa: e.target.value })}
                                placeholder="merchant@upi"
                                className="w-full bg-[#0f1016] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 placeholder-gray-600 font-mono"
                                required
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Merchant Name
                            </label>
                            <input
                                type="text"
                                value={formData.merchantName}
                                onChange={(e) => setFormData({ ...formData, merchantName: e.target.value })}
                                placeholder="e.g. Nexa Store"
                                className="w-full bg-[#0f1016] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 placeholder-gray-600"
                            />
                        </div>
                    </div>

                    {/* Timer Section (Centered & Dark) */}
                    <div className="bg-[#0f1016] rounded-xl p-6 border border-gray-800 flex flex-col items-center justify-center text-center">
                        <label className="block text-sm font-medium text-blue-400 mb-4 uppercase tracking-wider">
                            Active Schedule (24-Hour)
                        </label>
                        <div className="flex items-center gap-4">
                            <div className="group">
                                <input
                                    type="time"
                                    value={formData.scheduleStart}
                                    onChange={(e) => setFormData({ ...formData, scheduleStart: e.target.value })}
                                    className="bg-[#1a1b20] border border-gray-700 text-white text-2xl font-mono rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 text-center w-32 [color-scheme:dark]"
                                />
                                <span className="block text-xs text-gray-500 mt-2">Start Time</span>
                            </div>
                            <span className="text-gray-600 text-xl font-bold">→</span>
                            <div className="group">
                                <input
                                    type="time"
                                    value={formData.scheduleEnd}
                                    onChange={(e) => setFormData({ ...formData, scheduleEnd: e.target.value })}
                                    className="bg-[#1a1b20] border border-gray-700 text-white text-2xl font-mono rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 text-center w-32 [color-scheme:dark]"
                                />
                                <span className="block text-xs text-gray-500 mt-2">End Time</span>
                            </div>
                        </div>
                        <p className="text-xs text-gray-600 mt-4 italic">
                            Leave both empty for 24/7 availability
                        </p>
                    </div>

                    {/* Limits & Notes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Daily Limit (₹)
                            </label>
                            <input
                                type="number"
                                value={formData.maxDailyLimit}
                                onChange={(e) => setFormData({ ...formData, maxDailyLimit: e.target.value })}
                                min="0"
                                placeholder="No limit"
                                className="w-full bg-[#0f1016] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 placeholder-gray-600"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Status
                            </label>
                            <label className="flex items-center gap-3 bg-[#0f1016] border border-gray-700 rounded-xl px-4 py-3 cursor-pointer hover:bg-white/5 transition-colors">
                                <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${formData.isActive ? 'bg-blue-600 border-blue-600' : 'border-gray-500'}`}>
                                    {formData.isActive && <div className="w-2 h-2 bg-white rounded-sm" />}
                                </div>
                                <input
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="hidden"
                                />
                                <span className={formData.isActive ? "text-white" : "text-gray-400"}>
                                    {formData.isActive ? "Enabled" : "Disabled"}
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Fallback Checkbox */}
                    <div className="bg-[#0f1016] border border-gray-700 rounded-xl px-4 py-3">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${formData.isFallback ? 'bg-purple-600 border-purple-600' : 'border-gray-500'}`}>
                                {formData.isFallback && <div className="w-2 h-2 bg-white rounded-sm" />}
                            </div>
                            <input
                                type="checkbox"
                                checked={formData.isFallback}
                                onChange={(e) => setFormData({ ...formData, isFallback: e.target.checked })}
                                className="hidden"
                            />
                            <div>
                                <span className="text-white font-medium block">Set as Main Fallback</span>
                                <span className="text-xs text-gray-400">Used when no scheduled UPIs are available</span>
                            </div>
                        </label>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            Internal Notes
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Optional comments..."
                            rows={2}
                            className="w-full bg-[#0f1016] border border-gray-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500 resize-none placeholder-gray-600"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-3 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-[2] bg-blue-600 hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition-colors shadow-lg shadow-blue-900/20"
                        >
                            {saving ? 'Saving...' : (upi ? 'Update UPI' : 'Add UPI')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

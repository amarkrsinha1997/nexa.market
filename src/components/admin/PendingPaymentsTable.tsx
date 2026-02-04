"use client";

import { Order } from "@/types/order";
import { format } from "date-fns";
import { formatNexaAmount } from "@/lib/utils/format";
import { useState } from "react";
import { Check, RefreshCw, AlertTriangle } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import StatusBadge from "@/components/ui/StatusBadge";

interface PendingPaymentsTableProps {
    orders: Order[];
    onRefresh: () => void;
}

export default function PendingPaymentsTable({ orders, onRefresh }: PendingPaymentsTableProps) {
    const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
    const [processing, setProcessing] = useState<Set<string>>(new Set()); // IDs of orders processing
    const [bulkProcessing, setBulkProcessing] = useState(false);

    const toggleSelect = (orderId: string) => {
        const newSelected = new Set(selectedOrders);
        if (newSelected.has(orderId)) {
            newSelected.delete(orderId);
        } else {
            newSelected.add(orderId);
        }
        setSelectedOrders(newSelected);
    };

    const toggleSelectAll = () => {
        if (selectedOrders.size === orders.length) {
            setSelectedOrders(new Set());
        } else {
            setSelectedOrders(new Set(orders.map(o => o.id)));
        }
    };

    const handleReprocessSingle = async (orderId: string) => {
        if (processing.has(orderId)) return;

        setProcessing(prev => new Set(prev).add(orderId));
        try {
            const res = await apiClient.post(`/admin/orders/${orderId}/reprocess-payment`, {});
            if (res.success) {
                // Success toast?
                onRefresh();
            } else {
                alert(`Failed: ${res.message}`);
            }
        } catch (error) {
            console.error("Reprocess failed", error);
            alert("Reprocess failed");
        } finally {
            setProcessing(prev => {
                const next = new Set(prev);
                next.delete(orderId);
                return next;
            });
        }
    };

    const handleBulkReprocess = async () => {
        if (bulkProcessing || selectedOrders.size === 0) return;

        if (!confirm(`Are you sure you want to retry payments for ${selectedOrders.size} orders?`)) return;

        setBulkProcessing(true);
        try {
            const res = await apiClient.post('/admin/orders/reprocess-bulk', {
                orderIds: Array.from(selectedOrders)
            });

            if (res.success) {
                const summary = res.data as any; // Cast if needed
                alert(`Processed: ${summary?.summary?.succeeded} succeeded, ${summary?.summary?.failed} failed`);
                setSelectedOrders(new Set());
                onRefresh();
            } else {
                alert(`Bulk process failed: ${res.message}`);
            }
        } catch (error) {
            console.error("Bulk reprocess failed", error);
            alert("Bulk reprocess failed");
        } finally {
            setBulkProcessing(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Bulk Actions Bar */}
            {selectedOrders.size > 0 && (
                <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3 flex items-center justify-between">
                    <span className="text-blue-200 text-sm font-medium">
                        {selectedOrders.size} orders selected
                    </span>
                    <button
                        onClick={handleBulkReprocess}
                        disabled={bulkProcessing}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        <RefreshCw size={16} className={bulkProcessing ? "animate-spin" : ""} />
                        {bulkProcessing ? "Processing..." : "Retry Selected Payments"}
                    </button>
                </div>
            )}

            <div className="hidden md:block overflow-x-auto min-h-[400px] bg-[#1a1b23] rounded-2xl border border-gray-800 overflow-hidden shadow-xl">
                <table className="w-full text-left text-sm text-gray-400">
                    <thead className="bg-[#0f1016] text-gray-300 uppercase tracking-wider text-xs font-semibold">
                        <tr>
                            <th className="px-6 py-4 w-12">
                                <input
                                    type="checkbox"
                                    checked={selectedOrders.size === orders.length && orders.length > 0}
                                    onChange={toggleSelectAll}
                                    className="rounded border-gray-700 bg-gray-800 text-blue-600 focus:ring-blue-500/20"
                                />
                            </th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4">Failure Reason</th>
                            <th className="px-6 py-4 text-center">Status</th>
                            <th className="px-6 py-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {orders.map((order) => (
                            <tr key={order.id} className="hover:bg-gray-800/50 transition-colors">
                                <td className="px-6 py-4">
                                    <input
                                        type="checkbox"
                                        checked={selectedOrders.has(order.id)}
                                        onChange={() => toggleSelect(order.id)}
                                        className="rounded border-gray-700 bg-gray-800 text-blue-600 focus:ring-blue-500/20"
                                    />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex flex-col">
                                        <span>{format(new Date(order.createdAt), "MMM d, yyyy")}</span>
                                        <span className="text-xs text-gray-500">{format(new Date(order.createdAt), "h:mm a")}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-500">
                                            {order.user?.name?.[0] || "U"}
                                        </div>
                                        <span className="text-white">{order.user?.name}</span>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">{order.user?.email}</div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="font-medium text-emerald-500">{formatNexaAmount(order.nexaAmount)} NEX</div>
                                    <div className="text-xs text-gray-500">₹{order.amountINR}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-start gap-2 text-orange-400 max-w-xs">
                                        <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                                        <span className="text-xs">{order.paymentFailureReason || "Unknown error"}</span>
                                    </div>
                                    {order.paymentRecipientAddress && (
                                        <div className="mt-1 text-xs font-mono text-gray-600">
                                            To: {order.paymentRecipientAddress.slice(0, 10)}...
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <StatusBadge status={order.status} />
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <button
                                        onClick={() => handleReprocessSingle(order.id)}
                                        disabled={processing.has(order.id)}
                                        className="p-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors disabled:opacity-50"
                                        title="Retry Payment"
                                    >
                                        <RefreshCw size={16} className={processing.has(order.id) ? "animate-spin" : ""} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {orders.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                        No failed payments found.
                    </div>
                )}
            </div>

            {/* Mobile View (Simplified List) */}
            <div className="md:hidden space-y-4">
                {orders.map((order) => (
                    <div key={order.id} className="bg-[#1a1b23] border border-gray-800 rounded-xl p-4 space-y-3">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={selectedOrders.has(order.id)}
                                    onChange={() => toggleSelect(order.id)}
                                    className="rounded border-gray-700 bg-gray-800 text-blue-600 focus:ring-blue-500/20"
                                />
                                <div>
                                    <div className="text-white font-medium">{order.user?.name}</div>
                                    <div className="text-xs text-gray-500">{format(new Date(order.createdAt), "MMM d, h:mm a")}</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-emerald-500 font-medium">{formatNexaAmount(order.nexaAmount)} NEX</div>
                                <StatusBadge status={order.status} />
                            </div>
                        </div>

                        <div className="bg-orange-500/10 rounded-lg p-3 text-xs text-orange-400 flex gap-2">
                            <AlertTriangle size={14} className="shrink-0" />
                            {order.paymentFailureReason}
                        </div>

                        <button
                            onClick={() => handleReprocessSingle(order.id)}
                            disabled={processing.has(order.id)}
                            className="w-full py-2 bg-blue-600/10 text-blue-500 rounded-lg text-sm font-medium hover:bg-blue-600/20 flex justify-center items-center gap-2"
                        >
                            <RefreshCw size={14} className={processing.has(order.id) ? "animate-spin" : ""} />
                            Retry Payment
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

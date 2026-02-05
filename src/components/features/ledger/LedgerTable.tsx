"use client";

import { Order } from "@/types/order";
import { User } from "@prisma/client";
import { format } from "date-fns";
import { formatNexaAmount } from "@/lib/utils/format";
import StatusBadge from "@/components/ui/StatusBadge";
import { Check, ThumbsUp, ThumbsDown, Lock, ChevronDown, ChevronUp, ShieldCheck, AlertTriangle, RefreshCw } from "lucide-react";
import { useState, Fragment } from "react";
import LifecycleViewer from "./LifecycleViewer";

interface LedgerTableProps {
    orders: Order[];
    currentUser?: User | null;
    onCheck?: (orderId: string) => void;
    onDecision?: (orderId: string, decision: 'APPROVE' | 'REJECT', reason?: string) => void;
    onReprocess?: (orderId: string) => void;
}

export default function LedgerTable({ orders, currentUser, onCheck, onDecision, onReprocess }: LedgerTableProps) {
    const isAdminView = !!currentUser && (currentUser.role === 'ADMIN' || currentUser.role === 'SUPERADMIN');
    const isSuperAdmin = currentUser?.role === 'SUPERADMIN';
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const handleReprocess = async (e: React.MouseEvent, orderId: string) => {
        e.stopPropagation();
        if (processingId) return;
        setProcessingId(orderId);
        await onReprocess?.(orderId);
        setProcessingId(null);
    };

    const toggleExpanded = (orderId: string) => {
        setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
    };

    return (
        <div className="hidden md:block overflow-x-auto min-h-[400px]">
            <table className="w-full text-left text-sm text-gray-400">
                <thead className="bg-[#0f1016] text-gray-300 uppercase tracking-wider text-xs font-semibold sticky top-0 z-10 shadow-sm shadow-[#0f1016]">
                    <tr>
                        {isAdminView && <th className="px-6 py-4 w-12"></th>}
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Payment Method</th>
                        {isAdminView && <th className="px-6 py-4">User</th>}
                        <th className="px-6 py-4">Order ID</th>
                        <th className="px-6 py-4">Destination Wallet</th>
                        <th className="px-6 py-4">Ref ID</th>
                        <th className="px-6 py-4 text-right">Amount (INR)</th>
                        <th className="px-6 py-4 text-right">Nexa</th>
                        <th className="px-6 py-4 text-center">Status</th>
                        {isAdminView && <th className="px-6 py-4 text-center">Actions</th>}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                    {orders.map((order) => {
                        const isLockedByMe = order.checkedBy === currentUser?.id;
                        const isLockedByOthers = order.checkedBy && order.checkedBy !== currentUser?.id;
                        const isExpanded = expandedOrderId === order.id;
                        const hasLifecycle = order.lifecycle && order.lifecycle.length > 0;

                        return (
                            <Fragment key={order.id}>
                                <tr
                                    className={`hover:bg-gray-800/50 transition-colors ${isAdminView ? '' : 'cursor-pointer'}`}
                                    onClick={() => {
                                        if (isAdminView) return;

                                        if (order.status === 'ORDER_CREATED') {
                                            window.location.href = `/users/payment/${order.id}`;
                                        } else {
                                            window.location.href = `/users/orders/${order.id}`;
                                        }
                                    }}
                                >
                                    {isAdminView && (
                                        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                            {hasLifecycle && (
                                                <button
                                                    onClick={() => toggleExpanded(order.id)}
                                                    className="text-gray-400 hover:text-white transition-colors"
                                                >
                                                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                </button>
                                            )}
                                        </td>
                                    )}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {format(new Date(order.createdAt), "MMM d, yyyy h:mm a")}
                                    </td>
                                    <td className="px-6 py-4 font-mono text-xs text-gray-400 break-all max-w-[150px]">
                                        {order.paymentQrId}
                                    </td>
                                    {isAdminView && (
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {order.user?.picture ? (
                                                    <img src={order.user.picture} alt="" className="w-8 h-8 rounded-full bg-gray-800 object-cover" />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center text-xs font-bold">
                                                        {order.user?.name?.[0] || "U"}
                                                    </div>
                                                )}
                                                <div className="flex flex-col">
                                                    <span className="text-white font-medium">{order.user?.name || "Unknown"}</span>
                                                    <span className="text-xs text-gray-500">{order.user?.email || "-"}</span>
                                                    {order.user?.phoneNumber && (
                                                        <span className="text-xs text-blue-400 font-mono">{order.user.phoneNumber}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                    )}
                                    <td className="px-6 py-4 font-mono text-xs text-gray-300">
                                        {order.id}
                                    </td>
                                    <td className="px-6 py-4">
                                        {order.nexaAddress ? (
                                            <div className="flex items-center gap-2 group">
                                                <span className="text-xs font-mono text-gray-400 break-all max-w-[200px] line-clamp-1">
                                                    {order.nexaAddress}
                                                </span>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigator.clipboard.writeText(order.nexaAddress!);
                                                    }}
                                                    className="opacity-0 group-hover:opacity-100 p-1 bg-gray-700 hover:bg-gray-600 rounded transition-opacity"
                                                    title="Copy Address"
                                                >
                                                    <Check size={10} className="text-gray-300" />
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-gray-600">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 font-mono text-xs">
                                        {order.transactionId ? order.transactionId : <span className="text-gray-600">-</span>}
                                    </td>
                                    <td className="px-6 py-4 text-right font-medium text-red-500">
                                        ₹{order.amountINR.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-6 py-4 text-right text-green-500 font-medium">
                                        {formatNexaAmount(order.nexaAmount)}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            {isAdminView && order.paymentFailureReason && (
                                                <div className="text-red-500 animate-pulse" title="Payment Failed - Needs Attention">
                                                    <AlertTriangle size={16} />
                                                </div>
                                            )}
                                            <StatusBadge status={order.status} />
                                        </div>
                                    </td>
                                    {isAdminView && (
                                        <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex justify-center gap-2 flex-wrap">
                                                {/* Check button - show if not locked OR if superadmin */}
                                                {order.status === "VERIFICATION_PENDING" && (!isLockedByOthers || isSuperAdmin) && !isLockedByMe && (
                                                    <button
                                                        onClick={() => onCheck?.(order.id)}
                                                        className="p-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors relative"
                                                        title={isSuperAdmin && isLockedByOthers ? "SUPERADMIN Override" : "Start Checking"}
                                                    >
                                                        <Check size={16} />
                                                        {isSuperAdmin && isLockedByOthers && (
                                                            <ShieldCheck size={10} className="absolute -top-1 -right-1 text-purple-400" />
                                                        )}
                                                    </button>
                                                )}

                                                {/* Approve/Reject buttons - show if locked by me OR if superadmin */}
                                                {(order.status === "VERIFYING" || order.status === "VERIFICATION_PENDING") && (isLockedByMe || (isSuperAdmin && isLockedByOthers)) && (
                                                    <>
                                                        <button
                                                            onClick={() => onDecision?.(order.id, 'APPROVE')}
                                                            className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors relative"
                                                            title={isSuperAdmin && !isLockedByMe ? "SUPERADMIN Approve (Override)" : "Approve"}
                                                        >
                                                            <ThumbsUp size={16} />
                                                            {isSuperAdmin && !isLockedByMe && (
                                                                <ShieldCheck size={10} className="absolute -top-1 -right-1 text-purple-400" />
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={() => onDecision?.(order.id, 'REJECT')}
                                                            className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors relative"
                                                            title={isSuperAdmin && !isLockedByMe ? "SUPERADMIN Reject (Override)" : "Reject"}
                                                        >
                                                            <ThumbsDown size={16} />
                                                            {isSuperAdmin && !isLockedByMe && (
                                                                <ShieldCheck size={10} className="absolute -top-1 -right-1 text-purple-400" />
                                                            )}
                                                        </button>
                                                    </>
                                                )}

                                                {/* Locked by others indicator - hide for superadmin */}
                                                {isLockedByOthers && !isSuperAdmin && (order.status === "VERIFYING" || order.status === "VERIFICATION_PENDING") && (
                                                    <div className="flex items-center gap-1 text-xs text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded-full">
                                                        <Lock size={12} />
                                                        <span>Checking...</span>
                                                    </div>
                                                )}

                                                {/* Completed states */}
                                                {/* Completed states */}
                                                {order.status === "RELEASE_PAYMENT" && (
                                                    <span className="text-xs text-emerald-500">Completed</span>
                                                )}
                                                {order.status === "ADMIN_APPROVED" && (
                                                    <span className="text-xs text-orange-400">Transfer Pending</span>
                                                )}
                                                {order.status === "REJECTED" && (
                                                    <span className="text-xs text-red-500">Rejected</span>
                                                )}

                                                {/* Retry Button */}
                                                {order.paymentFailureReason && (
                                                    <button
                                                        onClick={(e) => handleReprocess(e, order.id)}
                                                        disabled={!!processingId}
                                                        className="p-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors relative disabled:opacity-50"
                                                        title={`Retry Payment (${order.paymentFailureReason})`}
                                                    >
                                                        <RefreshCw size={16} className={processingId === order.id ? "animate-spin" : ""} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                                {/* Expandable lifecycle row */}
                                {isAdminView && isExpanded && (
                                    <tr key={`${order.id}-lifecycle`} className="bg-[#0a0b0f]">
                                        <td colSpan={11} className="px-6 py-0">
                                            <div className="p-4 bg-black/20 rounded-b-xl border-x border-b border-gray-800/30">
                                                <LifecycleViewer lifecycle={order.lifecycle} orderUserId={order.userId} />
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </Fragment>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

"use client";

import { format } from "date-fns";
import { formatNexaAmount } from "@/lib/utils/format";
import StatusBadge from "@/components/ui/StatusBadge";
import { Coins, Check, ThumbsUp, ThumbsDown, Lock, ChevronDown, ChevronUp, ShieldCheck, AlertTriangle, RefreshCw } from "lucide-react";
import { Order } from "@/types/order";
import { User } from "@prisma/client";
import { useState } from "react";
import LifecycleViewer from "./LifecycleViewer";

interface LedgerListProps {
    orders: Order[];
    currentUser?: User | null;
    onCheck?: (orderId: string) => void;
    onDecision?: (orderId: string, decision: 'APPROVE' | 'REJECT', reason?: string) => void;
    onReprocess?: (orderId: string) => void;
}

export default function LedgerList({ orders, currentUser, onCheck, onDecision, onReprocess }: LedgerListProps) {
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
        <div className="flex flex-col gap-2 px-4 md:px-0">
            {orders.map((order) => {
                const isLockedByMe = order.checkedBy === currentUser?.id;
                const isLockedByOthers = order.checkedBy && order.checkedBy !== currentUser?.id;
                const isExpanded = expandedOrderId === order.id;
                const hasLifecycle = order.lifecycle && order.lifecycle.length > 0;

                const handleCardClick = (e: React.MouseEvent) => {
                    // Prevent navigation if clicking on buttons or expanded content
                    if ((e.target as HTMLElement).closest('button')) return;

                    // Disable navigation for admins
                    if (isAdminView) return;

                    if (order.status === 'ORDER_CREATED') {
                        window.location.href = `/users/payment/${order.id}`;
                    } else {
                        window.location.href = `/users/orders/${order.id}`;
                    }
                };

                return (
                    <div
                        key={order.id}
                        onClick={handleCardClick}
                        className={`bg-[#1a1b23] border border-gray-800 rounded-xl p-3 space-y-1.5 shadow-sm hover:shadow-md hover:border-gray-700 active:scale-[0.99] transition-all ${isAdminView ? '' : 'cursor-pointer'}`}
                    >


                        {/* Admin View: User Details */}
                        {isAdminView && order.user && (
                            <div className="flex items-center gap-3 pb-3 border-b border-gray-800">
                                {order.user.picture ? (
                                    <img
                                        src={order.user.picture}
                                        alt={order.user.name || "User"}
                                        className="w-10 h-10 rounded-full bg-gray-700 object-cover"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-400">
                                        {(order.user.name?.[0] || "U").toUpperCase()}
                                    </div>
                                )}
                                <div className="min-w-0">
                                    <div className="text-sm font-medium text-white truncate">{order.user.name || "Unknown User"}</div>
                                    <div className="text-xs text-gray-500 truncate">{order.user.email}</div>
                                    {order.user.phoneNumber && (
                                        <div className="text-xs text-blue-400 mt-0.5">{order.user.phoneNumber}</div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Amount and Status */}
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="text-red-500 font-medium text-sm md:text-base">- ₹{order.amountINR.toFixed(2)}</div>
                                <div className="text-[10px] md:text-xs text-gray-500 mt-0.5">
                                    {format(new Date(order.createdAt), "MMM d, h:mm a")}
                                </div>
                            </div>
                            <div className="scale-90 origin-right">
                                <div className="flex items-center gap-2">
                                    {isAdminView && order.paymentFailureReason && (
                                        <div className="text-red-500 animate-pulse" title="Payment Failed - Needs Attention">
                                            <AlertTriangle size={14} />
                                        </div>
                                    )}
                                    <StatusBadge status={order.status} />
                                </div>
                            </div>
                        </div>

                        {/* Nexa Amount */}
                        <div className="flex justify-between items-center text-xs bg-[#0f1016] p-1.5 rounded-md border border-gray-800/50">
                            <span className="text-gray-400 flex items-center gap-1">
                                <Coins size={10} /> Nexa
                            </span>
                            <span className="text-green-500 font-mono font-medium">+ {formatNexaAmount(order.nexaAmount)}</span>
                        </div>

                        {/* Order ID */}
                        <div className="text-xs font-mono text-gray-500 break-all">
                            Order: {order.id}
                        </div>

                        {/* Transaction ID */}
                        {order.transactionId && (
                            <div className="text-xs font-mono text-gray-500 truncate">
                                Tx: {order.transactionId}
                            </div>
                        )}

                        {/* Payment Method (UPI) */}
                        <div className="text-xs font-mono text-gray-500 break-all">
                            Paid Via: <span className="text-gray-400">{order.paymentQrId}</span>
                        </div>

                        {/* Nexa Address (Destination) */}
                        {order.nexaAddress && (
                            <div className="bg-[#0f1016]/50 p-2.5 rounded-xl border border-gray-800/50 space-y-1">
                                <label className="text-[10px] font-medium text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                                    <ShieldCheck size={10} className="text-blue-500" />
                                    Frozen Destination
                                </label>
                                <div className="flex items-start gap-2">
                                    <span className="text-xs font-mono text-gray-300 break-all flex-1 line-clamp-2 leading-relaxed">
                                        {order.nexaAddress}
                                    </span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigator.clipboard.writeText(order.nexaAddress!);
                                        }}
                                        className="p-1 px-2 bg-gray-800 hover:bg-gray-700 rounded text-[10px] text-gray-400 transition-colors"
                                    >
                                        Copy
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Admin Actions */}
                        {isAdminView && (
                            <div className="pt-3 border-t border-gray-800 space-y-2">
                                {/* Check Button */}
                                {order.status === "VERIFICATION_PENDING" && (!isLockedByOthers || isSuperAdmin) && !isLockedByMe && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onCheck?.(order.id); }}
                                        className="w-full flex items-center justify-center gap-2 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 px-4 py-2 rounded-lg transition-colors relative"
                                    >
                                        <Check size={16} />
                                        {isSuperAdmin && isLockedByOthers ? "SUPERADMIN Override Check" : "Start Checking"}
                                        {isSuperAdmin && isLockedByOthers && (
                                            <ShieldCheck size={14} className="absolute top-1 right-1 text-purple-400" />
                                        )}
                                    </button>
                                )}

                                {/* Approve/Reject Buttons */}
                                {(order.status === "VERIFYING" || order.status === "VERIFICATION_PENDING") && (isLockedByMe || (isSuperAdmin && isLockedByOthers)) && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onDecision?.(order.id, 'APPROVE'); }}
                                            className="flex-1 flex items-center justify-center gap-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 px-4 py-2 rounded-lg transition-colors relative"
                                        >
                                            <ThumbsUp size={16} />
                                            Approve
                                            {isSuperAdmin && !isLockedByMe && (
                                                <ShieldCheck size={14} className="absolute top-1 right-1 text-purple-400" />
                                            )}
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onDecision?.(order.id, 'REJECT'); }}
                                            className="flex-1 flex items-center justify-center gap-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 px-4 py-2 rounded-lg transition-colors relative"
                                        >
                                            <ThumbsDown size={16} />
                                            Reject
                                            {isSuperAdmin && !isLockedByMe && (
                                                <ShieldCheck size={14} className="absolute top-1 right-1 text-purple-400" />
                                            )}
                                        </button>
                                    </div>
                                )}

                                {/* Locked by Others */}
                                {isLockedByOthers && !isSuperAdmin && (order.status === "VERIFYING" || order.status === "VERIFICATION_PENDING") && (
                                    <div className="flex items-center justify-center gap-2 text-sm text-yellow-500 bg-yellow-500/10 px-4 py-2 rounded-lg">
                                        <Lock size={14} />
                                        Checking by another admin...
                                    </div>
                                )}

                                {/* Completed States */}
                                {/* Completed States */}
                                {order.status === "RELEASE_PAYMENT" && (
                                    <div className="text-center text-sm text-emerald-500">Completed</div>
                                )}
                                {order.status === "ADMIN_APPROVED" && (
                                    <div className="text-center text-sm text-orange-400">Transfer Pending</div>
                                )}
                                {order.status === "REJECTED" && (
                                    <div className="text-center text-sm text-red-500">Rejected</div>
                                )}

                                {/* Payment Failed - Retry Option */}
                                {order.paymentFailureReason && (
                                    <div className="space-y-2">
                                        <div className="bg-orange-500/10 rounded-lg p-3 text-xs text-orange-400 flex gap-2">
                                            <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                                            <span>{order.paymentFailureReason}</span>
                                        </div>
                                        <button
                                            onClick={(e) => handleReprocess(e, order.id)}
                                            disabled={!!processingId}
                                            className="w-full py-2 bg-blue-600/10 text-blue-500 rounded-lg text-sm font-medium hover:bg-blue-600/20 flex justify-center items-center gap-2 transition-colors disabled:opacity-50"
                                        >
                                            <RefreshCw size={14} className={processingId === order.id ? "animate-spin" : ""} />
                                            Retry Payment
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Lifecycle Viewer Toggle */}
                        {isAdminView && hasLifecycle && (
                            <>
                                <button
                                    onClick={(e) => { e.stopPropagation(); toggleExpanded(order.id); }}
                                    className="w-full flex items-center justify-center gap-2 text-gray-500 hover:text-white text-xs py-1 transition-colors"
                                >
                                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                    {isExpanded ? "Hide" : "View"} Order History
                                </button>
                                {isExpanded && (
                                    <div className="pt-2 border-t border-gray-800" onClick={(e) => e.stopPropagation()}>
                                        <LifecycleViewer lifecycle={order.lifecycle} orderUserId={order.userId} />
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

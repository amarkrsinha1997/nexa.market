"use client";

import { format } from "date-fns";
import { formatNexaAmount } from "@/lib/utils/format";
import StatusBadge from "@/components/ui/StatusBadge";
import { Coins, Check, ThumbsUp, ThumbsDown, Lock, ChevronDown, ChevronUp, ShieldCheck } from "lucide-react";
import { Order } from "@/types/order";
import { User } from "@/lib/api/auth";
import { useState } from "react";
import LifecycleViewer from "./LifecycleViewer";

interface LedgerListProps {
    orders: Order[];
    currentUser?: User | null;
    onCheck?: (orderId: string) => void;
    onDecision?: (orderId: string, decision: 'APPROVE' | 'REJECT', reason?: string) => void;
}

export default function LedgerList({ orders, currentUser, onCheck, onDecision }: LedgerListProps) {
    const isAdminView = !!currentUser && (currentUser.role === 'ADMIN' || currentUser.role === 'SUPERADMIN');
    const isSuperAdmin = currentUser?.role === 'SUPERADMIN';
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

    const toggleExpanded = (orderId: string) => {
        setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
    };

    return (
        <div className="md:hidden space-y-4 px-4">
            {orders.map((order) => {
                const isLockedByMe = order.checkedBy === currentUser?.userId;
                const isLockedByOthers = order.checkedBy && order.checkedBy !== currentUser?.userId;
                const isExpanded = expandedOrderId === order.id;
                const hasLifecycle = order.lifecycle && order.lifecycle.length > 0;

                const handleCardClick = (e: React.MouseEvent) => {
                    // Prevent navigation if clicking on buttons or expanded content
                    if ((e.target as HTMLElement).closest('button')) return;

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
                        className="bg-[#1a1b23] border border-gray-800 rounded-2xl p-4 space-y-3 shadow-lg active:scale-[0.98] transition-transform cursor-pointer"
                    >


                        {/* Amount and Status */}
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="text-red-500 font-medium text-base">- ₹{order.amountINR.toFixed(2)}</div>
                                <div className="text-xs text-gray-500 mt-1">
                                    {format(new Date(order.createdAt), "MMM d, yyyy h:mm a")}
                                </div>
                            </div>
                            <StatusBadge status={order.status} />
                        </div>

                        {/* Nexa Amount */}
                        <div className="flex justify-between items-center text-sm bg-[#0f1016] p-3 rounded-lg border border-gray-800/50">
                            <span className="text-gray-400 flex items-center gap-1">
                                <Coins size={12} /> Nexa
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
                                {["ADMIN_APPROVED", "RELEASE_PAYMENT"].includes(order.status) && (
                                    <div className="text-center text-sm text-emerald-500">Completed</div>
                                )}
                                {order.status === "REJECTED" && (
                                    <div className="text-center text-sm text-red-500">Rejected</div>
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
                                        <LifecycleViewer lifecycle={order.lifecycle} />
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

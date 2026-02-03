import { format } from "date-fns";
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

                return (
                    <div key={order.id} className="bg-[#1a1b23] border border-gray-800 rounded-2xl p-4 space-y-3 shadow-lg">
                        {/* User Info (Admin View Only) */}
                        {isAdminView && order.user && (
                            <div className="flex items-center gap-3 pb-3 border-b border-gray-800">
                                {order.user.picture ? (
                                    <img src={order.user.picture} alt="" className="w-10 h-10 rounded-full bg-gray-800 object-cover" />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center text-sm font-bold">
                                        {order.user.name?.[0] || "U"}
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="text-white font-medium truncate">{order.user.name || "Unknown"}</div>
                                    <div className="text-xs text-gray-500 truncate">{order.user.email || "-"}</div>
                                    {order.user.phoneNumber && (
                                        <div className="text-xs text-blue-400 font-mono mt-0.5">{order.user.phoneNumber}</div>
                                    )}
                                </div>
                            </div>
                        )}

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
                            <span className="text-green-500 font-mono font-medium">+ {order.nexaAmount.toLocaleString(undefined, { maximumFractionDigits: 4 })}</span>
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

                        {/* Admin Actions */}
                        {isAdminView && (
                            <div className="pt-3 border-t border-gray-800 space-y-2">
                                {/* Check Button */}
                                {order.status === "VERIFICATION_PENDING" && (!isLockedByOthers || isSuperAdmin) && !isLockedByMe && (
                                    <button
                                        onClick={() => onCheck?.(order.id)}
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
                                            onClick={() => onDecision?.(order.id, 'APPROVE')}
                                            className="flex-1 flex items-center justify-center gap-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 px-4 py-2 rounded-lg transition-colors relative"
                                        >
                                            <ThumbsUp size={16} />
                                            Approve
                                            {isSuperAdmin && !isLockedByMe && (
                                                <ShieldCheck size={14} className="absolute top-1 right-1 text-purple-400" />
                                            )}
                                        </button>
                                        <button
                                            onClick={() => onDecision?.(order.id, 'REJECT')}
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
                                {["VERIFIED", "ADMIN_APPROVED", "RELEASE_PAYMENT", "PAYMENT_SUCCESS"].includes(order.status) && (
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
                                    onClick={() => toggleExpanded(order.id)}
                                    className="w-full flex items-center justify-center gap-2 text-gray-400 hover:text-white text-sm py-2 transition-colors"
                                >
                                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                    {isExpanded ? "Hide" : "View"} Order History
                                </button>
                                {isExpanded && (
                                    <div className="pt-2 border-t border-gray-800">
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

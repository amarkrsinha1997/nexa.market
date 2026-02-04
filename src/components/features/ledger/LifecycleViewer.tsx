import { LifecycleEvent } from "@/types/order";
import { format } from "date-fns";
import { Check, ThumbsUp, ThumbsDown, ShieldCheck, AlertTriangle, FileText, CheckCircle } from "lucide-react";

interface LifecycleViewerProps {
    lifecycle?: LifecycleEvent[];
}

export default function LifecycleViewer({ lifecycle }: LifecycleViewerProps) {
    if (!lifecycle || lifecycle.length === 0) {
        return (
            <div className="text-sm text-gray-500 py-4 text-center">
                No lifecycle events recorded
            </div>
        );
    }

    const getActionIcon = (action: string) => {
        switch (action) {
            case 'CHECK':
                return <Check size={16} className="text-blue-500" />;
            case 'APPROVE':
                return <ThumbsUp size={16} className="text-emerald-500" />;
            case 'REJECT':
                return <ThumbsDown size={16} className="text-red-500" />;
            case 'RELEASE_PAYMENT':
            case 'PAYMENT_RETRY_SUCCESS':
                return <ShieldCheck size={16} className="text-emerald-400" />;
            case 'PAYMENT_ATTEMPT_FAILED':
            case 'PAYMENT_RETRY_FAILED':
                return <AlertTriangle size={16} className="text-amber-500" />;
            case 'ORDER_CREATED':
                return <FileText size={16} className="text-gray-400" />;
            case 'PAYMENT_CONFIRMED':
                return <CheckCircle size={16} className="text-blue-400" />;
            default:
                return null;
        }
    };

    const getActionColor = (action: string) => {
        switch (action) {
            case 'CHECK':
                return 'bg-blue-500/10 border-blue-500/30';
            case 'APPROVE':
                return 'bg-emerald-500/10 border-emerald-500/30';
            case 'REJECT':
                return 'bg-red-500/10 border-red-500/30';
            case 'RELEASE_PAYMENT':
            case 'PAYMENT_RETRY_SUCCESS':
                return 'bg-emerald-900/20 border-emerald-500/30';
            case 'PAYMENT_ATTEMPT_FAILED':
            case 'PAYMENT_RETRY_FAILED':
                return 'bg-amber-500/10 border-amber-500/30';
            case 'ORDER_CREATED':
                return 'bg-gray-800/30 border-gray-700/30';
            case 'PAYMENT_CONFIRMED':
                return 'bg-blue-900/20 border-blue-500/30';
            default:
                return 'bg-gray-500/10 border-gray-500/30';
        }
    };

    return (
        <div className="space-y-2 bg-[#0f1016] rounded-xl border border-gray-800/50">
            <div className="space-y-0divide-y divide-gray-800">
                {lifecycle.map((event, index) => (
                    <div
                        key={index}
                        className={`p-3 ${getActionColor(event.action)} first:rounded-t-xl last:rounded-b-xl`}
                    >
                        <div className="flex items-start gap-3">
                            {/* Admin Avatar */}
                            <div className="flex-shrink-0 mt-1">
                                {event.actorPicture ? (
                                    <img
                                        src={event.actorPicture}
                                        alt=""
                                        className="w-8 h-8 rounded-full bg-gray-800 object-cover"
                                    />
                                ) : (
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${event.actorId === 'SYSTEM' ? 'bg-purple-500/20 text-purple-500' : 'bg-blue-500/20 text-blue-500'}`}>
                                        {event.actorName?.[0] || (event.actorId === 'SYSTEM' ? "S" : "A")}
                                    </div>
                                )}
                            </div>

                            {/* Event Details */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    {getActionIcon(event.action)}
                                    <span className="text-sm font-medium text-white">
                                        {event.actorName || "Unknown Admin"}
                                    </span>
                                    {event.isSuperadminOverride && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 text-xs font-semibold">
                                            <ShieldCheck size={12} />
                                            SUPERADMIN
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 mb-1">{event.actorEmail}</p>
                                <p className="text-sm text-gray-300">
                                    {event.action === 'CHECK' && 'Started checking order'}
                                    {event.action === 'APPROVE' && 'Approved order'}
                                    {event.action === 'REJECT' && 'Rejected order'}
                                    {event.action === 'RELEASE_PAYMENT' && 'Payment Released Successfully'}
                                    {event.action === 'PAYMENT_RETRY_SUCCESS' && 'Payment Retry Successful'}
                                    {event.action === 'PAYMENT_ATTEMPT_FAILED' && 'Payment Attempt Failed'}
                                    {event.action === 'PAYMENT_RETRY_FAILED' && 'Payment Retry Failed'}
                                    {event.action === 'ORDER_CREATED' && 'Order Created'}
                                    {event.action === 'PAYMENT_CONFIRMED' && 'Payment Confirmed by User'}
                                </p>
                                {event.note && (
                                    <div className="mt-1 p-2 bg-black/20 rounded border border-white/5 text-xs text-gray-400 italic break-words whitespace-pre-wrap">
                                        Note: {event.note}
                                    </div>
                                )}
                                {event.recipientAddress && (
                                    <div className="mt-1 text-xs font-mono text-gray-500 break-all">
                                        To: {event.recipientAddress}
                                    </div>
                                )}
                                {event.txHash && (
                                    <div className="mt-1 text-xs font-mono text-blue-400 break-all">
                                        Tx: {event.txHash}
                                    </div>
                                )}
                                <p className="text-xs text-gray-600 mt-2">
                                    {format(new Date(event.timestamp), "MMM d, yyyy h:mm a")}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

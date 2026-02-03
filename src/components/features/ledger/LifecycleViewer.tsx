import { LifecycleEvent } from "@/types/order";
import { format } from "date-fns";
import { Check, ThumbsUp, ThumbsDown, ShieldCheck } from "lucide-react";

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
            default:
                return 'bg-gray-500/10 border-gray-500/30';
        }
    };

    return (
        <div className="space-y-2 py-3 px-4 bg-[#0f1016] rounded-xl border border-gray-800/50">
            <div className="space-y-2">
                {lifecycle.map((event, index) => (
                    <div
                        key={index}
                        className={`border rounded-lg p-3 ${getActionColor(event.action)}`}
                    >
                        <div className="flex items-start gap-3">
                            {/* Admin Avatar */}
                            <div className="flex-shrink-0">
                                {event.actorPicture ? (
                                    <img
                                        src={event.actorPicture}
                                        alt=""
                                        className="w-8 h-8 rounded-full bg-gray-800 object-cover"
                                    />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center text-xs font-bold">
                                        {event.actorName?.[0] || "A"}
                                    </div>
                                )}
                            </div>

                            {/* Event Details */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
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
                                </p>
                                {event.note && (
                                    <p className="text-xs text-gray-400 mt-1 italic">
                                        Note: {event.note}
                                    </p>
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

"use client";

import { formatDistanceToNow } from "date-fns";

interface LifecycleEvent {
    status: string;
    timestamp: string;
    actorId?: string;
    actorName?: string;
    actorEmail?: string;
    action: string;
    note?: string;
    txHash?: string;
    recipientAddress?: string;
    bulkRetry?: boolean;
}

interface OrderLifecycleProps {
    lifecycle: LifecycleEvent[];
}

export function OrderLifecycle({ lifecycle }: OrderLifecycleProps) {
    if (!lifecycle || lifecycle.length === 0) {
        return (
            <div className="text-sm text-gray-500 dark:text-gray-400">
                No lifecycle events recorded
            </div>
        );
    }

    const getEventIcon = (action: string) => {
        switch (action) {
            case 'APPROVE':
                return '✅';
            case 'REJECT':
                return '❌';
            case 'RELEASE_PAYMENT':
            case 'PAYMENT_RETRY_SUCCESS':
                return '💰';
            case 'PAYMENT_ATTEMPT_FAILED':
            case 'PAYMENT_RETRY_FAILED':
                return '⚠️';
            default:
                return '📌';
        }
    };

    const getEventColor = (action: string) => {
        switch (action) {
            case 'APPROVE':
            case 'RELEASE_PAYMENT':
            case 'PAYMENT_RETRY_SUCCESS':
                return 'text-green-600 dark:text-green-400';
            case 'REJECT':
                return 'text-red-600 dark:text-red-400';
            case 'PAYMENT_ATTEMPT_FAILED':
            case 'PAYMENT_RETRY_FAILED':
                return 'text-orange-600 dark:text-orange-400';
            default:
                return 'text-gray-600 dark:text-gray-400';
        }
    };

    return (
        <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                Order Timeline
            </h3>
            <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

                {/* Events */}
                <div className="space-y-6">
                    {lifecycle.map((event, index) => (
                        <div key={index} className="relative flex gap-4">
                            {/* Icon */}
                            <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700">
                                <span className="text-lg">{getEventIcon(event.action)}</span>
                            </div>

                            {/* Content */}
                            <div className="flex-1 pb-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <p className={`text-sm font-medium ${getEventColor(event.action)}`}>
                                            {event.action.replace(/_/g, ' ')}
                                            {event.bulkRetry && ' (Bulk Retry)'}
                                        </p>
                                        {event.actorName && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                by {event.actorName}
                                            </p>
                                        )}
                                        {event.note && (
                                            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                                                {event.note}
                                            </p>
                                        )}
                                        {event.recipientAddress && (
                                            <p className="mt-1 text-xs font-mono text-gray-600 dark:text-gray-400">
                                                To: {event.recipientAddress.slice(0, 20)}...{event.recipientAddress.slice(-10)}
                                            </p>
                                        )}
                                        {event.txHash && (
                                            <p className="mt-1 text-xs font-mono text-blue-600 dark:text-blue-400">
                                                TX: {event.txHash.slice(0, 20)}...{event.txHash.slice(-10)}
                                            </p>
                                        )}
                                    </div>
                                    <time className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                        {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                                    </time>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

import { BadgeCheck, Clock, XCircle, MoreHorizontal, Lock as LockIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Enum matching Prisma Schema (roughly)
export type OrderStatus =
    | "ORDER_CREATED"
    | "VERIFICATION_PENDING"
    | "VERIFYING"
    | "ADMIN_APPROVED"
    | "REJECTED"
    | "RELEASE_PAYMENT";

const statusConfig: Record<OrderStatus, { color: string; icon: any; label: string }> = {
    ORDER_CREATED: {
        color: "bg-gray-800 text-gray-400 border-gray-700",
        icon: MoreHorizontal,
        label: "Created"
    },
    VERIFICATION_PENDING: {
        color: "bg-yellow-900/30 text-yellow-400 border-yellow-900/50",
        icon: Clock,
        label: "Verifying"
    },
    VERIFYING: {
        color: "bg-purple-900/30 text-purple-400 border-purple-900/50",
        icon: LockIcon,
        label: "Locked"
    },
    ADMIN_APPROVED: {
        color: "bg-green-900/30 text-green-400 border-green-900/50",
        icon: BadgeCheck,
        label: "Approved"
    },
    REJECTED: {
        color: "bg-red-900/30 text-red-400 border-red-900/50",
        icon: XCircle,
        label: "Rejected"
    },
    RELEASE_PAYMENT: {
        color: "bg-green-500/20 text-green-400 border-green-500/50",
        icon: BadgeCheck,
        label: "Released"
    }
};

interface StatusBadgeProps {
    status: string; // string to be safe coming from API
    className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
    const config = statusConfig[status as OrderStatus] || {
        color: "bg-gray-800 text-gray-400 border-gray-700",
        icon: MoreHorizontal,
        label: status
    };

    const Icon = config.icon;

    return (
        <span className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
            config.color,
            className
        )}>
            <Icon size={12} />
            {config.label}
        </span>
    );
}

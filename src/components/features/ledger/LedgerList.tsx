import { format } from "date-fns";
import StatusBadge from "@/components/ui/StatusBadge";
import { Coins } from "lucide-react";
import { Order } from "@/types/order";

interface LedgerListProps {
    orders: Order[];
}

export default function LedgerList({ orders }: LedgerListProps) {
    return (
        <div className="md:hidden divide-y divide-gray-800">
            {orders.map((order) => (
                <div key={order.id} className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="text-white font-medium text-base">₹{order.amountINR.toFixed(2)}</div>
                            <div className="text-xs text-gray-500 mt-1">
                                {format(new Date(order.createdAt), "MMM d, yyyy h:mm a")}
                            </div>
                        </div>
                        <StatusBadge status={order.status} />
                    </div>
                    <div className="flex justify-between items-center text-sm bg-[#0f1016] p-3 rounded-lg border border-gray-800/50">
                        <span className="text-gray-400 flex items-center gap-1">
                            <Coins size={12} /> Nexa
                        </span>
                        <span className="text-blue-400 font-mono font-medium">{order.nexaAmount.toFixed(4)}</span>
                    </div>
                    {order.transactionId && (
                        <div className="text-xs font-mono text-gray-500 truncate">
                            Tx: {order.transactionId}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

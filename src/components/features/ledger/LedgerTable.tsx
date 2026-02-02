import { Order } from "@/types/order";
import { format } from "date-fns";
import StatusBadge from "@/components/ui/StatusBadge";

interface LedgerTableProps {
    orders: Order[];
}

export default function LedgerTable({ orders }: LedgerTableProps) {
    return (
        <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-400">
                <thead className="bg-[#0f1016] text-gray-300 uppercase tracking-wilder text-xs font-semibold">
                    <tr>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Transaction ID</th>
                        <th className="px-6 py-4 text-right">Amount (INR)</th>
                        <th className="px-6 py-4 text-right">Nexa</th>
                        <th className="px-6 py-4 text-center">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                    {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-800/50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                                {format(new Date(order.createdAt), "MMM d, yyyy h:mm a")}
                            </td>
                            <td className="px-6 py-4 font-mono text-xs">
                                {order.transactionId || "-"}
                            </td>
                            <td className="px-6 py-4 text-right font-medium text-white">
                                ₹{order.amountINR.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 text-right text-blue-400 font-medium">
                                {order.nexaAmount.toFixed(4)}
                            </td>
                            <td className="px-6 py-4 text-center">
                                <StatusBadge status={order.status} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

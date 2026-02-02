export default function UserDashboard() {
    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6 text-slate-800 dark:text-white">My Portfolio</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-xl shadow-lg text-white">
                    <h3 className="text-sm font-medium opacity-90 mb-1">Total Balance</h3>
                    <p className="text-4xl font-bold">$12,450.00</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
                    <ul className="space-y-3">
                        <li className="flex justify-between items-center text-sm">
                            <span>Bought ETH</span>
                            <span className="font-medium text-green-500">+1.2 ETH</span>
                        </li>
                        <li className="flex justify-between items-center text-sm">
                            <span>Sold BTC</span>
                            <span className="font-medium text-red-500">-0.05 BTC</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

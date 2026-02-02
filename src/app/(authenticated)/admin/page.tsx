export default function AdminDashboard() {
    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6 text-slate-800 dark:text-white">Admin Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <h3 className="text-sm font-medium text-slate-500 mb-2">Total Users</h3>
                    <p className="text-3xl font-bold">1,234</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <h3 className="text-sm font-medium text-slate-500 mb-2">Revenue</h3>
                    <p className="text-3xl font-bold">$45,200</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <h3 className="text-sm font-medium text-slate-500 mb-2">Active Sessions</h3>
                    <p className="text-3xl font-bold">89</p>
                </div>
            </div>
        </div>
    );
}

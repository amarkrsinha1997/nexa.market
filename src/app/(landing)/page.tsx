import Link from "next/link";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-slate-900 text-white">
            <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 text-transparent bg-clip-text">
                    Nexa Market
                </h1>
                <div className="space-x-4">
                    <Link href="/login" className="hover:text-blue-400 transition">Login</Link>
                    <Link href="/admin" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition">
                        Admin Demo
                    </Link>
                </div>
            </nav>

            <main className="flex flex-col items-center justify-center h-[80vh] text-center px-4">
                <h2 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
                    The Future of <br />
                    <span className="text-blue-500">DeFi Trading</span>
                </h2>
                <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-10">
                    Experience lightning-fast swaps, deep liquidity, and secure asset management.
                    Join the revolution today.
                </p>
                <div className="flex gap-4">
                    <Link href="/user" className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8 py-3 rounded-xl transition shadow-lg shadow-emerald-500/20">
                        Get Started
                    </Link>
                    <button className="border border-slate-700 hover:border-slate-500 px-8 py-3 rounded-xl transition">
                        Learn More
                    </button>
                </div>
            </main>

            <footer className="text-center py-10 text-slate-600 border-t border-slate-800">
                <p>&copy; 2026 Nexa Market. All rights reserved.</p>
            </footer>
        </div>
    );
}

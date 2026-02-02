'use client';

import { useRouter } from 'next/navigation';
// Using inline SVGs or Lucide icons if not available, but user had react-icons in reference
// Minimal implementation without external icon libs if possible, or assume react-icons is there?
// nexa.market package.json did NOT list react-icons. So I will use Lucide or just text/emoji for now to be safe, or inline SVG.
// Assuming this is a modern project, creating simple SVGs.

function UserIcon({ className }: { className?: string }) {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    );
}

function ShieldIcon({ className }: { className?: string }) {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
    );
}

interface RoleSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function RoleSelectionModal({ isOpen, onClose }: RoleSelectionModalProps) {
    const router = useRouter();

    if (!isOpen) return null;

    const handleRoleSelect = (role: 'user' | 'admin') => {
        // Demo: Store role in localStorage
        localStorage.setItem('userRole', role);
        localStorage.setItem('isAuthenticated', 'true');

        // Redirect based on role
        if (role === 'user') {
            router.push('/users/home');
        } else {
            router.push('/admin/users-team');
        }

        onClose();
    };

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-[5px]" onClick={onClose}>
            <div
                className="w-[90%] max-w-[450px] overflow-hidden rounded-[20px] border border-[#5b4bff]/20 bg-gradient-to-br from-[#1a1a2e] to-[#16213e] p-10 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="mb-2 text-center text-[1.75rem] font-semibold text-white">Select Your Role</h2>
                <p className="mb-8 text-center text-[0.95rem] text-[#a0a0a0]">
                    Choose how you want to sign in
                </p>

                <div className="flex flex-col gap-4">
                    <button
                        onClick={() => handleRoleSelect('user')}
                        className="group flex items-center gap-4 rounded-xl border-2 border-[#5b4bff]/30 bg-gradient-to-br from-[#2a2a3e] to-[#1f1f2e] p-5 text-[1.1rem] font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-[#5b4bff] hover:bg-gradient-to-br hover:from-[#5b4bff] hover:to-[#4a3de8] hover:shadow-[0_6px_20px_rgba(91,75,255,0.4)]"
                    >
                        <UserIcon className="h-8 w-8 text-white group-hover:text-white" />
                        <div className="flex flex-1 flex-col items-start">
                            <div className="text-lg font-semibold">User</div>
                            <div className="mt-1 text-sm text-[#a0a0a0] group-hover:text-white/80">Access user dashboard and wallet</div>
                        </div>
                    </button>

                    <button
                        onClick={() => handleRoleSelect('admin')}
                        className="group flex items-center gap-4 rounded-xl border-2 border-[#5b4bff]/30 bg-gradient-to-br from-[#2a2a3e] to-[#1f1f2e] p-5 text-[1.1rem] font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-[#5b4bff] hover:bg-gradient-to-br hover:from-[#5b4bff] hover:to-[#4a3de8] hover:shadow-[0_6px_20px_rgba(91,75,255,0.4)]"
                    >
                        <ShieldIcon className="h-8 w-8 text-white group-hover:text-white" />
                        <div className="flex flex-1 flex-col items-start">
                            <div className="text-lg font-semibold">Admin</div>
                            <div className="mt-1 text-sm text-[#a0a0a0] group-hover:text-white/80">Manage users and view reports</div>
                        </div>
                    </button>
                </div>

                <button
                    onClick={onClose}
                    className="mt-4 w-full rounded-xl border border-white/20 bg-transparent p-3.5 text-[0.95rem] text-[#a0a0a0] transition-all duration-300 hover:bg-white/5 hover:text-white"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}

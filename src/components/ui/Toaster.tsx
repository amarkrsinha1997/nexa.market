"use client";

import { useToast } from '@/lib/hooks/useToast';
import { CheckCircle2, XCircle, AlertTriangle, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Toaster() {
    const { toasts, removeToast } = useToast();

    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none">
            {toasts.map((toast) => (
                <ToastItem
                    key={toast.id}
                    id={toast.id}
                    message={toast.message}
                    type={toast.type}
                    onDismiss={removeToast}
                />
            ))}
        </div>
    );
}

interface ToastItemProps {
    id: string;
    message: string;
    type: 'success' | 'error' | 'warning';
    onDismiss: (id: string) => void;
}

function ToastItem({ id, message, type, onDismiss }: ToastItemProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Trigger animation on mount
        setTimeout(() => setIsVisible(true), 10);
    }, []);

    const handleDismiss = () => {
        setIsVisible(false);
        setTimeout(() => onDismiss(id), 300); // Wait for exit animation
    };

    const config = {
        success: {
            icon: CheckCircle2,
            bgColor: 'bg-emerald-500/10',
            borderColor: 'border-emerald-500/50',
            iconColor: 'text-emerald-500',
            textColor: 'text-emerald-100',
        },
        error: {
            icon: XCircle,
            bgColor: 'bg-red-500/10',
            borderColor: 'border-red-500/50',
            iconColor: 'text-red-500',
            textColor: 'text-red-100',
        },
        warning: {
            icon: AlertTriangle,
            bgColor: 'bg-yellow-500/10',
            borderColor: 'border-yellow-500/50',
            iconColor: 'text-yellow-500',
            textColor: 'text-yellow-100',
        },
    }[type];

    const Icon = config.icon;

    return (
        <div
            className={`
                pointer-events-auto
                flex items-start gap-3 
                min-w-[300px] max-w-[400px]
                px-4 py-3 rounded-xl border
                backdrop-blur-sm
                shadow-lg
                transition-all duration-300 ease-out
                ${config.bgColor} ${config.borderColor}
                ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}
            `}
            onClick={handleDismiss}
            role="alert"
        >
            <Icon className={`${config.iconColor} shrink-0 mt-0.5`} size={20} />
            <p className={`flex-1 text-sm font-medium ${config.textColor} leading-snug`}>
                {message}
            </p>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    handleDismiss();
                }}
                className={`${config.iconColor} hover:opacity-70 transition-opacity shrink-0`}
                aria-label="Dismiss"
            >
                <X size={16} />
            </button>
        </div>
    );
}

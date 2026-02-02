"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, X } from "lucide-react";
import { createPortal } from "react-dom";

export interface SelectOption {
    label: string;
    value: string | number;
}

interface CustomSelectProps {
    options: SelectOption[];
    value: string | number;
    onChange: (value: any) => void;
    placeholder?: string;
    className?: string;
}

export default function CustomSelect({ options, value, onChange, placeholder = "Select...", className }: CustomSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Use loose equality (String comparison) to ensure matches between number/strings work reliably
    const selectedOption = options.find(o => String(o.value) === String(value));

    // Click Outside - updated to not close when clicking portal content
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            const target = event.target as HTMLElement;

            // Don't close if clicking within the portal content
            if (target.closest('.custom-select-portal')) {
                return;
            }

            if (containerRef.current && !containerRef.current.contains(target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Portal for Mobile/Desktop to avoid z-index/overflow issues in tight containers (like Calendar)
    const DropdownContent = () => {
        if (!isOpen) return null;

        const content = (
            <div
                className="custom-select-portal fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 md:p-0"
                onClick={() => setIsOpen(false)}
            >
                {/* Mobile: Center Modal, Desktop: Absolute Position Logic (simplified here to Modal for consistency or using a positioning lib) 
                    For this calendar use case, a small absolute popover relative to the trigger is better for desktop.
                    However, getting absolute coordinates without a lib like Floating UI is tricky.
                    Let's use a simple strategy:
                    - Mobile: Modal centered
                    - Desktop: Popover relative to container (but we need to handle overflow)
                    
                    Actually, for simplicity and robustness in this specific agent task without adding libs:
                    Let's use a simplified "Modal-like" dropdown for Mobile, and for Desktop we'll try to keep it relative if possible,
                    OR just use the Portal approach for everything to ensure it floats on top.
                */}

                {/* Responsive Container */}
                <div
                    className="bg-[#1a1b23] border border-gray-700 rounded-lg shadow-2xl w-full max-w-[300px] max-h-[400px] flex flex-col overflow-hidden nav-backdrop"
                    style={{
                        // For desktop, we could try to position it near the mouse or center it. 
                        // Centering is safest for now without Popper.js
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between p-3 border-b border-gray-700 bg-[#1a1b23]">
                        <span className="font-medium text-white">{placeholder}</span>
                        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                            <X size={18} />
                        </button>
                    </div>

                    <div className="overflow-y-auto p-1 py-2 space-y-1 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                        {options.map((option) => (
                            <button
                                type="button"
                                key={String(option.value)}
                                onClick={(e) => {
                                    e.preventDefault(); // Extra safety
                                    e.stopPropagation(); // Stop bubbling
                                    onChange(option.value);
                                    setIsOpen(false);
                                }}
                                className={`w-full text-left px-3 py-2 rounded flex items-center justify-between transition-colors ${option.value === value
                                    ? "bg-blue-600/20 text-blue-400"
                                    : "text-gray-300 hover:bg-[#2a2b36]"
                                    }`}
                            >
                                <span className="text-sm">{option.label}</span>
                                {option.value === value && <Check size={14} className="text-blue-500" />}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );

        return createPortal(content, document.body);
    };

    return (
        <div className={`relative inline-block ${className}`} ref={containerRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 bg-[#1a1b23] hover:bg-[#2a2b36] border border-gray-700 text-gray-200 px-3 py-1.5 rounded text-sm transition-colors focus:ring-2 focus:ring-blue-500/50 outline-none"
            >
                <span className="font-medium">{selectedOption?.label || placeholder}</span>
                <ChevronDown size={14} className={`text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>
            <DropdownContent />
        </div>
    );
}

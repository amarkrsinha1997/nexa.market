"use client";

import { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { Calendar } from "lucide-react";

interface DatePickerProps {
    label?: string;
    selected: Date | undefined;
    onSelect: (date: Date | undefined) => void;
    className?: string;
}

export default function DatePicker({ label = "Date", selected, onSelect, className }: DatePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Click outside to close (for Desktop Popover)
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Dark Theme Styles for DayPicker
    const css = `
        .rdp { --rdp-cell-size: 40px; --rdp-accent-color: #3b82f6; --rdp-background-color: #1a1b23; margin: 0; color: white; }
        .rdp-button:hover:not([disabled]):not(.rdp-day_selected) { background-color: #2a2b36; }
        .rdp-caption_label { color: #e5e7eb; }
        .rdp-nav_button { color: #e5e7eb; }
        .rdp-head_cell { color: #9ca3af; }
        .rdp-day { color: #e5e7eb; }
        .rdp-day_selected { color: white; }
        .rdp select { background-color: #1a1b23; color: #e5e7eb; border: 1px solid #374151; border-radius: 4px; padding: 2px; }
    `;

    return (
        <div className={`space-y-2 ${className}`} ref={containerRef}>
            <style jsx global>{css}</style>

            <label className="block text-sm font-medium text-gray-300 flex items-center gap-2">
                <Calendar size={16} className="text-blue-500" />
                {label}
            </label>

            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full p-3 border border-gray-700 rounded-lg bg-[#2a2b36] text-left text-gray-200 flex justify-between items-center focus:ring-2 focus:ring-blue-500/50 outline-none hover:bg-[#3f4050] transition-colors"
                >
                    {selected ? format(selected, 'PPP') : <span className="text-gray-500">Pick a date</span>}
                    <Calendar size={18} className="text-gray-400" />
                </button>

                {isOpen && (
                    <>
                        {/* Mobile Overlay (Backdrop) */}
                        <div
                            className="md:hidden fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
                            onClick={() => setIsOpen(false)} // Close on backdrop click
                        >
                            <div
                                className="bg-[#1a1b23] border border-gray-700 rounded-lg p-4 shadow-xl"
                                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking content
                            >
                                <DayPicker
                                    mode="single"
                                    selected={selected}
                                    captionLayout="dropdown"
                                    fromYear={1900}
                                    toYear={2100}
                                    onSelect={(d) => {
                                        onSelect(d);
                                        setIsOpen(false);
                                    }}
                                />
                            </div>
                        </div>

                        {/* Desktop Popover */}
                        <div className="hidden md:block absolute top-full mt-2 left-0 z-50 bg-[#1a1b23] border border-gray-700 rounded-lg shadow-xl p-4">
                            <DayPicker
                                mode="single"
                                selected={selected}
                                captionLayout="dropdown"
                                fromYear={1900}
                                toYear={2100}
                                onSelect={(d) => {
                                    onSelect(d);
                                    setIsOpen(false);
                                }}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

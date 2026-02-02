"use client";

import { useState, useRef, useEffect } from "react";
import { format, setMonth, setYear, getMonth, getYear, addMonths, subMonths, startOfMonth } from "date-fns";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import CustomSelect, { SelectOption } from "./CustomSelect";

interface DatePickerProps {
    label?: string;
    selected: Date | undefined;
    onSelect: (date: Date | undefined) => void;
    className?: string;
    maxDate?: Date;
}

export default function DatePicker({ label = "Date", selected, onSelect, className, maxDate }: DatePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
    const containerRef = useRef<HTMLDivElement>(null);

    // Default maxDate to today if likely intended for DOB, or just optional.
    // User request: "that should be current year, month and date".
    // Let's fallback to today if for some reason we want strict "not future" default,
    // but usually UI components shouldn't be opinionated unless specified.
    // However, for this specific request "should be current...", I will assume they want logic to handle it.
    // Let's use the passed maxDate or standard "no limit" if undefined, BUT
    // for the "years" dropdown, we usually want some bound.
    // The previous implementation hardcoded 2100.

    // Let's calculate bounds
    const effectiveMaxDate = maxDate || new Date("2100-12-31");
    const maxYear = getYear(effectiveMaxDate);
    const minYear = 1900; // Keep 1900 as base

    // Synchronize current month with selected date when opening, if defined
    useEffect(() => {
        if (isOpen && selected) {
            setCurrentMonth(selected);
        }
    }, [isOpen, selected]);

    // Click outside to close (for Desktop Popover)
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            // Check if click is on a portal (our custom select dropdowns)
            const target = event.target as HTMLElement;
            if (target.closest('.nav-backdrop')) return;

            if (containerRef.current && !containerRef.current.contains(target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Generate Options
    const months: SelectOption[] = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ].map((m, i) => ({ label: m, value: i }));

    // Generate Years dynamically up to maxYear
    const years: SelectOption[] = Array.from({ length: maxYear - minYear + 1 }, (_, i) => {
        const y = minYear + i;
        return { label: String(y), value: y };
    }).reverse();

    const handleMonthChange = (val: number | string) => {
        const newMonthIndex = Number(val);
        // Reset to 1st of month to avoid overflow (e.g. Jan 31 -> Feb)
        const safeDate = startOfMonth(currentMonth);
        const newDate = setMonth(safeDate, newMonthIndex);
        setCurrentMonth(newDate);
    };

    const handleYearChange = (val: number | string) => {
        const newYear = Number(val);
        // Reset to 1st of month to avoid overflow (e.g. Feb 29 -> non-leap year)
        const safeDate = startOfMonth(currentMonth);
        const newDate = setYear(safeDate, newYear);
        setCurrentMonth(newDate);
    };

    const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    // Dark Theme Styles for DayPicker
    const css = `
        .rdp { --rdp-cell-size: 40px; --rdp-accent-color: #2563eb; --rdp-background-color: #1a1b23; margin: 0 auto; color: white; width: 100%; display: flex; justify-content: center; }
        .rdp-button:hover:not([disabled]):not(.rdp-day_selected) { background-color: #2a2b36; }
        .rdp-caption { display: none !important; } /* Hide default caption completely */
        .rdp-caption_label { display: none !important; } /* Hide caption label */
        .rdp-month_caption { display: none !important; } /* Hide month caption */
        .rdp-nav { display: none !important; } /* Hide navigation */
        .rdp-months { justify-content: center; width: 100%; margin: 0 auto; }
        .rdp-month { margin: 0 auto; width: 100%; }
        .rdp-table { margin: 0 auto; max-width: 100%; }
        .rdp-head_cell { color: #9ca3af; font-size: 0.875rem; font-weight: 500; text-align: center; }
        .rdp-day { color: #e5e7eb; font-size: 0.875rem; text-align: center; }
        .rdp-day_selected { color: white; font-weight: bold; }
        .rdp-day_today { color: #60a5fa; font-weight: bold; }
        .rdp-button[disabled] { opacity: 0.25; cursor: not-allowed; } /* Style disabled days */
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
                        {/* Mobile Overlay */}
                        <div
                            className="md:hidden fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
                            onClick={() => setIsOpen(false)}
                        >
                            <div
                                className="bg-[#1a1b23] border border-gray-700 rounded-lg p-4 shadow-xl w-full max-w-sm"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Header */}
                                <div className="flex items-center justify-between p-2 border-b border-gray-700/50 mb-2">
                                    <button
                                        onClick={handlePrevMonth}
                                        type="button"
                                        className="p-1 hover:bg-[#2a2b36] rounded text-gray-400 hover:text-white"
                                        title="Previous Month"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>

                                    <div className="flex items-center gap-2">
                                        <CustomSelect
                                            key={`month-${getMonth(currentMonth)}`}
                                            options={months}
                                            value={getMonth(currentMonth)}
                                            onChange={handleMonthChange}
                                            placeholder="Month"
                                        />
                                        <CustomSelect
                                            key={`year-${getYear(currentMonth)}`}
                                            options={years}
                                            value={getYear(currentMonth)}
                                            onChange={handleYearChange}
                                            placeholder="Year"
                                        />
                                    </div>

                                    <button
                                        onClick={handleNextMonth}
                                        type="button"
                                        className="p-1 hover:bg-[#2a2b36] rounded text-gray-400 hover:text-white"
                                        title="Next Month"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </div>

                                <DayPicker
                                    mode="single"
                                    selected={selected}
                                    onSelect={(d) => {
                                        onSelect(d);
                                        setIsOpen(false);
                                    }}
                                    month={currentMonth}
                                    onMonthChange={setCurrentMonth}
                                    disabled={maxDate ? { after: maxDate } : undefined}
                                    showOutsideDays
                                />
                            </div>
                        </div>

                        {/* Desktop Popover */}
                        <div className="hidden md:block absolute top-full mt-2 left-0 z-50 bg-[#1a1b23] border border-gray-700 rounded-lg shadow-xl p-4 min-w-[340px]">
                            {/* Header */}
                            <div className="flex items-center justify-between p-2 border-b border-gray-700/50 mb-2">
                                <button
                                    onClick={handlePrevMonth}
                                    type="button"
                                    className="p-1 hover:bg-[#2a2b36] rounded text-gray-400 hover:text-white"
                                    title="Previous Month"
                                >
                                    <ChevronLeft size={20} />
                                </button>

                                <div className="flex items-center gap-2">
                                    <CustomSelect
                                        key={`month-d-${getMonth(currentMonth)}`}
                                        options={months}
                                        value={getMonth(currentMonth)}
                                        onChange={handleMonthChange}
                                        placeholder="Month"
                                    />
                                    <CustomSelect
                                        key={`year-d-${getYear(currentMonth)}`}
                                        options={years}
                                        value={getYear(currentMonth)}
                                        onChange={handleYearChange}
                                        placeholder="Year"
                                    />
                                </div>

                                <button
                                    onClick={handleNextMonth}
                                    type="button"
                                    className="p-1 hover:bg-[#2a2b36] rounded text-gray-400 hover:text-white"
                                    title="Next Month"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>

                            <DayPicker
                                mode="single"
                                selected={selected}
                                onSelect={(d) => {
                                    onSelect(d);
                                    setIsOpen(false);
                                    // Optionally, reset currentMonth to selected date here if desired
                                    // setCurrentMonth(d || new Date());
                                }}
                                month={currentMonth}
                                onMonthChange={setCurrentMonth}
                                disabled={maxDate ? { after: maxDate } : undefined}
                                showOutsideDays
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Search, ChevronDown, Check } from "lucide-react";

// Common Countries List
const COUNTRIES = [
    { name: "India", code: "+91", iso: "IN" },
    { name: "United States", code: "+1", iso: "US" },
    { name: "United Kingdom", code: "+44", iso: "GB" },
    { name: "Canada", code: "+1", iso: "CA" },
    { name: "Australia", code: "+61", iso: "AU" },
    { name: "Germany", code: "+49", iso: "DE" },
    { name: "France", code: "+33", iso: "FR" },
    { name: "Japan", code: "+81", iso: "JP" },
    { name: "China", code: "+86", iso: "CN" },
    { name: "Brazil", code: "+55", iso: "BR" },
    { name: "Mexico", code: "+52", iso: "MX" },
    { name: "Italy", code: "+39", iso: "IT" },
    { name: "Spain", code: "+34", iso: "ES" },
    { name: "Russia", code: "+7", iso: "RU" },
    { name: "South Korea", code: "+82", iso: "KR" },
    { name: "Netherlands", code: "+31", iso: "NL" },
    { name: "Turkey", code: "+90", iso: "TR" },
    { name: "Switzerland", code: "+41", iso: "CH" },
    { name: "Sweden", code: "+46", iso: "SE" },
    { name: "Singapore", code: "+65", iso: "SG" },
    { name: "United Arab Emirates", code: "+971", iso: "AE" },
    { name: "Nigeria", code: "+234", iso: "NG" },
    { name: "South Africa", code: "+27", iso: "ZA" },
];

interface CountrySelectProps {
    value: string; // The country code (e.g. "+1")
    onChange: (code: string) => void;
    className?: string;
}

export default function CountrySelect({ value, onChange, className }: CountrySelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);

    // Selected Country Object
    const selectedCountry = useMemo(() =>
        COUNTRIES.find(c => c.code === value) || COUNTRIES[0],
        [value]);

    // Filtered List
    const filteredCountries = useMemo(() => {
        if (!search) return COUNTRIES;
        const lower = search.toLowerCase();
        return COUNTRIES.filter(c =>
            c.name.toLowerCase().includes(lower) ||
            c.code.includes(lower) ||
            c.iso.toLowerCase().includes(lower)
        );
    }, [search]);

    // Click Outside
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

    // Reset search when opening
    useEffect(() => {
        if (isOpen) setSearch("");
    }, [isOpen]);

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="h-full px-3 py-3 border border-gray-700 bg-[#2a2b36] text-white rounded-l-md flex items-center gap-2 hover:bg-[#3f4050] transition-colors min-w-[80px]"
            >
                <span className="font-medium">{selectedCountry.iso}</span>
                <span className="text-gray-400">{selectedCountry.code}</span>
                <ChevronDown size={14} className="text-gray-500 ml-auto" />
            </button>

            {isOpen && (
                <>
                    {/* Mobile Overlay */}
                    <div
                        className="md:hidden fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    >
                        <div
                            className="bg-[#1a1b23] border border-gray-700 rounded-lg shadow-xl w-full max-w-sm max-h-[80vh] flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-3 border-b border-gray-700 sticky top-0 bg-[#1a1b23] z-10 rounded-t-lg">
                                <div className="relative">
                                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        autoFocus
                                        type="text"
                                        placeholder="Search country..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2 bg-[#2a2b36] border border-gray-700 rounded text-white text-sm focus:ring-2 focus:ring-blue-500/50 outline-none"
                                    />
                                </div>
                            </div>
                            <div className="overflow-y-auto p-2 space-y-1">
                                {filteredCountries.map(country => (
                                    <button
                                        key={`${country.iso}-${country.code}`}
                                        onClick={() => {
                                            onChange(country.code);
                                            setIsOpen(false);
                                        }}
                                        className="w-full flex items-center justify-between p-3 hover:bg-[#2a2b36] rounded text-left transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-gray-400 font-mono w-8">{country.iso}</span>
                                            <span className="text-white">{country.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-blue-400">{country.code}</span>
                                            {value === country.code && <Check size={14} className="text-blue-500" />}
                                        </div>
                                    </button>
                                ))}
                                {filteredCountries.length === 0 && (
                                    <div className="p-4 text-center text-gray-500 text-sm">No countries found</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Desktop Popover */}
                    <div className="hidden md:flex absolute top-full mt-1 left-0 z-50 w-[300px] bg-[#1a1b23] border border-gray-700 rounded-lg shadow-xl flex-col max-h-[300px]">
                        <div className="p-2 border-b border-gray-700 sticky top-0 bg-[#1a1b23] z-10 rounded-t-lg">
                            <div className="relative">
                                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Search country..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-8 pr-3 py-1.5 bg-[#2a2b36] border border-gray-700 rounded text-white text-xs focus:ring-2 focus:ring-blue-500/50 outline-none"
                                />
                            </div>
                        </div>
                        <div className="overflow-y-auto p-1">
                            {filteredCountries.map(country => (
                                <button
                                    key={`${country.iso}-${country.code}`}
                                    onClick={() => {
                                        onChange(country.code);
                                        setIsOpen(false);
                                    }}
                                    className="w-full flex items-center justify-between px-3 py-2 hover:bg-[#2a2b36] rounded text-left transition-colors text-sm"
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-500 font-mono w-6 text-xs">{country.iso}</span>
                                        <span className="text-gray-200">{country.name}</span>
                                    </div>
                                    <span className="text-blue-400 text-xs">{country.code}</span>
                                </button>
                            ))}
                            {filteredCountries.length === 0 && (
                                <div className="p-3 text-center text-gray-500 text-xs">No countries found</div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

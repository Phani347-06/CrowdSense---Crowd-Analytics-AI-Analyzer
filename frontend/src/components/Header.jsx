import React from 'react';
import { Search, Download, Circle } from 'lucide-react';

const Header = ({ title }) => {
    return (
        <header className="h-20 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between px-8 transition-colors duration-300 shadow-sm z-20">
            <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">{title}</h2>
                <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">
                    <Circle className="w-2 h-2 text-green-500 fill-current" />
                    <span>Live Dashboard</span>
                    <span className="text-gray-300 dark:text-slate-600">•</span>
                    <span id="currentDate">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search regions..."
                        className="pl-10 pr-4 py-2.5 w-64 md:w-80 rounded-xl bg-gray-50 dark:bg-slate-800 border border-transparent focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400"
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 text-sm font-semibold text-gray-600 dark:text-gray-300 transition-colors shadow-sm">
                    <Download className="w-4 h-4" />
                    <span>Export</span>
                </button>
            </div>
        </header>
    );
};

export default Header;

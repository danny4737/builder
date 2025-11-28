
import React from 'react';
import { PlusIcon } from './icons';

interface HeaderProps {
    onAddWebsite: () => void;
}

const Header: React.FC<HeaderProps> = ({ onAddWebsite }) => {
    return (
        <header className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg sticky top-0 z-10 border-b border-slate-200 dark:border-slate-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-4 flex justify-between items-center">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    <span role="img" aria-label="sparkles" className="mr-2">✨</span>
                    나만의 웹사이트
                </h1>
                <button
                    onClick={onAddWebsite}
                    className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105"
                >
                    <PlusIcon className="w-5 h-5" />
                    <span className="hidden sm:inline">새 사이트 만들기</span>
                </button>
            </div>
        </header>
    );
};

export default Header;

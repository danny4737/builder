import React from 'react';

interface NavigationBarProps {
    categories: string[];
    selectedCategory: string;
    onSelectCategory: (category: string) => void;
}

const NavigationBar: React.FC<NavigationBarProps> = ({ categories, selectedCategory, onSelectCategory }) => {
    return (
        <nav className="mb-6 sm:mb-8">
            <ul className="flex items-center gap-2 sm:gap-4 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg max-w-max">
                {categories.map((category) => (
                    <li key={category}>
                        <button
                            onClick={() => onSelectCategory(category)}
                            className={`px-4 py-2 text-sm sm:text-base font-semibold rounded-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${
                                selectedCategory === category
                                    ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-sm'
                                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700/50'
                            }`}
                        >
                            {category}
                        </button>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default NavigationBar;

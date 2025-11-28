import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 md:px-8 text-center text-slate-500 dark:text-slate-400">
                <p className="text-sm mb-2">
                    &copy; {new Date().getFullYear()} 세로늉늉. All rights reserved.
                </p>
                <p className="text-xs">
                    학교 주소: 경기 분당구 하오개로 351번길 4
                </p>
            </div>
        </footer>
    );
};

export default Footer;

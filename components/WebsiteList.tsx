
import React from 'react';
import type { Website } from '../types';
import WebsiteCard from './WebsiteCard';
import { PlusIcon } from './icons';

interface WebsiteListProps {
    websites: Website[];
    onDeleteWebsite: (id: string) => void;
}

const WebsiteList: React.FC<WebsiteListProps> = ({ websites, onDeleteWebsite }) => {
    if (websites.length === 0) {
        return (
            <div className="text-center py-20">
                <div className="flex justify-center items-center mb-4">
                    <div className="w-24 h-24 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-400 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                </div>
                <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-300 mb-2">웹사이트가 없습니다</h2>
                <p className="text-slate-500 dark:text-slate-400">오른쪽 상단의 '새 사이트 만들기' 버튼을 눌러 첫 웹사이트를 만들어보세요!</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {websites.map(website => (
                <WebsiteCard key={website.id} website={website} onDelete={onDeleteWebsite} />
            ))}
        </div>
    );
};

export default WebsiteList;

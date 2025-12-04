import React, { useState, useEffect, useCallback } from 'react';
import type { Website } from '../types';
import WebsiteList from '../components/WebsiteList';
import NavigationBar from '../components/NavigationBar';
import AddWebsiteModal from '../components/AddWebsiteModal';

const Homepage: React.FC = () => {
    const [websites, setWebsites] = useState<Website[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('전체');
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        // 👇 깔끔하게 정리된 데이터 리스트!
        const initialWebsites: Website[] = [
            // 1. 아까 만든 AI 랜딩 페이지 (유지)
            {
                id: 'new-ai-page',
                title: 'AI 랜딩 페이지',
                description: '방금 만든 새 웹사이트입니다. 클릭하면 이동합니다!',
                thumbnailUrl: 'https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                createdAt: '2025-01-01',
                category: '웹사이트',
                path: '/new-website'
            },
            // 2. 새로 추가한 두 번째 페이지 (NEW!)
            {
                id: 'second-page',
                title: '나의 두 번째 프로젝트',
                description: '대시보드 정리를 완료하고 새로 추가한 페이지입니다.',
                thumbnailUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                createdAt: new Date().toLocaleDateString('ko-KR'),
                category: '프로젝트', // 카테고리
                path: '/second-page' // App.tsx에 등록한 주소
            }
        ];
        setWebsites(initialWebsites);
    }, []);

    const handleAddWebsite = useCallback((title: string, description: string) => {
        const newWebsite: Website = {
            id: new Date().toISOString(),
            title,
            description,
            thumbnailUrl: `https://picsum.photos/seed/${new Date().getTime()}/500/300`,
            createdAt: new Date().toLocaleDateString('ko-KR'),
            category: '웹사이트',
        };
        setWebsites(prevWebsites => [newWebsite, ...prevWebsites]);
        setIsModalOpen(false);
    }, [websites]);

    const handleDeleteWebsite = useCallback((id: string) => {
        setWebsites(prevWebsites => prevWebsites.filter(site => site.id !== id));
    }, []);

    // 카테고리 목록도 깔끔하게 정리
    const categories = ['전체', '웹사이트', '프로젝트'];

    const filteredWebsites =
        selectedCategory === '전체'
            ? websites
            : websites.filter(site => site.category === selectedCategory);

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 sm:p-6 md:p-8">
                <NavigationBar
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onSelectCategory={setSelectedCategory}
                />
                <WebsiteList websites={filteredWebsites} onDeleteWebsite={handleDeleteWebsite} />
            </div>
            
            <AddWebsiteModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={handleAddWebsite}
            />
        </div>
    );
};

export default Homepage;
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
        // 👇 카드 데이터 수정됨!
        const initialWebsites: Website[] = [
            {
                id: 'new-ai-page',
                title: 'AI 랜딩 페이지',
                description: '방금 만든 새 웹사이트입니다. 클릭하면 이동합니다!',
                thumbnailUrl: 'https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                createdAt: '2025-01-01',
                category: '웹사이트',
                path: '/new-website'
            },
            {
                id: 'second-page',
                title: '벽돌깨기 게임', // 👈 제목 변경!
                description: '네온 스타일의 벽돌깨기 게임입니다. 모든 벽돌을 깨보세요!', // 👈 설명 변경!
                thumbnailUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', // 👈 게임 느낌 나는 이미지로 변경!
                createdAt: new Date().toLocaleDateString('ko-KR'),
                category: '게임', // 👈 카테고리도 '게임'으로 변경하면 더 좋겠죠?
                path: '/second-page'
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

    // 카테고리 목록 업데이트 ('프로젝트' -> '게임')
    const categories = ['전체', '웹사이트', '게임'];

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
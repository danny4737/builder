import React, { useState, useEffect, useCallback } from 'react';
import type { Website } from '../types';
// Header import 제거
import WebsiteList from '../components/WebsiteList';
import NavigationBar from '../components/NavigationBar';
import AddWebsiteModal from '../components/AddWebsiteModal';
// Footer import 제거

const Homepage: React.FC = () => {
    const [websites, setWebsites] = useState<Website[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('전체');
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const initialWebsites: Website[] = [
            {
                id: 'new-ai-page',
                title: 'AI 랜딩 페이지',
                description: '방금 만든 새 웹사이트입니다. 클릭하면 이동합니다!',
                thumbnailUrl: 'https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                createdAt: new Date().toLocaleDateString('ko-KR'),
                category: '웹사이트',
                path: '/new-website'
            },
            {
                id: '1',
                title: '내 첫 포트폴리오',
                description: '리액트와 Tailwind로 만든 개인 프로젝트 쇼케이스',
                thumbnailUrl: 'https://picsum.photos/seed/1/500/300',
                createdAt: '2023-10-26',
                category: '게임',
            },
            {
                id: '2',
                title: 'MBTI 심리 테스트',
                description: '나의 진짜 MBTI 유형을 알아보는 심층 테스트',
                thumbnailUrl: 'https://picsum.photos/seed/2/500/300',
                createdAt: '2023-11-15',
                category: 'MBTI',
            },
            {
                id: '3',
                title: '인디 게임 추천',
                description: '숨겨진 명작 인디 게임들을 소개합니다.',
                thumbnailUrl: 'https://picsum.photos/seed/3/500/300',
                createdAt: '2024-01-08',
                category: '게임',
            },
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
            category: (websites.length + 1) % 2 === 0 ? 'MBTI' : '게임',
        };
        setWebsites(prevWebsites => [newWebsite, ...prevWebsites]);
        setIsModalOpen(false);
    }, [websites]);

    const handleDeleteWebsite = useCallback((id: string) => {
        setWebsites(prevWebsites => prevWebsites.filter(site => site.id !== id));
    }, []);

    const categories = ['전체', '웹사이트', '게임', 'MBTI'];

    const filteredWebsites =
        selectedCategory === '전체'
            ? websites
            : websites.filter(site => site.category === selectedCategory);

    return (
        <div className="flex flex-col h-full"> {/* h-full 추가 */}
            {/* Header 태그 삭제됨 (Layout에 있음) */}
            
            <div className="p-4 sm:p-6 md:p-8">
                <NavigationBar
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onSelectCategory={setSelectedCategory}
                />
                <WebsiteList websites={filteredWebsites} onDeleteWebsite={handleDeleteWebsite} />
            </div>
            
            {/* Footer 태그 삭제됨 (Layout에 있음) */}
            
            <AddWebsiteModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={handleAddWebsite}
            />
        </div>
    );
};

export default Homepage;
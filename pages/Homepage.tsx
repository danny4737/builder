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
        // 👇 사진(thumbnailUrl)을 모두 예쁜 것으로 교체했습니다!
        const initialWebsites: Website[] = [
            // 1. 앨런쌤 (하트 사진으로 변경)
            {
                id: 'allen',
                title: 'To. 앨런쌤',
                description: '앨런쌤 사랑해요❤️',
                thumbnailUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80',
                createdAt: '2025-01-01',
                category: 'LOVE',
                path: '/new-website'
            },
            // 2. 벽돌깨기 게임
            {
                id: 'game',
                title: '벽돌깨기 게임',
                description: '네온 스타일의 벽돌깨기 게임입니다.',
                thumbnailUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
                createdAt: new Date().toLocaleDateString('ko-KR'),
                category: '게임',
                path: '/second-page'
            },
            // 3. 존쌤 (축하 파티 느낌)
            {
                id: 'john',
                title: 'To. 존쌤',
                description: '존쌤 사랑해요❤️',
                thumbnailUrl: 'https://images.unsplash.com/photo-1514525253440-b393452e3726?auto=format&fit=crop&w=800&q=80',
                createdAt: '2025-01-02',
                category: 'LOVE',
                path: '/john'
            },
            // 4. 그레이스쌤 (따뜻한 노을)
            {
                id: 'grace',
                title: 'To. 그레이스쌤',
                description: '그레이스쌤 사랑해요❤️',
                thumbnailUrl: 'https://images.unsplash.com/photo-1495615080073-6b89c98beddb?auto=format&fit=crop&w=800&q=80',
                createdAt: '2025-01-02',
                category: 'LOVE',
                path: '/grace'
            },
            // 5. 그리니쌤 (초록초록한 식물)
            {
                id: 'greenie',
                title: 'To. 그리니쌤',
                description: '그리니쌤 사랑해요❤️',
                thumbnailUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80',
                createdAt: '2025-01-02',
                category: 'LOVE',
                path: '/greenie'
            },
            // 6. 에이버리쌤 (예술적인 물감)
            {
                id: 'avery',
                title: 'To. 에이버리쌤',
                description: '에이버리쌤 사랑해요❤️',
                thumbnailUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80',
                createdAt: '2025-01-02',
                category: 'LOVE',
                path: '/avery'
            },
            // 7. 데이비드쌤 (시원한 파란색 추상화)
            {
                id: 'david',
                title: 'To. 데이비드쌤',
                description: '데이비드쌤 사랑해요❤️',
                thumbnailUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=800&q=80',
                createdAt: '2025-01-02',
                category: 'LOVE',
                path: '/david'
            },
            // 8. 하나쌤 (예쁜 꽃)
            {
                id: 'hana',
                title: 'To. 하나쌤',
                description: '하나쌤 사랑해요❤️',
                thumbnailUrl: 'https://images.unsplash.com/photo-1490750967868-58cb7506deed?auto=format&fit=crop&w=800&q=80',
                createdAt: '2025-01-02',
                category: 'LOVE',
                path: '/hana'
            },
            // 9. 켈리쌤 (감성적인 커피)
            {
                id: 'kelly',
                title: 'To. 켈리쌤',
                description: '켈리쌤 사랑해요❤️',
                thumbnailUrl: 'https://images.unsplash.com/photo-1453396450673-3fe83d2db2c4?auto=format&fit=crop&w=800&q=80',
                createdAt: '2025-01-02',
                category: 'LOVE',
                path: '/kelly'
            },
            // 10. 클로이쌤 (몽환적인 구름)
            {
                id: 'chloe',
                title: 'To. 클로이쌤',
                description: '클로이쌤 사랑해요❤️',
                thumbnailUrl: 'https://images.unsplash.com/photo-1516726817505-f5ed8259fab9?auto=format&fit=crop&w=800&q=80',
                createdAt: '2025-01-02',
                category: 'LOVE',
                path: '/chloe'
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

    const categories = ['전체', '웹사이트', '게임', 'LOVE'];

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
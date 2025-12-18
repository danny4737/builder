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
        const initialWebsites: Website[] = [
            // 🆕 카드 게임 추가
            {
                id: 'card',
                title: 'Memory Match',
                description: '뒤집힌 카드의 짝을 찾아라! 기억력 테스트 게임입니다.',
                thumbnailUrl: 'https://images.unsplash.com/photo-1606167668584-78701c57f13d?auto=format&fit=crop&w=800&q=80',
                createdAt: new Date().toLocaleDateString('ko-KR'),
                category: '게임',
                path: '/card-game'
            },
            // 기존 카드들...
            {
                id: 'golf',
                title: 'AI Mini Golf',
                description: '물리와 전략이 만났다! AI 캐디와 함께 홀인원에 도전하세요.',
                thumbnailUrl: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=800&q=80',
                createdAt: new Date().toLocaleDateString('ko-KR'),
                category: '게임',
                path: '/golf-game'
            },
            {
                id: 'aim',
                title: 'Aim Lab (AI Coach)',
                description: '당신의 반응속도와 정확도를 테스트하세요! AI 코치가 분석해줍니다.',
                thumbnailUrl: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&w=800&q=80',
                createdAt: new Date().toLocaleDateString('ko-KR'),
                category: '게임',
                path: '/aim-game'
            },
            {
                id: 'racer',
                title: 'AI Speed Racer',
                description: '끝없이 펼쳐지는 도로를 질주하세요! AI가 실시간으로 해설해줍니다.',
                thumbnailUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80',
                createdAt: new Date().toLocaleDateString('ko-KR'),
                category: '게임',
                path: '/racer-game'
            },
            {
                id: 'diary',
                title: '마음 챙김 일기 (AI)',
                description: '오늘 하루는 어땠나요? AI가 당신의 감정을 분석하고 위로해줍니다.',
                thumbnailUrl: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=800&q=80',
                createdAt: new Date().toLocaleDateString('ko-KR'),
                category: '웹사이트',
                path: '/diary'
            },
            {
                id: 'sketch',
                title: 'Sketch Pro (AI)',
                description: 'AI가 내 그림을 분석해주는 스마트 드로잉 앱입니다.',
                thumbnailUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80',
                createdAt: new Date().toLocaleDateString('ko-KR'),
                category: '웹사이트',
                path: '/sketch-pro'
            },
            {
                id: 'ladder',
                title: '스마트 사다리 타기',
                description: '친구들과 간식 내기 한 판! 직관적인 사다리 게임입니다.',
                thumbnailUrl: 'https://images.unsplash.com/photo-1541560052-77ec1bbc09f7?auto=format&fit=crop&w=800&q=80',
                createdAt: new Date().toLocaleDateString('ko-KR'),
                category: '게임',
                path: '/ladder-game'
            },
            {
                id: 'tetris',
                title: 'Drag-tris',
                description: '마우스로 드래그해서 맞추는 신개념 테트리스!',
                thumbnailUrl: 'https://images.unsplash.com/photo-1596443686812-2f45229eebc3?auto=format&fit=crop&w=800&q=80',
                createdAt: new Date().toLocaleDateString('ko-KR'),
                category: '게임',
                path: '/tetris-game'
            },
            {
                id: 'rhythm',
                title: 'Orbit Rhythm',
                description: '궤도를 따라가는 감각적인 리듬 게임입니다.',
                thumbnailUrl: 'https://images.unsplash.com/photo-1614726365723-49cfae96c693?auto=format&fit=crop&w=800&q=80',
                createdAt: new Date().toLocaleDateString('ko-KR'),
                category: '게임',
                path: '/rhythm-game'
            },
            {
                id: 'game',
                title: '벽돌깨기 게임',
                description: '네온 스타일의 벽돌깨기 게임입니다.',
                thumbnailUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
                createdAt: new Date().toLocaleDateString('ko-KR'),
                category: '게임',
                path: '/second-page'
            },
            {
                id: 'allen',
                title: 'To. 앨런쌤',
                description: '앨런쌤 사랑해요❤️',
                thumbnailUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80',
                createdAt: '2025-01-01',
                category: 'LOVE',
                path: '/new-website'
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
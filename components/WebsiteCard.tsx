import React from 'react';
import { Website } from '../types';
import { Link } from 'react-router-dom'; // 👈 이게 있어야 클릭해서 이동할 수 있습니다

interface WebsiteCardProps {
  website: Website;
  onDelete: (id: string) => void;
}

const WebsiteCard: React.FC<WebsiteCardProps> = ({ website, onDelete }) => {
  // 삭제 버튼 눌렀을 때 페이지 이동 막기
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(website.id);
  };

  return (
    // ⬇️ 여기가 <div>가 아니라 <Link>여야 합니다!
    <Link 
      to={website.path || '#'} 
      className="block bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-slate-100 dark:border-slate-700 cursor-pointer"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={website.thumbnailUrl}
          alt={website.title}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
        <div className="absolute top-2 right-2">
          <span className="px-2 py-1 text-xs font-semibold bg-white/90 dark:bg-slate-900/90 rounded-full shadow-sm">
            {website.category}
          </span>
        </div>
      </div>
      
      <div className="p-5">
        <h3 className="text-xl font-bold mb-2 text-slate-800 dark:text-white line-clamp-1">
          {website.title}
        </h3>
        <p className="text-slate-600 dark:text-slate-300 text-sm mb-4 line-clamp-2 h-10">
          {website.description}
        </p>
        
        <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-700">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {website.createdAt}
          </span>
          <button
            onClick={handleDeleteClick}
            className="text-red-500 hover:text-red-700 text-sm font-medium px-3 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            삭제
          </button>
        </div>
      </div>
    </Link>
  );
};

export default WebsiteCard;
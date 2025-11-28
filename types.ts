export interface Website {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  createdAt: string;
  category: string;
  path?: string; // ✅ 이 줄이 있어야 빨간 줄이 사라집니다!
}

// 아래 타입들은 기존에 있었다면 유지, 없었다면 추가해도 무방합니다.
export type WebsiteCategory = '전체' | '게임' | 'MBTI' | '웹사이트';

export type WebsiteFormData = Omit<Website, 'id' | 'createdAt' | 'path'>;
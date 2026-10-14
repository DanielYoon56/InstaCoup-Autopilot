import React from 'react';
import {
  LayoutDashboard,
  PackageCheck,
  PlusCircle,
  Images,
  FileText,
  ShieldCheck,
  Calendar,
  MessageSquareShare,
  TrendingUp,
  Settings,
} from 'lucide-react';

export type ScreenId =
  | 'dashboard'
  | 'sourcing'
  | 'products'
  | 'register'
  | 'carousel'
  | 'caption'
  | 'review'
  | 'schedule'
  | 'comment-dm'
  | 'analytics'
  | 'settings';

interface SidebarProps {
  currentScreen: ScreenId;
  onSelectScreen: (screen: ScreenId) => void;
  reviewCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentScreen,
  onSelectScreen,
  reviewCount,
}) => {
  const menuItems: { id: ScreenId; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'dashboard',
      label: '대시보드',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'sourcing',
      label: '키워드 발굴 (DataLab)',
      icon: <TrendingUp className="w-4 h-4" />,
    },
    {
      id: 'products',
      label: '상품 목록 및 평가',
      icon: <PackageCheck className="w-4 h-4" />,
    },
    {
      id: 'register',
      label: '상품 신규 등록',
      icon: <PlusCircle className="w-4 h-4" />,
    },
    {
      id: 'carousel',
      label: '캐러셀 편집기',
      icon: <Images className="w-4 h-4" />,
    },
    {
      id: 'caption',
      label: '캡션 생성기',
      icon: <FileText className="w-4 h-4" />,
    },
    {
      id: 'review',
      label: '검수 대기함',
      icon: <ShieldCheck className="w-4 h-4" />,
      badge: reviewCount > 0 ? reviewCount : undefined,
    },
    {
      id: 'schedule',
      label: '게시 일정 관리',
      icon: <Calendar className="w-4 h-4" />,
    },
    {
      id: 'comment-dm',
      label: '댓글 및 DM 로그',
      icon: <MessageSquareShare className="w-4 h-4" />,
    },
    {
      id: 'analytics',
      label: '제휴 성과 분석',
      icon: <TrendingUp className="w-4 h-4" />,
    },
    {
      id: 'settings',
      label: '설정 및 API 연결',
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-200 flex flex-col shrink-0 border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-sky-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            IG
          </div>
          <div>
            <div className="font-semibold text-sm tracking-tight text-white leading-tight">
              Affiliate Autopilot
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Instagram · Coupang Partners
            </div>
          </div>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
          운영 관리 모듈
        </div>
        {menuItems.map((item) => {
          const isActive = currentScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectScreen(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-medium rounded-lg transition-colors text-left ${
                isActive
                  ? 'bg-sky-600/90 text-white font-semibold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={isActive ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
                    isActive ? 'bg-white text-sky-800' : 'bg-amber-500 text-slate-950'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
        <div className="flex items-center justify-between">
          <span>시스템 엔진</span>
          <span className="text-slate-300 font-mono text-[10px]">v1.0 (Local/API)</span>
        </div>
        <div className="flex items-center justify-between">
          <span>공정위 지침</span>
          <span className="text-emerald-400 font-medium text-[10px]">준수 모드 ON</span>
        </div>
      </div>
    </aside>
  );
};

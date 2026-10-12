import React from 'react';
import { ScreenId } from './Sidebar';
import { ApiSettings } from '../../types';
import { CheckCircle2, AlertCircle, Sparkles, RefreshCw } from 'lucide-react';

interface NavbarProps {
  currentScreen: ScreenId;
  apiSettings: ApiSettings;
  onResetData: () => void;
  onNavigateToSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentScreen,
  apiSettings,
  onResetData,
  onNavigateToSettings,
}) => {
  const getScreenTitle = (screen: ScreenId): string => {
    switch (screen) {
      case 'dashboard':
        return '통합 운영 대시보드';
      case 'products':
        return '상품 목록 및 평가 분석';
      case 'register':
        return '상품 신규 등록';
      case 'carousel':
        return '캐러셀 비주얼 편집기';
      case 'caption':
        return '캡션 및 트리거 키워드 생성기';
      case 'review':
        return '검수 대기함 (광고 심사 준수)';
      case 'schedule':
        return '게시 일정 및 공식 API 연동';
      case 'comment-dm':
        return '댓글 자동 DM 발송 로그 및 시뮬레이터';
      case 'analytics':
        return '제휴 실적 및 ROI 성과 분석';
      case 'settings':
        return '설정 및 API 연동 센터';
    }
  };

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <h1 className="text-base font-bold text-slate-900 tracking-tight">
          {getScreenTitle(currentScreen)}
        </h1>
        <span className="text-slate-300">|</span>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>한국 시장 최적화</span>
          <span aria-hidden="true">·</span>
          <span>쿠팡 파트너스 연동</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Status indicator badges */}
        <button
          onClick={onNavigateToSettings}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors"
          title="Instagram 연동 상태"
        >
          <span className="text-slate-500 font-medium">인스타그램:</span>
          {apiSettings.instagram.isConnected ? (
            <span className="text-emerald-700 flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> 연결됨
            </span>
          ) : (
            <span className="text-amber-700 flex items-center gap-1 font-medium">
              <AlertCircle className="w-3 h-3 text-amber-600" /> 데모(내보내기 모드)
            </span>
          )}
        </button>

        <button
          onClick={onNavigateToSettings}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors"
          title="쿠팡 파트너스 연동 상태"
        >
          <span className="text-slate-500 font-medium">쿠팡 파트너스:</span>
          <span className="text-slate-700 font-medium">
            {apiSettings.coupangPartners.trackingId || '데모 모드'}
          </span>
        </button>

        <button
          onClick={onResetData}
          className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
          title="초기 샘플 데이터 복원"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};

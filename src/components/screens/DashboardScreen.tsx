import React from 'react';
import {
  Product,
  PostContent,
  CommentTriggerLog,
  AffiliatePerformanceRecord,
} from '../../types';
import { MetricCard } from '../common/MetricCard';
import { ScoreGauge } from '../common/ScoreGauge';
import { ScreenId } from '../layout/Sidebar';
import {
  Package,
  Layers,
  ShieldAlert,
  Send,
  Coins,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  ExternalLink,
} from 'lucide-react';

interface DashboardScreenProps {
  products: Product[];
  posts: PostContent[];
  commentLogs: CommentTriggerLog[];
  performance: AffiliatePerformanceRecord[];
  onNavigate: (screen: ScreenId) => void;
  onSelectProductForCarousel: (productId: string) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  products,
  posts,
  commentLogs,
  performance,
  onNavigate,
  onSelectProductForCarousel,
}) => {
  // Calculations
  const totalProducts = products.length;
  const gradeCount = {
    S: products.filter((p) => p.grade === 'S').length,
    A: products.filter((p) => p.grade === 'A').length,
    B: products.filter((p) => p.grade === 'B').length,
    C: products.filter((p) => p.grade === 'C').length,
  };

  const reviewRequiredPosts = posts.filter((p) => p.status === 'REVIEW_REQUIRED');
  const approvedPosts = posts.filter((p) => p.status === 'APPROVED');
  const scheduledPosts = posts.filter((p) => p.status === 'SCHEDULED' || p.status === 'PUBLISHED');

  const totalCommission = performance.reduce((sum, r) => sum + r.approvedCommission, 0);
  const totalOrders = performance.reduce((sum, r) => sum + r.approvedOrders, 0);
  const totalDmSent = commentLogs.filter((l) => l.status === 'SENT').length;
  const totalClicks = performance.reduce((sum, r) => sum + r.linkClicks, 0);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Banner / Pipeline Progress */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-sky-400 mb-1">
                <span>AUTOPILOT V1.0 PIPELINE</span>
                <span className="text-slate-500">·</span>
                <span>대한민국 인스타그램 & 쿠팡 파트너스</span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
                상품 발굴부터 댓글 자동 DM까지 전 과정 원클릭 관리
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                확인된 객관적 팩트만으로 5~7장 캐러셀을 기획하고, 공정위 가이드라인을 준수하여 안전하게 운영합니다.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onNavigate('register')}
                className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5"
              >
                <span>새 상품 후보 등록</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onNavigate('review')}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded-lg border border-slate-700 transition-colors"
              >
                검수 대기함 ({reviewRequiredPosts.length})
              </button>
            </div>
          </div>

          {/* Workflow Stepper */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 mt-6 pt-5 border-t border-slate-800 text-xs">
            {[
              { step: '01', name: '상품 등록', count: totalProducts, screen: 'products' },
              { step: '02', name: '가중치 평가', count: `${gradeCount.S + gradeCount.A}개 우수`, screen: 'products' },
              { step: '03', name: '캐러셀 기획', count: posts.length, screen: 'carousel' },
              { step: '04', name: '캡션/태그', count: 'FTC준수', screen: 'caption' },
              { step: '05', name: '검수 심사', count: `${reviewRequiredPosts.length}건 대기`, screen: 'review', highlight: reviewRequiredPosts.length > 0 },
              { step: '06', name: '게시 예약', count: scheduledPosts.length, screen: 'schedule' },
              { step: '07', name: '댓글 자동 DM', count: `${totalDmSent}건 발송`, screen: 'comment-dm' },
              { step: '08', name: '실적 분석', count: `${totalCommission.toLocaleString()}원`, screen: 'analytics' },
            ].map((st, i) => (
              <button
                key={i}
                onClick={() => onNavigate(st.screen as ScreenId)}
                className={`p-2.5 rounded-lg text-left transition-all ${
                  st.highlight
                    ? 'bg-amber-500/20 border border-amber-500/40 text-amber-200'
                    : 'bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 text-slate-300'
                }`}
              >
                <div className="text-[10px] text-slate-400 font-mono">{st.step}</div>
                <div className="font-semibold text-white mt-0.5">{st.name}</div>
                <div className="text-[11px] text-slate-400 mt-1 truncate">{st.count}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="등록 상품 및 등급 분포"
          value={`${totalProducts}개`}
          kicker="S급: "
          subtext={`S급 ${gradeCount.S}개 · A급 ${gradeCount.A}개 · B/C급 ${gradeCount.B + gradeCount.C}개`}
          icon={<Package className="w-4 h-4" />}
          change={`${Math.round(((gradeCount.S + gradeCount.A) / (totalProducts || 1)) * 100)}% 우수 등급`}
          changeType="positive"
        />

        <MetricCard
          label="인정 제휴 수수료 (합계)"
          value={`${totalCommission.toLocaleString()}원`}
          kicker="수기/리포트 대조"
          subtext={`인정 주문 ${totalOrders}건 (객단가 분석)`}
          icon={<Coins className="w-4 h-4" />}
          change="수동 입력 실적 검증"
          changeType="neutral"
        />

        <MetricCard
          label="댓글 자동 DM 발송"
          value={`${totalDmSent}건`}
          kicker="트리거 응답"
          subtext="24시간 중복 방지 쿨다운 적용 중"
          icon={<Send className="w-4 h-4" />}
          change={`${totalClicks}회 링크 클릭 연결`}
          changeType="positive"
        />

        <MetricCard
          label="검수 대기 및 승인 현황"
          value={`${reviewRequiredPosts.length}건 대기`}
          kicker="광고 지침 필수 심사"
          subtext={`승인 완료 ${approvedPosts.length}건 · 예약/발행 ${scheduledPosts.length}건`}
          icon={<ShieldAlert className="w-4 h-4" />}
          change={reviewRequiredPosts.length > 0 ? '즉시 검수 필요' : '모든 게시물 검수 완료'}
          changeType={reviewRequiredPosts.length > 0 ? 'negative' : 'positive'}
        />
      </div>

      {/* 2-Column: Candidate Products & DM Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: High Score Candidate Products */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">콘텐츠화 추천 상위 상품</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                수요 신호(25), 가격 경쟁력(20), 콘텐츠 매력(20) 가중치 합산 100점 평가
              </p>
            </div>
            <button
              onClick={() => onNavigate('products')}
              className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
            >
              전체 보기 <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {products.slice(0, 4).map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-lg border border-slate-200 hover:border-slate-300 transition-all bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs">
                    <ScoreGauge totalScore={p.totalScore} grade={p.grade} compact />
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-500 font-medium">{p.category}</span>
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-700 font-semibold">{p.price.toLocaleString()}원</span>
                  </div>

                  <div className="font-semibold text-sm text-slate-900 truncate">
                    {p.name}
                  </div>

                  <div className="text-[11px] text-slate-500 line-clamp-1">
                    <span className="font-medium text-slate-600">출처:</span> {p.source}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onSelectProductForCarousel(p.id)}
                    className="px-3 py-1.5 text-xs font-medium bg-sky-600 text-white rounded-md hover:bg-sky-500 transition-colors flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>캐러셀 편집</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Recent DM & Compliance status */}
        <div className="space-y-6">
          {/* Compliance Card */}
          <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-5">
            <div className="flex items-center gap-2 text-emerald-800 font-semibold text-xs mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>공정거래위원회 표시·광고 지침 준수</span>
            </div>
            <p className="text-xs text-emerald-900/80 leading-relaxed mt-1">
              "이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다."
              문구가 캐러셀 및 캡션에 강제 적용됩니다.
            </p>
            <div className="mt-3 pt-3 border-t border-emerald-200/60 text-[11px] text-emerald-800 flex justify-between">
              <span>허위 체험기 방지 필터:</span>
              <span className="font-semibold">작동 중</span>
            </div>
          </div>

          {/* Recent Comment DM Dispatch Feed */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900">최근 댓글 DM 반응</h3>
              <button
                onClick={() => onNavigate('comment-dm')}
                className="text-xs text-sky-600 hover:text-sky-700 font-medium"
              >
                전체 로그
              </button>
            </div>

            <div className="space-y-3">
              {commentLogs.slice(0, 3).map((log) => (
                <div key={log.id} className="text-xs border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">@{log.username}</span>
                    <span className="text-[10px] text-slate-400">{log.receivedAt.slice(11)}</span>
                  </div>
                  <div className="text-slate-600 mt-1 truncate">
                    "{log.commentText}"
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-[11px]">
                    <span className="px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 font-medium">
                      키워드: {log.matchedKeyword}
                    </span>
                    <span
                      className={`font-medium ${
                        log.status === 'SENT'
                          ? 'text-emerald-600'
                          : log.status === 'COOLDOWN_ACTIVE'
                          ? 'text-amber-600'
                          : 'text-rose-600'
                      }`}
                    >
                      {log.status === 'SENT' ? '발송 완료' : log.status === 'COOLDOWN_ACTIVE' ? '중복 쿨다운' : '실패'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

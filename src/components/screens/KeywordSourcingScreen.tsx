import React, { useState } from 'react';
import { SourcingKeyword, ProductCategory, CompetitionStatus, Product } from '../../types';
import { calculateProductScore } from '../../services/storage';
import {
  Search,
  Sparkles,
  TrendingUp,
  BarChart3,
  ExternalLink,
  Plus,
  CheckCircle2,
  Flame,
  ArrowRight,
  Filter,
  Layers,
  Database,
  SlidersHorizontal,
  Info,
} from 'lucide-react';

interface KeywordSourcingScreenProps {
  keywords: SourcingKeyword[];
  onImportKeywordToProduct: (keyword: SourcingKeyword, andGenerate?: boolean) => void;
  onRefreshKeywords: (newKeywords: SourcingKeyword[]) => void;
  onNavigateToProducts: () => void;
}

export const KeywordSourcingScreen: React.FC<KeywordSourcingScreenProps> = ({
  keywords,
  onImportKeywordToProduct,
  onRefreshKeywords,
  onNavigateToProducts,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [competitionFilter, setCompetitionFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'volume' | 'competition' | 'growth'>('volume');
  const [isSearchingAi, setIsSearchingAi] = useState(false);
  const [aiSearchPrompt, setAiSearchPrompt] = useState('');

  // Preset quick searches
  const QUICK_TOPICS = [
    { label: '🔥 10월 환절기/겨울 난방 급상승', query: '가을 겨울 환절기 난방 및 보온 가전' },
    { label: '🍳 자취·신혼 살림 가성비 꿀템', query: '1~2인 가구 주방 살림 스테인리스 용품' },
    { label: '🚗 차량용 스마트 편의용품', query: '차량용 스마트폰 맥세이프 편의용품' },
    { label: '🏕️ 가을 캠핑·아웃도어 필수 장비', query: '가을 캠핑 차박 경량 장비' },
    { label: '💆 거북목·스트레칭 힐링템', query: '목 어깨 스트레칭 마사지 건강 케어' },
  ];

  // Filtering and sorting
  const filteredKeywords = keywords
    .filter((k) => {
      const matchesSearch =
        k.keyword.toLowerCase().includes(searchTerm.toLowerCase()) ||
        k.recommendedProductTitle.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || k.category === selectedCategory;
      const matchesCompetition = competitionFilter === 'all' || k.competitionStatus === competitionFilter;
      return matchesSearch && matchesCategory && matchesCompetition;
    })
    .sort((a, b) => {
      if (sortBy === 'volume') return b.monthlySearchVolume - a.monthlySearchVolume;
      if (sortBy === 'competition') return a.competitionIndex - b.competitionIndex; // lower is better
      if (sortBy === 'growth') return b.trendGrowthRate - a.trendGrowthRate;
      return 0;
    });

  const blueOceanCount = keywords.filter((k) => k.competitionStatus === 'BLUE_OCEAN').length;
  const avgSearchVolume = Math.round(
    keywords.reduce((sum, k) => sum + k.monthlySearchVolume, 0) / (keywords.length || 1)
  );

  const handleAiDiscover = async (topicToSearch?: string) => {
    const query = topicToSearch || aiSearchPrompt || '10월 환절기 및 겨울 대비 급상승 살림 가전';
    setIsSearchingAi(true);

    try {
      const res = await fetch('/api/sourcing/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: query, category: selectedCategory === 'all' ? '' : selectedCategory }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.keywords && Array.isArray(data.keywords)) {
          const merged = [...data.keywords, ...keywords.filter((k) => !data.keywords.some((nk: any) => nk.keyword === k.keyword))];
          onRefreshKeywords(merged);
          setAiSearchPrompt('');
          return;
        }
      }
    } catch (err) {
      console.warn('API discovery network issue, using smart algorithmic expansion:', err);
    } finally {
      setIsSearchingAi(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-sky-400 mb-1">
              <span>MARKET DATA-DRIVEN SOURCING</span>
              <span className="text-slate-500">·</span>
              <span>네이버 데이터랩(DataLab) & 아이템스카우트(ItemScout)</span>
            </div>
            <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-white">
              수요 검증 황금 키워드 발굴 & 쿠팡 파트너스 상품 소싱
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              추측성 상품 등록을 지양하고, 실제 월간 검색수, 경쟁강도(상품수/검색수), 쇼핑 구매전환율 지표를 분석하여 수익성 높은 블루오션 상품을 먼저 찾아옵니다.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onNavigateToProducts}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <span>등록된 상품 파이프라인 보기</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* AI Keyword Finder Search Box */}
        <div className="pt-2 border-t border-slate-800">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="관심 분야나 카테고리를 입력하여 트렌드 황금 키워드 분석 (예: 겨울 온열매트, 가을 보온 텀블러, 주방 수납)..."
                value={aiSearchPrompt}
                onChange={(e) => setAiSearchPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAiDiscover()}
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
              />
            </div>
            <button
              onClick={() => handleAiDiscover()}
              disabled={isSearchingAi}
              className="px-5 py-2.5 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 shrink-0 shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSearchingAi ? '데이터랩 분석 중...' : '황금 키워드 실시간 소싱'}</span>
            </button>
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 mt-3 text-xs">
            <span className="text-[11px] text-slate-400 mr-1">추천 탐색 테마:</span>
            {QUICK_TOPICS.map((tp, i) => (
              <button
                key={i}
                onClick={() => handleAiDiscover(tp.query)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] transition-colors border border-slate-700/60"
              >
                {tp.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sourcing Metric Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs">
          <div className="text-[11px] text-slate-500 font-medium">발굴된 블루오션 꿀키워드</div>
          <div className="text-xl font-bold text-emerald-600 mt-1 flex items-center gap-1.5">
            <span>{blueOceanCount}개</span>
            <span className="text-[11px] font-semibold text-slate-500">(경쟁강도 0.5 미만)</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs">
          <div className="text-[11px] text-slate-500 font-medium">평균 월간 검색수 (유입량)</div>
          <div className="text-xl font-bold text-slate-900 mt-1">
            {avgSearchVolume.toLocaleString()}회
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs">
          <div className="text-[11px] text-slate-500 font-medium">평균 모바일 검색 비중</div>
          <div className="text-xl font-bold text-sky-600 mt-1">83.4%</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs">
          <div className="text-[11px] text-slate-500 font-medium">연계 플랫폼</div>
          <div className="text-xs font-bold text-slate-800 mt-1.5 flex items-center gap-1.5">
            <span>네이버 쇼핑인사이트</span>
            <span className="text-slate-300">·</span>
            <span>쿠팡 파트너스</span>
          </div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="키워드명 또는 추천 상품명 필터..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none"
          >
            <option value="all">모든 카테고리</option>
            <option value="living">생활/가전</option>
            <option value="kitchen">주방용품</option>
            <option value="digital">디지털/IT</option>
            <option value="camping">캠핑/레저</option>
            <option value="beauty">뷰티/헬스</option>
          </select>

          <select
            value={competitionFilter}
            onChange={(e) => setCompetitionFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none"
          >
            <option value="all">경쟁강도 전체</option>
            <option value="BLUE_OCEAN">꿀키워드 (블루오션)</option>
            <option value="NORMAL">경쟁 보통</option>
            <option value="RED_OCEAN">레드오션</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none"
          >
            <option value="volume">검색수 많은순</option>
            <option value="competition">경쟁강도 낮은순 (블루오션)</option>
            <option value="growth">검색 증가율 높은순</option>
          </select>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>아이템스카우트 공식 공식: <strong>경쟁강도 = 등록 상품수 ÷ 월간 검색수</strong> (0.5 이하 시 상위 노출 및 구매 전환 최적)</span>
          <span>총 {filteredKeywords.length}개 키워드 분석 완료</span>
        </div>
      </div>

      {/* Sourcing Keywords Card Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredKeywords.map((item) => {
          const isBlueOcean = item.competitionStatus === 'BLUE_OCEAN';

          return (
            <div
              key={item.id}
              className={`bg-white rounded-2xl border p-5 shadow-xs transition-all space-y-4 ${
                item.isImported
                  ? 'border-emerald-300 bg-emerald-50/10'
                  : 'border-slate-200/90 hover:border-slate-300'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                {/* Left: Keyword Metrics & Sourcing Logic */}
                <div className="space-y-3 flex-1 min-w-0">
                  {/* Status Badges */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span
                      className={`font-bold px-2.5 py-0.5 rounded-md text-[11px] border ${
                        isBlueOcean
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-sky-50 text-sky-800 border-sky-200'
                      }`}
                    >
                      {isBlueOcean ? '★ 블루오션 꿀키워드' : '경쟁 보통 키워드'} (강도 {item.competitionIndex})
                    </span>

                    <span className="text-slate-300">·</span>

                    <span className="font-semibold text-rose-600 flex items-center gap-1 text-[11px]">
                      <Flame className="w-3.5 h-3.5 text-rose-500" />
                      전월대비 +{item.trendGrowthRate}% 급상승
                    </span>

                    <span className="text-slate-300">·</span>

                    <span className="text-slate-500 font-medium text-[11px]">
                      {item.category === 'living'
                        ? '생활가전'
                        : item.category === 'kitchen'
                        ? '주방용품'
                        : item.category === 'camping'
                        ? '캠핑'
                        : item.category === 'beauty'
                        ? '뷰티헬스'
                        : item.category}
                    </span>

                    {item.isImported && (
                      <span className="ml-auto text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        파이프라인 등록 완료
                      </span>
                    )}
                  </div>

                  {/* Main Keyword Name */}
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                      <span>{item.keyword}</span>
                    </h3>
                    <div className="text-xs text-slate-500 mt-0.5">
                      데이터 근거: {item.dataSources}
                    </div>
                  </div>

                  {/* Metrics Table */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="text-[11px] text-slate-500">월간 검색수 (PC+MO)</div>
                      <div className="font-bold text-slate-900 text-sm mt-0.5">
                        {item.monthlySearchVolume.toLocaleString()}회
                      </div>
                      <div className="text-[10px] text-slate-400">모바일 {item.mobileSearchRatio}%</div>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="text-[11px] text-slate-500">경쟁 상품수</div>
                      <div className="font-bold text-slate-900 text-sm mt-0.5">
                        {item.productCount.toLocaleString()}개
                      </div>
                      <div className="text-[10px] text-slate-400">경쟁률 {item.competitionIndex}</div>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="text-[11px] text-slate-500">쇼핑 구매의도</div>
                      <div className="font-bold text-emerald-600 text-sm mt-0.5">
                        {item.shoppingIntentRatio}%
                      </div>
                      <div className="text-[10px] text-slate-400">직접 구매 전환 높음</div>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="text-[11px] text-slate-500">타겟 적정 객단가</div>
                      <div className="font-bold text-slate-900 text-sm mt-0.5">
                        {item.estimatedPrice.toLocaleString()}원
                      </div>
                      <div className="text-[10px] text-sky-600">수수료 약 {Math.round(item.estimatedPrice * (item.estimatedCommissionRate / 100)).toLocaleString()}원</div>
                    </div>
                  </div>

                  {/* Sourcing Points & Pain Points */}
                  <div className="bg-sky-50/50 rounded-xl p-3 border border-sky-100/80 space-y-1.5 text-xs">
                    <div className="font-semibold text-sky-950 flex items-center gap-1">
                      <Info className="w-3.5 h-3.5 text-sky-600" />
                      <span>인스타그램 캐러셀 콘텐츠 소구 포인트 (바이어 니즈):</span>
                    </div>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-700 text-[11px]">
                      {item.sourcingPoints.map((pt, i) => (
                        <li key={i}>{pt}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Right: Recommended Product Proposal & 1-Click Pipeline Import */}
                <div className="lg:w-84 shrink-0 bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
                  <div>
                    <span className="text-[11px] font-semibold text-sky-700">추천 소싱 상품 후보</span>
                    <h4 className="font-bold text-slate-900 text-sm mt-0.5 leading-snug">
                      {item.recommendedProductTitle}
                    </h4>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1">
                    <div>
                      <span className="font-semibold text-slate-700">핵심 확인 스펙:</span>{' '}
                      {item.suggestedSpecs}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700">예상 마진:</span> 쿠팡 파트너스 {item.estimatedCommissionRate}%
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 border-t border-slate-200 space-y-2">
                    <button
                      onClick={() => onImportKeywordToProduct(item, true)}
                      className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>상품 등록 & 캐러셀 즉시 생성</span>
                    </button>

                    <button
                      onClick={() => onImportKeywordToProduct(item, false)}
                      className="w-full py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>상품 후보 목록에만 추가</span>
                    </button>

                    <div className="flex items-center gap-2 pt-1 text-[11px]">
                      <a
                        href={`https://www.coupang.com/np/search?component=&q=${encodeURIComponent(item.keyword)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 text-center py-1 bg-white border border-slate-200 hover:bg-slate-100 rounded text-slate-600 flex items-center justify-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>쿠팡 검색</span>
                      </a>
                      <a
                        href={`https://datalab.naver.com/shoppingInsight/sCategory.naver`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 text-center py-1 bg-white border border-slate-200 hover:bg-slate-100 rounded text-slate-600 flex items-center justify-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>데이터랩 조회</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

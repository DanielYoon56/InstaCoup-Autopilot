import React, { useState } from 'react';
import { PostContent, CarouselSlide, Product, SlideType } from '../../types';
import { SlideCanvasPreview } from './SlideCanvasPreview';
import { renderSlideToCanvas, downloadCanvasAsPng } from '../../utils/canvasExporter';
import {
  Download,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Check,
  AlertCircle,
  FileText,
  Layers,
  ArrowRight,
  Info,
} from 'lucide-react';

interface CarouselEditorScreenProps {
  posts: PostContent[];
  products: Product[];
  currentPostId?: string;
  onSelectPost: (postId: string) => void;
  onUpdatePost: (post: PostContent) => void;
  onNavigateToCaption: (postId: string) => void;
  onNavigateToReview: (postId: string) => void;
}

const SLIDE_TYPE_NAMES: Record<SlideType, { label: string; desc: string }> = {
  HOOK: { label: '01. 첫 장 훅', desc: '관심 유발 및 문제 제기' },
  CRITERIA: { label: '02. 선택 기준', desc: '실패 없는 구매 기준 3가지' },
  FEATURES: { label: '03. 확인된 특징', desc: '공식 고시정보 기반 스펙' },
  COMPARISON: { label: '04. 비교 주의점', desc: '타사/기존 대비 장단점 대조' },
  TIPS: { label: '05. 사용·보관 팁', desc: '올바른 세척 및 수명 연장' },
  CHECKLIST: { label: '06. 체크리스트', desc: '결제 전 3초 최종 점검' },
  CTA_DISCLOSURE: { label: '07. 댓글 참여·고지', desc: '댓글 링크 유도 및 공정위 고지' },
};

export const CarouselEditorScreen: React.FC<CarouselEditorScreenProps> = ({
  posts,
  products,
  currentPostId,
  onSelectPost,
  onUpdatePost,
  onNavigateToCaption,
  onNavigateToReview,
}) => {
  const activePost = posts.find((p) => p.id === currentPostId) || posts[0];
  const activeProduct = products.find((p) => p.id === activePost?.productId);

  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isBulkExporting, setIsBulkExporting] = useState(false);

  if (!activePost) {
    return (
      <div className="p-12 text-center text-slate-500 max-w-md mx-auto space-y-3">
        <Layers className="w-10 h-10 text-slate-400 mx-auto" />
        <h3 className="text-base font-bold text-slate-800">제작된 캐러셀이 없습니다.</h3>
        <p className="text-xs text-slate-500">
          상품 목록에서 원하는 상품을 선택하여 "캐러셀 콘텐츠 생성"을 시작하세요.
        </p>
      </div>
    );
  }

  const currentSlide = activePost.carousel[activeSlideIndex] || activePost.carousel[0];

  const handleSlideFieldChange = (field: keyof CarouselSlide, value: any) => {
    const updatedCarousel = [...activePost.carousel];
    updatedCarousel[activeSlideIndex] = {
      ...updatedCarousel[activeSlideIndex],
      [field]: value,
    };
    onUpdatePost({
      ...activePost,
      carousel: updatedCarousel,
      status: activePost.status === 'APPROVED' ? 'REVIEW_REQUIRED' : activePost.status,
    });
  };

  const handleBulletChange = (index: number, text: string) => {
    const bullets = [...(currentSlide.bulletPoints || [])];
    bullets[index] = text;
    handleSlideFieldChange('bulletPoints', bullets);
  };

  const handleAspectRatioToggle = (ratio: '1:1' | '4:5') => {
    onUpdatePost({
      ...activePost,
      aspectRatio: ratio,
    });
  };

  const handleBulkExportPng = async () => {
    setIsBulkExporting(true);
    try {
      for (let i = 0; i < activePost.carousel.length; i++) {
        const slide = activePost.carousel[i];
        const canvas = await renderSlideToCanvas(slide, activePost.carousel.length, {
          aspectRatio: activePost.aspectRatio,
          productName: activePost.productName,
        });
        const filename = `${activePost.productName.slice(0, 10)}_슬라이드${slide.slideNumber}_${slide.slideType}.png`;
        downloadCanvasAsPng(canvas, filename);
        // Small delay between downloads so browser doesn't block multiple files
        await new Promise((res) => setTimeout(res, 350));
      }
    } catch (err) {
      console.error('Bulk export failed:', err);
    } finally {
      setIsBulkExporting(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header & Post Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span className="font-semibold text-slate-700">작업 대상:</span>
            <span>{activeProduct?.category}</span>
            <span>·</span>
            <span>{activeProduct?.price.toLocaleString()}원</span>
            <span>·</span>
            <span
              className={`font-semibold ${
                activePost.status === 'APPROVED'
                  ? 'text-emerald-600'
                  : activePost.status === 'REVIEW_REQUIRED'
                  ? 'text-amber-600'
                  : 'text-slate-600'
              }`}
            >
              상태: {activePost.status}
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 truncate">
            {activePost.productName}
          </h2>
        </div>

        {/* Post Dropdown & Ratio & Export */}
        <div className="flex flex-wrap items-center gap-2">
          {posts.length > 1 && (
            <select
              value={activePost.id}
              onChange={(e) => {
                onSelectPost(e.target.value);
                setActiveSlideIndex(0);
              }}
              className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none"
            >
              {posts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.productName.slice(0, 25)}...
                </option>
              ))}
            </select>
          )}

          {/* Aspect Ratio Switch */}
          <div className="inline-flex items-center p-1 bg-slate-100 rounded-lg text-xs font-medium">
            <button
              onClick={() => handleAspectRatioToggle('1:1')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                activePost.aspectRatio === '1:1'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              1:1 정사각형
            </button>
            <button
              onClick={() => handleAspectRatioToggle('4:5')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                activePost.aspectRatio === '4:5'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              4:5 세로형
            </button>
          </div>

          {/* Bulk PNG Download Button */}
          <button
            onClick={handleBulkExportPng}
            disabled={isBulkExporting}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>
              {isBulkExporting ? '전체 PNG 저장 중...' : `전체 (${activePost.carousel.length}장) PNG 다운로드`}
            </span>
          </button>
        </div>
      </div>

      {/* Slide Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200">
        {activePost.carousel.map((slide, idx) => {
          const isCurrent = idx === activeSlideIndex;
          const meta = SLIDE_TYPE_NAMES[slide.slideType] || { label: `슬라이드 ${idx + 1}` };
          return (
            <button
              key={idx}
              onClick={() => setActiveSlideIndex(idx)}
              className={`px-3 py-2 text-xs rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                isCurrent
                  ? 'bg-sky-600 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span>{meta.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Studio 2-Column: Left Canvas Preview, Right Form Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Visual Canvas Preview */}
        <div className="lg:col-span-5 bg-slate-50/70 p-6 rounded-2xl border border-slate-200 flex flex-col items-center">
          <div className="w-full flex items-center justify-between text-xs text-slate-500 mb-3 px-1">
            <span className="font-semibold text-slate-700">
              슬라이드 {activeSlideIndex + 1} / {activePost.carousel.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={activeSlideIndex === 0}
                onClick={() => setActiveSlideIndex((prev) => Math.max(0, prev - 1))}
                className="p-1 rounded hover:bg-slate-200 text-slate-600 disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={activeSlideIndex === activePost.carousel.length - 1}
                onClick={() =>
                  setActiveSlideIndex((prev) => Math.min(activePost.carousel.length - 1, prev + 1))
                }
                className="p-1 rounded hover:bg-slate-200 text-slate-600 disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <SlideCanvasPreview
            slide={currentSlide}
            totalSlides={activePost.carousel.length}
            productName={activePost.productName}
            aspectRatio={activePost.aspectRatio}
          />

          {/* Ethics Rule Alert */}
          <div className="mt-4 p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-[11px] text-amber-900 leading-relaxed w-full">
            <div className="font-semibold text-amber-950 flex items-center gap-1 mb-0.5">
              <Info className="w-3.5 h-3.5 text-amber-700" />
              <span>콘텐츠 진실성 원칙</span>
            </div>
            허위 후기("실제 써보니 대박" 등) 및 확인되지 않은 효능 문구는 생성·게재되지 않습니다. 모든 슬라이드는 공인 출처와 사실에 근거합니다.
          </div>
        </div>

        {/* Right Column: Slide Content Editor */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[11px] font-semibold text-sky-600">
                {SLIDE_TYPE_NAMES[currentSlide.slideType]?.label}
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">
                슬라이드 텍스트 및 사양 편집
              </h3>
            </div>
            <div className="text-xs text-slate-400">
              {SLIDE_TYPE_NAMES[currentSlide.slideType]?.desc}
            </div>
          </div>

          <div className="space-y-3 text-xs">
            {/* Title */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                슬라이드 헤드라인 제목
              </label>
              <input
                type="text"
                value={currentSlide.title}
                onChange={(e) => handleSlideFieldChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>

            {/* Subtitle */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">부제목 / 강조 문구</label>
              <input
                type="text"
                value={currentSlide.subtitle || ''}
                onChange={(e) => handleSlideFieldChange('subtitle', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>

            {/* Body */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">본문 설명 문장</label>
              <textarea
                rows={2}
                value={currentSlide.body}
                onChange={(e) => handleSlideFieldChange('body', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg leading-relaxed focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>

            {/* Bullet Points */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                핵심 포인트 요약 (불릿 리스트)
              </label>
              <div className="space-y-2">
                {(currentSlide.bulletPoints || []).map((bp, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-5 text-center font-bold text-slate-400 text-[11px]">
                      {i + 1}.
                    </span>
                    <input
                      type="text"
                      value={bp}
                      onChange={(e) => handleBulletChange(i, e.target.value)}
                      className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Fact Source & AI Graphic tag */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  상품 사실 출처 (공인 문서)
                </label>
                <input
                  type="text"
                  value={currentSlide.factSource}
                  onChange={(e) => handleSlideFieldChange('factSource', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  이미지 표시 및 권한 고지
                </label>
                <div className="flex items-center h-9 px-3 border border-slate-200 rounded-lg bg-slate-50 gap-2">
                  <input
                    type="checkbox"
                    id="aiGraphicCheck"
                    checked={currentSlide.isAIGeneratedGraphic}
                    onChange={(e) =>
                      handleSlideFieldChange('isAIGeneratedGraphic', e.target.checked)
                    }
                    className="accent-sky-600 rounded"
                  />
                  <label htmlFor="aiGraphicCheck" className="text-slate-700 cursor-pointer">
                    설명용 그래픽 표기 적용
                  </label>
                </div>
              </div>
            </div>

            {/* Visual Prompt Guideline */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                시각 연출 및 촬영 가이드 프롬프트
              </label>
              <input
                type="text"
                value={currentSlide.visualPrompt}
                onChange={(e) => handleSlideFieldChange('visualPrompt', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
          </div>

          {/* Stepper Footer Action Bar */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-[11px] text-slate-500">
              캐러셀 수정 시 자동으로 검수 필요(REVIEW_REQUIRED) 상태로 전환됩니다.
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigateToCaption(activePost.id)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>캡션 및 해시태그 편집</span>
              </button>

              <button
                onClick={() => onNavigateToReview(activePost.id)}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>검수 대기함으로 이동</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

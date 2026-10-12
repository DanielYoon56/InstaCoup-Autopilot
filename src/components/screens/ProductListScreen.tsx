import React, { useState } from 'react';
import { Product, ProductCategory, ScoreBreakdown } from '../../types';
import { ScoreGauge } from '../common/ScoreGauge';
import { calculateProductScore, SCORE_WEIGHTS } from '../../services/storage';
import {
  Search,
  Filter,
  Plus,
  Sparkles,
  ExternalLink,
  SlidersHorizontal,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Clock,
  Layers,
} from 'lucide-react';

interface ProductListScreenProps {
  products: Product[];
  onOpenRegisterModal: () => void;
  onGeneratePostForProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
}

export const ProductListScreen: React.FC<ProductListScreenProps> = ({
  products,
  onOpenRegisterModal,
  onGeneratePostForProduct,
  onUpdateProduct,
  onDeleteProduct,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [editingScoreProduct, setEditingScoreProduct] = useState<Product | null>(null);

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.specification.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.keywords.some((k) => k.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    const matchesGrade = gradeFilter === 'all' || p.grade === gradeFilter;

    return matchesSearch && matchesCategory && matchesGrade;
  });

  const handleScoreChange = (field: keyof ScoreBreakdown, val: number) => {
    if (!editingScoreProduct) return;
    const newScores = { ...editingScoreProduct.scores, [field]: val };
    const { totalScore, grade } = calculateProductScore(newScores);
    setEditingScoreProduct({
      ...editingScoreProduct,
      scores: newScores,
      totalScore,
      grade,
    });
  };

  const handleSaveScore = () => {
    if (!editingScoreProduct) return;
    onUpdateProduct(editingScoreProduct);
    setEditingScoreProduct(null);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            상품 후보 목록 및 6대 가중치 평가
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            확인 시각과 공인 출처가 검증된 상품만 관리합니다. 추정치 기입을 엄격히 배제합니다.
          </p>
        </div>

        <button
          onClick={onOpenRegisterModal}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 shrink-0 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>상품 신규 등록</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="상품명, 스펙, 콘텐츠 키워드 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          >
            <option value="all">모든 카테고리</option>
            <option value="kitchen">주방용품</option>
            <option value="living">생활/가전</option>
            <option value="digital">디지털/IT</option>
            <option value="camping">캠핑/아웃도어</option>
            <option value="fashion">패션/잡화</option>
            <option value="food">식품/건강</option>
          </select>

          {/* Grade Filter */}
          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          >
            <option value="all">전체 평가 등급</option>
            <option value="S">S등급 (85점 이상)</option>
            <option value="A">A등급 (70~84점)</option>
            <option value="B">B등급 (55~69점)</option>
            <option value="C">C등급 (54점 이하)</option>
          </select>
        </div>

        {/* Scoring Weights Info Bar */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">기본 평가 가중치:</span>
            <span>수요 신호 (25)</span>
            <span>·</span>
            <span>가격 경쟁력 (20)</span>
            <span>·</span>
            <span>콘텐츠 매력 (20)</span>
            <span>·</span>
            <span>계절성 (15)</span>
            <span>·</span>
            <span>신뢰도 (10)</span>
            <span>·</span>
            <span>구매 편의성 (10)</span>
          </div>
          <div>총 {filteredProducts.length}개 상품 표시 중</div>
        </div>
      </div>

      {/* Product List Cards */}
      <div className="grid grid-cols-1 gap-4">
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
            <p className="text-sm font-medium">검색 조건에 맞는 상품이 없습니다.</p>
            <p className="text-xs text-slate-400 mt-1">새로운 상품을 등록하거나 필터를 초기화하세요.</p>
          </div>
        ) : (
          filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs hover:border-slate-300 transition-all space-y-4"
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                {/* Main Product Info */}
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs">
                    <ScoreGauge totalScore={product.totalScore} grade={product.grade} compact />
                    <span className="text-slate-300">·</span>
                    <span className="text-slate-600 font-medium">
                      {product.category === 'kitchen'
                        ? '주방'
                        : product.category === 'living'
                        ? '생활가전'
                        : product.category === 'digital'
                        ? '디지털'
                        : product.category === 'camping'
                        ? '캠핑'
                        : product.category}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="text-slate-900 font-bold text-sm">
                      {product.price.toLocaleString()}원
                    </span>
                    {product.regularPrice && (
                      <span className="text-slate-400 line-through text-[11px]">
                        {product.regularPrice.toLocaleString()}원
                      </span>
                    )}
                    <span className="text-slate-300">·</span>
                    <span
                      className={`text-[11px] font-semibold ${
                        product.verifiedStockStatus === 'IN_STOCK'
                          ? 'text-emerald-600'
                          : product.verifiedStockStatus === 'LOW_STOCK'
                          ? 'text-amber-600'
                          : 'text-rose-600'
                      }`}
                    >
                      {product.verifiedStockStatus === 'IN_STOCK'
                        ? '로켓배송 재고확인'
                        : product.verifiedStockStatus === 'LOW_STOCK'
                        ? '소량 재고 잔여'
                        : '품절 유의'}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 tracking-tight leading-snug">
                    {product.name}
                  </h3>

                  <div className="text-xs text-slate-600 leading-relaxed">
                    <span className="font-semibold text-slate-700">공식 규격:</span>{' '}
                    {product.specification}
                  </div>

                  {/* Fact Verification Metadata (strictly verified) */}
                  <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-600 space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>확인 시각: {product.verifiedAt}</span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      <span className="font-medium text-slate-600">공인 출처:</span> {product.source}
                    </div>
                    {product.notes && (
                      <div className="text-[11px] text-slate-600 italic">
                        ※ {product.notes}
                      </div>
                    )}
                  </div>

                  {/* Keywords */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {product.keywords.map((kw, i) => (
                      <span key={i} className="text-[11px] text-slate-500 font-medium">
                        #{kw}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Score Breakdown & Action Buttons */}
                <div className="lg:w-80 shrink-0 space-y-3 bg-slate-50/70 p-4 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-800">평가 점수 상세</span>
                    <button
                      onClick={() => setEditingScoreProduct({ ...product })}
                      className="text-[11px] text-sky-600 hover:text-sky-700 font-medium flex items-center gap-1"
                    >
                      <SlidersHorizontal className="w-3 h-3" />
                      점수 조정
                    </button>
                  </div>

                  <ScoreGauge
                    totalScore={product.totalScore}
                    grade={product.grade}
                    scores={product.scores}
                  />

                  <div className="pt-2 border-t border-slate-200/60 flex flex-col gap-2">
                    <button
                      onClick={() => onGeneratePostForProduct(product)}
                      className="w-full py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>캐러셀 & 캡션 콘텐츠 생성</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <a
                        href={product.affiliateUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 py-1.5 px-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-[11px] rounded-lg transition-colors flex items-center justify-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>제휴 링크 확인</span>
                      </a>
                      <button
                        onClick={() => onDeleteProduct(product.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="상품 삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Score Editing Modal */}
      {editingScoreProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-5 border border-slate-200">
            <div>
              <div className="text-xs font-semibold text-sky-600">가중치 점수 미세조정</div>
              <h3 className="text-base font-bold text-slate-900 mt-0.5 truncate">
                {editingScoreProduct.name}
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between font-medium text-slate-700 mb-1">
                  <span>수요 신호 (0~25점)</span>
                  <span className="font-bold text-sky-600">
                    {editingScoreProduct.scores.demandSignal}점
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="25"
                  value={editingScoreProduct.scores.demandSignal}
                  onChange={(e) => handleScoreChange('demandSignal', Number(e.target.value))}
                  className="w-full accent-sky-600"
                />
              </div>

              <div>
                <div className="flex justify-between font-medium text-slate-700 mb-1">
                  <span>가격 경쟁력 (0~20점)</span>
                  <span className="font-bold text-sky-600">
                    {editingScoreProduct.scores.priceCompetitiveness}점
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={editingScoreProduct.scores.priceCompetitiveness}
                  onChange={(e) => handleScoreChange('priceCompetitiveness', Number(e.target.value))}
                  className="w-full accent-sky-600"
                />
              </div>

              <div>
                <div className="flex justify-between font-medium text-slate-700 mb-1">
                  <span>콘텐츠 매력 (0~20점)</span>
                  <span className="font-bold text-sky-600">
                    {editingScoreProduct.scores.contentAppeal}점
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={editingScoreProduct.scores.contentAppeal}
                  onChange={(e) => handleScoreChange('contentAppeal', Number(e.target.value))}
                  className="w-full accent-sky-600"
                />
              </div>

              <div>
                <div className="flex justify-between font-medium text-slate-700 mb-1">
                  <span>계절성 (0~15점)</span>
                  <span className="font-bold text-sky-600">
                    {editingScoreProduct.scores.seasonality}점
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="15"
                  value={editingScoreProduct.scores.seasonality}
                  onChange={(e) => handleScoreChange('seasonality', Number(e.target.value))}
                  className="w-full accent-sky-600"
                />
              </div>

              <div>
                <div className="flex justify-between font-medium text-slate-700 mb-1">
                  <span>정보 신뢰도 (0~10점)</span>
                  <span className="font-bold text-sky-600">
                    {editingScoreProduct.scores.infoReliability}점
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={editingScoreProduct.scores.infoReliability}
                  onChange={(e) => handleScoreChange('infoReliability', Number(e.target.value))}
                  className="w-full accent-sky-600"
                />
              </div>

              <div>
                <div className="flex justify-between font-medium text-slate-700 mb-1">
                  <span>구매 편의성 (0~10점)</span>
                  <span className="font-bold text-sky-600">
                    {editingScoreProduct.scores.purchaseConvenience}점
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={editingScoreProduct.scores.purchaseConvenience}
                  onChange={(e) => handleScoreChange('purchaseConvenience', Number(e.target.value))}
                  className="w-full accent-sky-600"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500">재계산 결과:</span>
                <div className="font-bold text-slate-900 text-sm">
                  {editingScoreProduct.totalScore}점 ({editingScoreProduct.grade}등급)
                </div>
              </div>
              <ScoreGauge
                totalScore={editingScoreProduct.totalScore}
                grade={editingScoreProduct.grade}
                compact
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setEditingScoreProduct(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSaveScore}
                className="px-4 py-2 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition-colors"
              >
                점수 저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

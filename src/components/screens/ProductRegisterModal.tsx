import React, { useState } from 'react';
import { Product, ProductCategory, ScoreBreakdown } from '../../types';
import { calculateProductScore } from '../../services/storage';
import { ScoreGauge } from '../common/ScoreGauge';
import { X, Sparkles, Check, AlertCircle } from 'lucide-react';

interface ProductRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product, andGenerate?: boolean) => void;
}

export const ProductRegisterModal: React.FC<ProductRegisterModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate()
  ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(
    2,
    '0'
  )} KST`;

  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProductCategory>('kitchen');
  const [originalUrl, setOriginalUrl] = useState('');
  const [affiliateUrl, setAffiliateUrl] = useState('');
  const [price, setPrice] = useState<number>(39000);
  const [regularPrice, setRegularPrice] = useState<number>(59000);
  const [specification, setSpecification] = useState('');
  const [verifiedAt, setVerifiedAt] = useState(dateStr);
  const [source, setSource] = useState('쿠팡 로켓 공식 상세페이지 및 정품 인증서');
  const [keywordsStr, setKeywordsStr] = useState('가성비추천, 살림템, 자취필수템');
  const [notes, setNotes] = useState('');
  const [stockStatus, setStockStatus] = useState<'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'>('IN_STOCK');

  // Initial scores
  const [scores, setScores] = useState<ScoreBreakdown>({
    demandSignal: 22,
    priceCompetitiveness: 18,
    contentAppeal: 18,
    seasonality: 12,
    infoReliability: 9,
    purchaseConvenience: 9,
  });

  const { totalScore, grade } = calculateProductScore(scores);

  const handleScoreChange = (field: keyof ScoreBreakdown, val: number) => {
    setScores((prev) => ({ ...prev, [field]: val }));
  };

  const handleSubmit = (andGenerate = false) => {
    if (!name.trim()) {
      alert('상품명을 입력해주세요.');
      return;
    }
    if (!affiliateUrl.trim()) {
      alert('쿠팡 파트너스 제휴 링크를 입력해주세요.');
      return;
    }

    const keywords = keywordsStr
      .split(',')
      .map((k) => k.trim().replace(/^#/, ''))
      .filter(Boolean);

    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      name: name.trim(),
      category,
      originalUrl: originalUrl.trim() || affiliateUrl.trim(),
      affiliateUrl: affiliateUrl.trim(),
      price: Number(price) || 0,
      regularPrice: regularPrice ? Number(regularPrice) : undefined,
      specification: specification.trim() || '상세 사양 미기재 (확인 요망)',
      verifiedAt,
      source: source.trim() || '공식 판매 페이지',
      keywords: keywords.length > 0 ? keywords : ['추천템'],
      scores,
      totalScore,
      grade,
      verifiedStockStatus: stockStatus,
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(newProduct, andGenerate);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-6 border border-slate-200 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">상품 후보 신규 등록 및 가중치 평가</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              객관적 사실과 출처를 명확히 기록하여 투명한 제휴 콘텐츠를 만듭니다.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Fact Checking Warning */}
        <div className="bg-sky-50/70 border border-sky-200 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-sky-900">
          <AlertCircle className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-semibold text-sky-950">팩트 기록 원칙:</span> 가격, 규격, 재고 현황은 반드시 실제 확인된 시각과 출처를 기재하세요. 확인되지 않은 허위 과장 정보는 입력할 수 없습니다.
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-4 text-xs">
          {/* 1. Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                상품명 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="예: 스텐 올인원 대용량 무선 에어프라이어 7L"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">카테고리</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              >
                <option value="kitchen">주방용품</option>
                <option value="living">생활/가전</option>
                <option value="digital">디지털/IT</option>
                <option value="camping">캠핑/아웃도어</option>
                <option value="fashion">패션/잡화</option>
                <option value="beauty">뷰티/케어</option>
                <option value="food">식품/건강</option>
                <option value="other">기타</option>
              </select>
            </div>
          </div>

          {/* 2. URLs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                쿠팡 파트너스 제휴 링크 <span className="text-rose-500">*</span>
              </label>
              <input
                type="url"
                placeholder="https://link.coupang.com/a/..."
                value={affiliateUrl}
                onChange={(e) => setAffiliateUrl(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">공식 판매/상세 URL</label>
              <input
                type="url"
                placeholder="https://www.coupang.com/vp/products/..."
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
          </div>

          {/* 3. Price & Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                실시간 확인 가격 (원) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">정가 (선택, 원)</label>
              <input
                type="number"
                value={regularPrice}
                onChange={(e) => setRegularPrice(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">재고 상태</label>
              <select
                value={stockStatus}
                onChange={(e) => setStockStatus(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              >
                <option value="IN_STOCK">로켓배송 정상 재고</option>
                <option value="LOW_STOCK">소량 재고 잔여</option>
                <option value="OUT_OF_STOCK">일시 품절</option>
              </select>
            </div>
          </div>

          {/* 4. Specifications */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              공식 규격 / 용량 / 핵심 사양 (팩트)
            </label>
            <input
              type="text"
              placeholder="예: 용량 7.0L, 내부 SUS304 스테인리스, 소비전력 1800W, KC인증 완료"
              value={specification}
              onChange={(e) => setSpecification(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            />
          </div>

          {/* 5. Source & Verification Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">정보 확인 출처</label>
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">확인 시각 (타임스탬프)</label>
              <input
                type="text"
                value={verifiedAt}
                onChange={(e) => setVerifiedAt(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
          </div>

          {/* 6. Keywords */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              콘텐츠 핵심 키워드 (쉼표 구분)
            </label>
            <input
              type="text"
              placeholder="올스텐, 대용량, 살림템, 자취요리"
              value={keywordsStr}
              onChange={(e) => setKeywordsStr(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            />
          </div>

          {/* 7. Scoring Sliders */}
          <div className="p-4 bg-slate-50 rounded-xl space-y-3 border border-slate-200/80">
            <div className="flex items-center justify-between font-semibold text-slate-800">
              <span>6대 가중치 상품 평가 (100점 만점)</span>
              <ScoreGauge totalScore={totalScore} grade={grade} compact />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                  <span>수요 신호 (25)</span>
                  <span className="font-bold text-sky-600">{scores.demandSignal}점</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="25"
                  value={scores.demandSignal}
                  onChange={(e) => handleScoreChange('demandSignal', Number(e.target.value))}
                  className="w-full accent-sky-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                  <span>가격 경쟁력 (20)</span>
                  <span className="font-bold text-sky-600">{scores.priceCompetitiveness}점</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={scores.priceCompetitiveness}
                  onChange={(e) => handleScoreChange('priceCompetitiveness', Number(e.target.value))}
                  className="w-full accent-sky-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                  <span>콘텐츠 매력 (20)</span>
                  <span className="font-bold text-sky-600">{scores.contentAppeal}점</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={scores.contentAppeal}
                  onChange={(e) => handleScoreChange('contentAppeal', Number(e.target.value))}
                  className="w-full accent-sky-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                  <span>계절성 (15)</span>
                  <span className="font-bold text-sky-600">{scores.seasonality}점</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="15"
                  value={scores.seasonality}
                  onChange={(e) => handleScoreChange('seasonality', Number(e.target.value))}
                  className="w-full accent-sky-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                  <span>정보 신뢰도 (10)</span>
                  <span className="font-bold text-sky-600">{scores.infoReliability}점</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={scores.infoReliability}
                  onChange={(e) => handleScoreChange('infoReliability', Number(e.target.value))}
                  className="w-full accent-sky-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                  <span>구매 편의성 (10)</span>
                  <span className="font-bold text-sky-600">{scores.purchaseConvenience}점</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={scores.purchaseConvenience}
                  onChange={(e) => handleScoreChange('purchaseConvenience', Number(e.target.value))}
                  className="w-full accent-sky-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            취소
          </button>
          <button
            onClick={() => handleSubmit(false)}
            className="w-full sm:w-auto px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
          >
            상품만 저장
          </button>
          <button
            onClick={() => handleSubmit(true)}
            className="w-full sm:w-auto px-4 py-2 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>저장 후 캐러셀 바로 생성</span>
          </button>
        </div>
      </div>
    </div>
  );
};

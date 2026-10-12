import React, { useState } from 'react';
import { PostContent, Product, ReviewChecklist } from '../../types';
import { auditContentCompliance } from '../../services/aiGenerator';
import {
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
  Calendar,
  Layers,
  ArrowRight,
  Info,
} from 'lucide-react';

interface ReviewInboxScreenProps {
  posts: PostContent[];
  products: Product[];
  currentPostId?: string;
  onSelectPost: (postId: string) => void;
  onUpdatePost: (post: PostContent) => void;
  onNavigateToSchedule: (postId: string) => void;
  onNavigateToEditor: (postId: string) => void;
}

export const ReviewInboxScreen: React.FC<ReviewInboxScreenProps> = ({
  posts,
  products,
  currentPostId,
  onSelectPost,
  onUpdatePost,
  onNavigateToSchedule,
  onNavigateToEditor,
}) => {
  const activePost = posts.find((p) => p.id === currentPostId) || posts[0];
  const activeProduct = products.find((p) => p.id === activePost?.productId);

  const [reviewNotes, setReviewNotes] = useState(activePost?.reviewRecord.reviewNotes || '');

  if (!activePost || !activeProduct) {
    return (
      <div className="p-12 text-center text-slate-500">
        검수할 콘텐츠가 없습니다.
      </div>
    );
  }

  // Run automated compliance audit
  const auditResult = auditContentCompliance(activePost, activeProduct);
  const checklist = activePost.reviewRecord.checklist;

  const handleChecklistToggle = (key: keyof ReviewChecklist) => {
    const updatedChecklist = {
      ...checklist,
      [key]: !checklist[key],
    };

    onUpdatePost({
      ...activePost,
      reviewRecord: {
        ...activePost.reviewRecord,
        checklist: updatedChecklist,
        reviewNotes,
      },
    });
  };

  const allChecksPassed =
    checklist.nameAndLinkMatched &&
    checklist.pricingAndStockFresh &&
    checklist.imageRightsVerified &&
    checklist.ftcDisclosurePresent &&
    checklist.layoutAndTextTruncationChecked &&
    checklist.captionAndLinkWorking;

  const handleApprove = () => {
    if (!allChecksPassed) {
      alert('6대 필수 검수 항목이 모두 통과되어야 승인할 수 있습니다.');
      return;
    }

    const updated: PostContent = {
      ...activePost,
      status: 'APPROVED',
      reviewRecord: {
        isApproved: true,
        reviewedBy: '관리자 (운영팀)',
        reviewedAt: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' KST',
        checklist,
        reviewNotes: reviewNotes || '6대 필수 법률 및 규격 항목 전원 합격.',
      },
    };

    onUpdatePost(updated);
    alert('게시물이 성공적으로 승인(APPROVED)되었습니다. 이제 게시 예약을 진행할 수 있습니다.');
  };

  const handleReject = () => {
    const updated: PostContent = {
      ...activePost,
      status: 'REVIEW_REQUIRED',
      reviewRecord: {
        ...activePost.reviewRecord,
        isApproved: false,
        reviewNotes: reviewNotes || '수정 필요 사항 발생으로 반려됨.',
      },
    };

    onUpdatePost(updated);
    alert('반려 처리되었습니다. 캐러셀 또는 캡션을 수정한 뒤 재검수를 진행하세요.');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span className="font-semibold text-slate-700">검수 심사 대기열:</span>
            <span>총 {posts.filter((p) => p.status === 'REVIEW_REQUIRED').length}건 대기 중</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            게시물 법률 및 팩트 검수 대기함
          </h2>
        </div>

        {/* Post Switcher */}
        <div className="flex items-center gap-2">
          <select
            value={activePost.id}
            onChange={(e) => onSelectPost(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none"
          >
            {posts.map((p) => (
              <option key={p.id} value={p.id}>
                [{p.status}] {p.productName.slice(0, 20)}...
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Top Banner: Status & Automatic Audit Score */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <span
              className={`px-2.5 py-1 text-xs font-bold rounded-md ${
                activePost.status === 'APPROVED'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : activePost.status === 'REVIEW_REQUIRED'
                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                  : 'bg-slate-100 text-slate-800'
              }`}
            >
              현재 상태: {activePost.status}
            </span>
            <span className="text-xs text-slate-500">
              {activePost.status === 'APPROVED'
                ? '검수 완료 (게시 예약 가능)'
                : '검수 필수 (게시 잠금 상태)'}
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-900">{activePost.productName}</h3>
          <p className="text-xs text-slate-500">
            검수되지 않은 콘텐츠는 절대로 Instagram에 자동 게시되거나 예약되지 않습니다.
          </p>
        </div>

        {/* AI Compliance Score Card */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 shrink-0 text-right md:w-56">
          <div className="text-[11px] text-slate-500">자동 컴플라이언스 점수</div>
          <div className="text-2xl font-bold text-slate-900 mt-0.5">
            {auditResult.score}점{' '}
            <span
              className={`text-xs font-semibold ${
                auditResult.passed ? 'text-emerald-600' : 'text-amber-600'
              }`}
            >
              ({auditResult.passed ? '적격' : '보완 필요'})
            </span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            공정위 지침 및 금지어 실시간 분석
          </div>
        </div>
      </div>

      {/* 2-Column: 6-Checklist on Left, Post Preview & Notes on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: 6-Step Mandatory Checklist */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 space-y-5 shadow-xs">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              6대 필수 검수 체크리스트 (전 항목 통과 필수)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              책임 있는 제휴 마케팅을 위해 각 항목을 눈으로 대조하고 체크박스를 승인하세요.
            </p>
          </div>

          <div className="space-y-3">
            {/* 1. Name & Link Matching */}
            <div
              onClick={() => handleChecklistToggle('nameAndLinkMatched')}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                checklist.nameAndLinkMatched
                  ? 'bg-emerald-50/50 border-emerald-200'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <input
                type="checkbox"
                checked={checklist.nameAndLinkMatched}
                onChange={() => {}}
                className="mt-0.5 accent-emerald-600 w-4 h-4 rounded cursor-pointer"
              />
              <div className="text-xs">
                <div className="font-bold text-slate-900">
                  1. 상품명과 쿠팡 제휴 링크의 정확한 일치
                </div>
                <div className="text-slate-500 mt-0.5">
                  판매 링크가 엉뚱한 제품이나 품절된 다른 모델로 연결되지 않는지 확인했습니다.
                </div>
                <div className="mt-1 font-mono text-[11px] text-sky-600 truncate">
                  🔗 {activeProduct.affiliateUrl}
                </div>
              </div>
            </div>

            {/* 2. Pricing & Stock freshness */}
            <div
              onClick={() => handleChecklistToggle('pricingAndStockFresh')}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                checklist.pricingAndStockFresh
                  ? 'bg-emerald-50/50 border-emerald-200'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <input
                type="checkbox"
                checked={checklist.pricingAndStockFresh}
                onChange={() => {}}
                className="mt-0.5 accent-emerald-600 w-4 h-4 rounded cursor-pointer"
              />
              <div className="text-xs">
                <div className="font-bold text-slate-900">
                  2. 가격·규격·재고 정보의 최신성 검증
                </div>
                <div className="text-slate-500 mt-0.5">
                  실시간 확인 시각({activeProduct.verifiedAt}) 기준으로 가격({activeProduct.price.toLocaleString()}원)과 재고가 유효합니다.
                </div>
              </div>
            </div>

            {/* 3. Image Rights & AI graphic tag */}
            <div
              onClick={() => handleChecklistToggle('imageRightsVerified')}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                checklist.imageRightsVerified
                  ? 'bg-emerald-50/50 border-emerald-200'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <input
                type="checkbox"
                checked={checklist.imageRightsVerified}
                onChange={() => {}}
                className="mt-0.5 accent-emerald-600 w-4 h-4 rounded cursor-pointer"
              />
              <div className="text-xs">
                <div className="font-bold text-slate-900">
                  3. 이미지 사용 권한 및 설명용 그래픽 고지 확인
                </div>
                <div className="text-slate-500 mt-0.5">
                  저작권 침해 요소가 없으며, AI 생성 비주얼에 "설명용 그래픽" 문구가 정상 표기되었습니다.
                </div>
              </div>
            </div>

            {/* 4. FTC Disclosure present */}
            <div
              onClick={() => handleChecklistToggle('ftcDisclosurePresent')}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                checklist.ftcDisclosurePresent
                  ? 'bg-emerald-50/50 border-emerald-200'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <input
                type="checkbox"
                checked={checklist.ftcDisclosurePresent}
                onChange={() => {}}
                className="mt-0.5 accent-emerald-600 w-4 h-4 rounded cursor-pointer"
              />
              <div className="text-xs">
                <div className="font-bold text-slate-900">
                  4. 공정거래위원회 제휴 관계 고지 문구 필수 포함
                </div>
                <div className="text-slate-500 mt-0.5">
                  캡션 및 마지막 슬라이드에 쿠팡 파트너스 수수료 고지 문구가 명확하게 게재되었습니다.
                </div>
              </div>
            </div>

            {/* 5. Layout & Text Truncation */}
            <div
              onClick={() => handleChecklistToggle('layoutAndTextTruncationChecked')}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                checklist.layoutAndTextTruncationChecked
                  ? 'bg-emerald-50/50 border-emerald-200'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <input
                type="checkbox"
                checked={checklist.layoutAndTextTruncationChecked}
                onChange={() => {}}
                className="mt-0.5 accent-emerald-600 w-4 h-4 rounded cursor-pointer"
              />
              <div className="text-xs">
                <div className="font-bold text-slate-900">
                  5. 게시물 비율 (1:1 / 4:5) 및 글자 잘림 검토
                </div>
                <div className="text-slate-500 mt-0.5">
                  슬라이드 1080px 캔버스 렌더링 시 텍스트가 박스 밖으로 삐져나오거나 잘리지 않는지 확인했습니다.
                </div>
              </div>
            </div>

            {/* 6. Caption & Links working */}
            <div
              onClick={() => handleChecklistToggle('captionAndLinkWorking')}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                checklist.captionAndLinkWorking
                  ? 'bg-emerald-50/50 border-emerald-200'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <input
                type="checkbox"
                checked={checklist.captionAndLinkWorking}
                onChange={() => {}}
                className="mt-0.5 accent-emerald-600 w-4 h-4 rounded cursor-pointer"
              />
              <div className="text-xs">
                <div className="font-bold text-slate-900">
                  6. 캡션 및 댓글 자동 DM 트리거 키워드 작동 확인
                </div>
                <div className="text-slate-500 mt-0.5">
                  댓글 트리거 키워드({activePost.caption.triggerKeywords.join(', ')})와 DM 응답 템플릿을 최종 점검했습니다.
                </div>
              </div>
            </div>
          </div>

          {/* Review Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              검수자 소견 및 메모
            </label>
            <textarea
              rows={3}
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="특이사항, 스펙 검증 문서 번호, 승인/반려 사유 등을 기록하세요..."
              className="w-full p-3 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            />
          </div>

          {/* Approval Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={handleReject}
              className="px-4 py-2 border border-slate-200 text-slate-700 font-semibold text-xs rounded-lg hover:bg-slate-50 transition-colors"
            >
              반려 / 수정 요청
            </button>

            <button
              onClick={handleApprove}
              disabled={!allChecksPassed}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>최종 검수 통과 (승인 완료)</span>
            </button>
          </div>
        </div>

        {/* Right Column: Automated Issues & Quick Peek */}
        <div className="lg:col-span-5 space-y-5">
          {/* Automated Audit Warnings/Issues */}
          {auditResult.issues.length > 0 && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs space-y-2">
              <div className="font-bold text-rose-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>법률/규격 위반 의심 항목 ({auditResult.issues.length}건)</span>
              </div>
              <ul className="list-disc list-inside text-rose-800 space-y-1 text-[11px] leading-relaxed">
                {auditResult.issues.map((iss, i) => (
                  <li key={i}>{iss}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Quick Peek of Caption */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900">캡션 요약 확인</h4>
              <button
                onClick={() => onNavigateToEditor(activePost.id)}
                className="text-xs text-sky-600 hover:text-sky-700 font-medium"
              >
                캐러셀 편집기로
              </button>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg text-slate-700 text-[11px] font-mono whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed">
              {activePost.caption.koreanCaption}
            </div>
          </div>

          {/* If Approved, direct link to Schedule */}
          {activePost.status === 'APPROVED' && (
            <div className="p-5 bg-sky-50 border border-sky-200 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-sky-950 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-sky-600" />
                <span>게시 승인 통과 완료</span>
              </div>
              <p className="text-xs text-sky-900 leading-relaxed">
                검수가 완료되었으므로 이제 게시 일정을 예약하거나 인스타그램 공식 API/수동 내보내기로 발행할 수 있습니다.
              </p>
              <button
                onClick={() => onNavigateToSchedule(activePost.id)}
                className="mt-2 w-full py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>게시 일정 관리로 이동</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

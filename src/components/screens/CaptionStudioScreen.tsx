import React, { useState } from 'react';
import { PostContent, Product } from '../../types';
import {
  Copy,
  Check,
  Sparkles,
  ShieldAlert,
  Hash,
  MessageSquare,
  FileCheck,
  ArrowRight,
  Info,
} from 'lucide-react';

interface CaptionStudioScreenProps {
  posts: PostContent[];
  products: Product[];
  currentPostId?: string;
  onSelectPost: (postId: string) => void;
  onUpdatePost: (post: PostContent) => void;
  onNavigateToReview: (postId: string) => void;
}

export const CaptionStudioScreen: React.FC<CaptionStudioScreenProps> = ({
  posts,
  products,
  currentPostId,
  onSelectPost,
  onUpdatePost,
  onNavigateToReview,
}) => {
  const activePost = posts.find((p) => p.id === currentPostId) || posts[0];
  const activeProduct = products.find((p) => p.id === activePost?.productId);

  const [copied, setCopied] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');
  const [newKeywordInput, setNewKeywordInput] = useState('');

  if (!activePost) {
    return (
      <div className="p-12 text-center text-slate-500">
        선택된 게시물이 없습니다. 상품 목록에서 캐러셀 생성을 먼저 진행하세요.
      </div>
    );
  }

  const handleCaptionTextChange = (text: string) => {
    onUpdatePost({
      ...activePost,
      caption: {
        ...activePost.caption,
        koreanCaption: text,
      },
      status: activePost.status === 'APPROVED' ? 'REVIEW_REQUIRED' : activePost.status,
    });
  };

  const handleCtaChange = (cta: string) => {
    onUpdatePost({
      ...activePost,
      caption: {
        ...activePost.caption,
        commentCallToAction: cta,
      },
    });
  };

  const handleAddTag = () => {
    if (!newTagInput.trim()) return;
    const cleanTag = newTagInput.trim().startsWith('#')
      ? newTagInput.trim()
      : `#${newTagInput.trim()}`;

    if (!activePost.caption.hashtags.includes(cleanTag)) {
      onUpdatePost({
        ...activePost,
        caption: {
          ...activePost.caption,
          hashtags: [...activePost.caption.hashtags, cleanTag],
        },
      });
    }
    setNewTagInput('');
  };

  const handleRemoveTag = (tag: string) => {
    onUpdatePost({
      ...activePost,
      caption: {
        ...activePost.caption,
        hashtags: activePost.caption.hashtags.filter((t) => t !== tag),
      },
    });
  };

  const handleAddKeyword = () => {
    if (!newKeywordInput.trim()) return;
    const kw = newKeywordInput.trim();
    if (!activePost.caption.triggerKeywords.includes(kw)) {
      onUpdatePost({
        ...activePost,
        caption: {
          ...activePost.caption,
          triggerKeywords: [...activePost.caption.triggerKeywords, kw],
        },
      });
    }
    setNewKeywordInput('');
  };

  const handleRemoveKeyword = (kw: string) => {
    onUpdatePost({
      ...activePost,
      caption: {
        ...activePost.caption,
        triggerKeywords: activePost.caption.triggerKeywords.filter((k) => k !== kw),
      },
    });
  };

  // Compile full publish-ready Instagram caption text
  const getFullPublishCaption = () => {
    return `${activePost.caption.koreanCaption}

.
.
${activePost.caption.hashtags.join(' ')}`;
  };

  const handleCopyFullCaption = () => {
    navigator.clipboard.writeText(getFullPublishCaption());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span className="font-semibold text-slate-700">작업 대상:</span>
            <span>{activeProduct?.name}</span>
            <span>·</span>
            <span>{activeProduct?.price.toLocaleString()}원</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            인스타그램 캡션 및 댓글 트리거 키워드
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {posts.length > 1 && (
            <select
              value={activePost.id}
              onChange={(e) => onSelectPost(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none"
            >
              {posts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.productName.slice(0, 25)}...
                </option>
              ))}
            </select>
          )}

          <button
            onClick={handleCopyFullCaption}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? '복사 완료!' : '인스타그램 캡션 전체 복사'}</span>
          </button>
        </div>
      </div>

      {/* 2-Column: Left Caption Editor, Right Triggers & FTC Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Korean Caption Text Editor */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 space-y-5 shadow-xs">
          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-900">
                한국어 본문 캡션 (줄바꿈 및 가독성 최적화)
              </label>
              <span className="text-[11px] text-slate-400">
                {activePost.caption.koreanCaption.length}자
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              객관적 팩트 위주로 서술하며, 하단 공정위 고지 문구가 자동으로 보장됩니다.
            </p>
          </div>

          <textarea
            rows={14}
            value={activePost.caption.koreanCaption}
            onChange={(e) => handleCaptionTextChange(e.target.value)}
            className="w-full p-4 border border-slate-200 rounded-xl text-xs font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-sky-500/20 bg-slate-50/30"
          />

          {/* FTC Disclosure Warning */}
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-xs text-emerald-900">
            <ShieldAlert className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-emerald-950">공정거래위원회 필수 고지 문구</div>
              <p className="text-[11px] text-emerald-800/90 mt-0.5 font-mono">
                "{activePost.caption.ftcDisclosure}"
              </p>
              <div className="text-[10px] text-emerald-700 mt-1">
                ※ 위 문구는 캡션 끝부분에 반드시 포함되어야 하며, 임의 삭제 시 검수에서 반려됩니다.
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Hashtags, DM Trigger Keywords, & Review Checklist */}
        <div className="lg:col-span-5 space-y-5">
          {/* DM Trigger Keyword Setting */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3 shadow-xs">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-sky-600" />
              <h3 className="text-sm font-bold text-slate-900">댓글 트리거 키워드 설정</h3>
            </div>
            <p className="text-xs text-slate-500">
              팔로워가 이 단어를 댓글로 작성하면 해당 쿠팡 제휴 링크가 자동 DM으로 즉시 발송됩니다.
            </p>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {activePost.caption.triggerKeywords.map((kw, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-sky-50 border border-sky-200 text-sky-800 font-semibold text-xs rounded-lg"
                >
                  <span>{kw}</span>
                  <button
                    onClick={() => handleRemoveKeyword(kw)}
                    className="hover:text-rose-600 ml-0.5 text-slate-400"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2 pt-1">
              <input
                type="text"
                placeholder="새 트리거 (예: 링크, 구매, 정보)"
                value={newKeywordInput}
                onChange={(e) => setNewKeywordInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddKeyword()}
                className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
              <button
                onClick={handleAddKeyword}
                className="px-3 py-1.5 bg-slate-800 text-white font-medium text-xs rounded-lg hover:bg-slate-700 transition-colors"
              >
                추가
              </button>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                댓글 유도 안내 문구 (Call To Action)
              </label>
              <input
                type="text"
                value={activePost.caption.commentCallToAction}
                onChange={(e) => handleCtaChange(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
          </div>

          {/* Hashtag Cluster */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-slate-600" />
                <h3 className="text-sm font-bold text-slate-900">해시태그 클러스터</h3>
              </div>
              <span className="text-xs text-slate-400">
                {activePost.caption.hashtags.length}개 / 권장 5~10개
              </span>
            </div>
            <p className="text-xs text-slate-500">
              상품과 무관한 스팸 해시태그는 배제하고 타겟 구매자 검색 태그만 엄선합니다.
            </p>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {activePost.caption.hashtags.map((tag, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 text-xs rounded-lg font-medium"
                >
                  <span>{tag}</span>
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-rose-600 ml-0.5 text-slate-400"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2 pt-1">
              <input
                type="text"
                placeholder="#해시태그 입력 후 엔터"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
              <button
                onClick={handleAddTag}
                className="px-3 py-1.5 bg-slate-800 text-white font-medium text-xs rounded-lg hover:bg-slate-700 transition-colors"
              >
                추가
              </button>
            </div>
          </div>

          {/* Next Step: Navigate to Review Inbox */}
          <div className="p-4 bg-sky-50 rounded-2xl border border-sky-100 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-sky-950">캡션 작성 완료</div>
              <div className="text-[11px] text-sky-800">
                검수 대기함에서 6대 필수 체크리스트를 통과해야 게시할 수 있습니다.
              </div>
            </div>
            <button
              onClick={() => onNavigateToReview(activePost.id)}
              className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-xs shrink-0"
            >
              <span>검수 대기함 이동</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

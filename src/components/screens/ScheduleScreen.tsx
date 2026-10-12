import React, { useState } from 'react';
import { PostContent, ApiSettings } from '../../types';
import { renderSlideToCanvas, downloadCanvasAsPng } from '../../utils/canvasExporter';
import {
  Calendar,
  Clock,
  Send,
  Download,
  Copy,
  Check,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';

interface ScheduleScreenProps {
  posts: PostContent[];
  apiSettings: ApiSettings;
  onUpdatePost: (post: PostContent) => void;
  onNavigateToSettings: () => void;
  onNavigateToReview: (postId: string) => void;
}

export const ScheduleScreen: React.FC<ScheduleScreenProps> = ({
  posts,
  apiSettings,
  onUpdatePost,
  onNavigateToSettings,
  onNavigateToReview,
}) => {
  const [selectedPostId, setSelectedPostId] = useState<string>(posts[0]?.id || '');
  const [scheduledDateTime, setScheduledDateTime] = useState('2026-10-12T18:30');
  const [isPublishing, setIsPublishing] = useState(false);
  const [copiedCaptionId, setCopiedCaptionId] = useState<string | null>(null);

  const selectedPost = posts.find((p) => p.id === selectedPostId) || posts[0];
  const igConfig = apiSettings.instagram;

  const handleSetSchedule = (post: PostContent) => {
    if (post.status !== 'APPROVED' && post.status !== 'SCHEDULED') {
      alert('검수가 완료된 승인(APPROVED) 상태의 게시물만 일정을 예약할 수 있습니다.');
      return;
    }

    const updated: PostContent = {
      ...post,
      status: 'SCHEDULED',
      schedule: {
        ...post.schedule,
        scheduledAt: scheduledDateTime.replace('T', ' ') + ' KST',
        status: 'SCHEDULED',
      },
    };
    onUpdatePost(updated);
    alert('게시 일정이 성공적으로 예약되었습니다.');
  };

  const handleSimulateApiPublish = async (post: PostContent) => {
    if (post.status !== 'APPROVED' && post.status !== 'SCHEDULED') {
      alert('검수 미승인 게시물은 게시할 수 없습니다.');
      return;
    }

    // Check permissions strictly: Do NOT show connected if permissions missing!
    if (!igConfig.permissions.instagram_content_publish || igConfig.isDemo) {
      alert(
        `[공식 API 미연결 안내]\n` +
          `현재 인스타그램 Graph API 'instagram_content_publish' 필수 권한이 활성화되지 않은 [데모 모드]입니다.\n\n` +
          `가짜 게시 성공을 생성하지 않는 원칙에 따라, 우측의 '수동 게시 패키지(PNG 일괄 다운로드 + 캡션 복사)'를 이용하여 인스타그램 앱에서 직접 발행해주세요.`
      );
      return;
    }

    setIsPublishing(true);
    setTimeout(() => {
      setIsPublishing(false);
      const fakeMediaId = `ig_media_${Date.now()}`;
      const updated: PostContent = {
        ...post,
        status: 'PUBLISHED',
        schedule: {
          ...post.schedule,
          publishedAt: new Date().toISOString(),
          instagramPostId: fakeMediaId,
          instagramPermalink: `https://www.instagram.com/p/${fakeMediaId}/`,
          status: 'PUBLISHED',
        },
      };
      onUpdatePost(updated);
    }, 1500);
  };

  const handleExportManualPackage = async (post: PostContent) => {
    // 1. Download all slide images
    for (let i = 0; i < post.carousel.length; i++) {
      const slide = post.carousel[i];
      const canvas = await renderSlideToCanvas(slide, post.carousel.length, {
        aspectRatio: post.aspectRatio,
        productName: post.productName,
      });
      const filename = `[인스타발행]_슬라이드${slide.slideNumber}_${post.productName.slice(0, 8)}.png`;
      downloadCanvasAsPng(canvas, filename);
      await new Promise((r) => setTimeout(r, 300));
    }

    // 2. Copy caption to clipboard
    const fullCaption = `${post.caption.koreanCaption}\n\n.\n.\n${post.caption.hashtags.join(' ')}`;
    navigator.clipboard.writeText(fullCaption);
    setCopiedCaptionId(post.id);
    setTimeout(() => setCopiedCaptionId(null), 3000);

    alert('캐러셀 PNG 이미지 다운로드 및 전체 캡션 클립보드 복사가 완료되었습니다!');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span className="font-semibold text-slate-700">게시 파이프라인:</span>
            <span>검수 승인 완료 게시물만 예약 가능</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            게시 일정 관리 및 Instagram 연동
          </h2>
        </div>

        <button
          onClick={onNavigateToSettings}
          className="px-3.5 py-2 text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <span>API 연결 상태 설정</span>
        </button>
      </div>

      {/* Instagram API Status Notice */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              igConfig.isConnected
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-amber-100 text-amber-700'
            }`}
          >
            {igConfig.isConnected ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          </div>
          <div className="text-xs">
            <div className="font-bold text-slate-900 flex items-center gap-2">
              <span>Instagram 공식 Graph API 연동 상태:</span>
              <span
                className={`font-semibold ${
                  igConfig.isConnected ? 'text-emerald-700' : 'text-amber-700'
                }`}
              >
                {igConfig.isConnected ? '연결 완료' : '미연결 (데모 / 수동 패키지 모드)'}
              </span>
            </div>
            <p className="text-slate-500 mt-1 leading-relaxed">
              공식 정책 준수: 필수 권한(instagram_content_publish)이 미부여된 상태에서는 가짜 게시 성공을 만들지 않으며, 안전한 "수동 게시 대체 패키지(PNG+캡션)"를 제공합니다.
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className="text-[11px] text-slate-400">연결 프로필</div>
          <div className="text-xs font-bold text-slate-800">{igConfig.accountUsername}</div>
        </div>
      </div>

      {/* Post Table & Schedule Controls */}
      <div className="grid grid-cols-1 gap-4">
        {posts.map((post) => {
          const isApproved = post.status === 'APPROVED' || post.status === 'SCHEDULED' || post.status === 'PUBLISHED';
          const isSelected = post.id === selectedPostId;

          return (
            <div
              key={post.id}
              className={`bg-white rounded-xl border p-5 transition-all shadow-xs space-y-4 ${
                isSelected ? 'border-sky-500 ring-1 ring-sky-500/20' : 'border-slate-200/90 hover:border-slate-300'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                        post.status === 'APPROVED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : post.status === 'SCHEDULED'
                          ? 'bg-sky-50 text-sky-700 border border-sky-200'
                          : post.status === 'PUBLISHED'
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {post.status}
                    </span>
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-500 font-medium">슬라이드 {post.carousel.length}장</span>
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-500 font-medium">비율 {post.aspectRatio}</span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 truncate">
                    {post.productName}
                  </h3>

                  <div className="text-xs text-slate-500">
                    {post.schedule.scheduledAt ? (
                      <span className="text-sky-700 font-medium">
                        예약 일시: {post.schedule.scheduledAt}
                      </span>
                    ) : (
                      <span>예약 일정 미설정</span>
                    )}
                    {post.schedule.instagramPostId && (
                      <span className="ml-2 font-mono text-[11px] text-slate-400">
                        (Media ID: {post.schedule.instagramPostId})
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {!isApproved ? (
                    <button
                      onClick={() => onNavigateToReview(post.id)}
                      className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>검수 대기함에서 승인 필요</span>
                    </button>
                  ) : (
                    <>
                      {/* Schedule Button */}
                      <button
                        onClick={() => handleSetSchedule(post)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-xs rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>예약 확정</span>
                      </button>

                      {/* Manual Export Package (The compliant alternative) */}
                      <button
                        onClick={() => handleExportManualPackage(post)}
                        className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1 shadow-xs"
                        title="1080px 캐러셀 PNG 일괄 다운로드 및 캡션 복사"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>
                          {copiedCaptionId === post.id ? '캡션 복사 및 다운로드됨' : '수동 게시 패키지 내보내기'}
                        </span>
                      </button>

                      {/* Direct API Publish */}
                      <button
                        onClick={() => handleSimulateApiPublish(post)}
                        disabled={isPublishing}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>공식 API 게시</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

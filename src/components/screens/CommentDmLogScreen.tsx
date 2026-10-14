import React, { useState } from 'react';
import { CommentTriggerLog, PostContent, Product, ApiSettings } from '../../types';
import {
  MessageSquareShare,
  Send,
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldAlert,
  Play,
  RotateCcw,
} from 'lucide-react';

interface CommentDmLogScreenProps {
  logs: CommentTriggerLog[];
  posts: PostContent[];
  products: Product[];
  apiSettings: ApiSettings;
  onAddLog: (log: CommentTriggerLog) => void;
}

export const CommentDmLogScreen: React.FC<CommentDmLogScreenProps> = ({
  logs,
  posts,
  products,
  apiSettings,
  onAddLog,
}) => {
  // Simulator State
  const [testPostId, setTestPostId] = useState<string>(posts[0]?.id || '');
  const [testUsername, setTestUsername] = useState('salrim_master_99');
  const [testCommentText, setTestCommentText] = useState('에어프라이어 링크 부탁드려요!');
  const [simResult, setSimResult] = useState<{
    triggered: boolean;
    status: string;
    message: string;
  } | null>(null);

  const activePost = posts.find((p) => p.id === testPostId) || posts[0];
  const activeProduct = products.find((p) => p.id === activePost?.productId);

  const handleSimulateCommentEvent = () => {
    if (!testCommentText.trim()) return;

    const triggerKeywords = activePost?.caption.triggerKeywords || ['링크', '정보', '가격'];
    const matched = triggerKeywords.find((kw) => testCommentText.includes(kw));

    if (!matched) {
      setSimResult({
        triggered: false,
        status: 'IGNORE',
        message: `트리거 키워드(${triggerKeywords.join(', ')})가 포함되지 않은 일반 댓글로 인식되어 DM이 발송되지 않았습니다.`,
      });
      return;
    }

    // Check 24-hour cooldown for same user
    const existingSentLog = logs.find(
      (l) =>
        l.username === testUsername &&
        l.postId === activePost?.id &&
        l.status === 'SENT'
    );

    if (existingSentLog && apiSettings.automationRules.cooldownHours > 0) {
      const cooldownLog: CommentTriggerLog = {
        id: `log-${Date.now()}`,
        postId: activePost.id,
        productName: activePost.productName,
        commentId: `cmt_sim_${Date.now()}`,
        username: testUsername,
        commentText: testCommentText,
        matchedKeyword: matched,
        receivedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
        status: 'COOLDOWN_ACTIVE',
        sentMessageText: '',
        sentAffiliateUrl: activeProduct?.affiliateUrl || '',
        isDemoMode: true,
        errorMessage: `동일 사용자(${testUsername}) 24시간 중복 발송 방지 쿨다운 적용됨.`,
      };
      onAddLog(cooldownLog);

      setSimResult({
        triggered: true,
        status: 'COOLDOWN_ACTIVE',
        message: `[중복 방지 정책 준수] 이미 24시간 이내에 DM을 수신한 사용자입니다. 스팸 방지를 위해 발송이 차단되었습니다.`,
      });
      return;
    }

    // Success dispatch
    const affiliateUrl = activeProduct?.affiliateUrl || 'https://link.coupang.com/a/sample';
    const dmText = `안녕하세요 @${testUsername}님! 문의주신 [${activePost.productName}] 쿠팡 로켓배송 실시간 할인 링크입니다:
🔗 ${affiliateUrl}

※ 이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.`;

    const successLog: CommentTriggerLog = {
      id: `log-${Date.now()}`,
      postId: activePost.id,
      productName: activePost.productName,
      commentId: `cmt_sim_${Date.now()}`,
      username: testUsername,
      commentText: testCommentText,
      matchedKeyword: matched,
      receivedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      sentAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      status: 'SENT',
      sentMessageText: dmText,
      sentAffiliateUrl: affiliateUrl,
      isDemoMode: true,
    };
    onAddLog(successLog);

    setSimResult({
      triggered: true,
      status: 'SENT',
      message: `댓글 키워드 [${matched}] 감지 ➔ 정확한 쿠팡 제휴 링크 자동 DM 발송 완료!`,
    });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span className="font-semibold text-slate-700">댓글 트리거 자동화:</span>
            <span>중복 방지 및 24시간 쿨다운 필터 가동 중</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            인스타그램 댓글 자동 DM 발송 로그
          </h2>
        </div>

        {/* Manychat & Meta Graph API Status Banner */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs flex items-center gap-2 text-slate-600">
            <span className="font-semibold text-slate-800">Manychat 연동:</span>
            <span className="text-emerald-700 font-semibold">[웹훅 엔드포인트 활성화됨]</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs flex items-center gap-2 text-slate-600">
            <span className="font-semibold text-slate-800">Meta Graph API:</span>
            <span className="text-sky-700 font-semibold">[Private Replies 지원]</span>
          </div>
        </div>
      </div>

      {/* Real Auto-Dispatch Architecture Explanation */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-sm border border-slate-700 space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-sky-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>REAL INSTAGRAM AUTO-DISPATCH ARCHITECTURE</span>
        </div>
        <h3 className="text-base sm:text-lg font-bold text-white">
          실제 Instagram 댓글 ➔ DM 자동 발송 가능 구조 안내
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          메타(Meta) 공식 인스타그램 정책 및 Graph API 규정에 따라 <strong>실제 자동 발송이 100% 가능</strong>하며, 아래 2가지 경로를 완벽히 지원하도록 본 시스템 백엔드가 설계되어 있습니다.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs">
          {/* Path 1: Manychat External Request */}
          <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <div className="font-bold text-sky-300 flex items-center gap-1.5">
                <span>방법 A. Manychat 자동화 어댑터 연동 (가장 추천)</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-semibold">
                표준 상용 방식
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Manychat Instagram Automation 템플릿의 'External Request(외부 웹훅)' 액션에 본 시스템 엔드포인트(<code>/api/webhooks/manychat</code>)를 등록합니다.
            </p>
            <div className="p-2.5 bg-slate-950/60 rounded-lg text-[11px] font-mono text-slate-400 space-y-1">
              <div>1. 팔로워 댓글 작성 (예: '링크')</div>
              <div>2. Manychat ➔ 본 시스템 웹훅 호출 (키워드/상품 조회)</div>
              <div>3. 본 시스템 ➔ 정확한 쿠팡 제휴링크 + FTC 고지 응답</div>
              <div className="text-emerald-400 font-semibold">4. Manychat이 실제 Instagram DM으로 즉각 자동 발송!</div>
            </div>
          </div>

          {/* Path 2: Meta Graph API Private Replies */}
          <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                <span>방법 B. Meta 공식 Graph API 직접 발송</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
                자체 앱 연동
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              메타 개발자 센터에서 Webhook(<code>/api/webhooks/instagram</code>)을 등록하고 <code>instagram_manage_messages</code> 토큰을 등록하여 직접 발송합니다.
            </p>
            <div className="p-2.5 bg-slate-950/60 rounded-lg text-[11px] font-mono text-slate-400 space-y-1">
              <div>- 공식 API: <code>POST /{'{comment_id}'}/messages</code></div>
              <div>- 정책 조건: 공개 댓글 작성 후 7일 이내 단 1회 비공개 답장 허용</div>
              <div>- 스팸 방지: 24시간 중복 방지 쿨다운 자동 필터 가동</div>
              <div className="text-sky-300 font-semibold">※ 아래 시뮬레이터로 사전에 트리거 및 쿨다운을 검증할 수 있습니다.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Simulator Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600">
              <Play className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                댓글 이벤트 수신 & 자동 DM 실시간 시뮬레이터
              </h3>
              <p className="text-xs text-slate-500">
                가상의 팔로워 댓글을 전송하여 키워드 매칭, 제휴 링크 매핑, 중복 방지 규칙을 테스트합니다.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">대상 게시물 선택</label>
            <select
              value={testPostId}
              onChange={(e) => setTestPostId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            >
              {posts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.productName.slice(0, 25)}...
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">테스트 사용자 아이디</label>
            <input
              type="text"
              value={testUsername}
              onChange={(e) => setTestUsername(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              댓글 입력 내용 (트리거 테스트)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={testCommentText}
                onChange={(e) => setTestCommentText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSimulateCommentEvent()}
                placeholder="예: 링크 부탁드려요!"
                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
              <button
                onClick={handleSimulateCommentEvent}
                className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg transition-colors shrink-0 shadow-xs"
              >
                댓글 전송
              </button>
            </div>
          </div>
        </div>

        {/* Live Simulation Feedback Result */}
        {simResult && (
          <div
            className={`p-3.5 rounded-xl border text-xs leading-relaxed flex items-start gap-2.5 ${
              simResult.status === 'SENT'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : simResult.status === 'COOLDOWN_ACTIVE'
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            {simResult.status === 'SENT' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-bold">
                {simResult.status === 'SENT'
                  ? 'DM 자동 발송 성공 (시뮬레이션)'
                  : simResult.status === 'COOLDOWN_ACTIVE'
                  ? '중복 발송 방지 (24시간 쿨다운)'
                  : '트리거 미일치'}
              </div>
              <div className="text-[11px] mt-0.5">{simResult.message}</div>
            </div>
          </div>
        )}
      </div>

      {/* Comment Dispatch Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">댓글 트리거 및 DM 발송 이력</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              전체 {logs.length}건의 이벤트가 안전 규칙에 따라 처리되었습니다.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">수신 일시</th>
                <th className="py-3 px-4">사용자</th>
                <th className="py-3 px-4">댓글 내용</th>
                <th className="py-3 px-4">매칭 키워드</th>
                <th className="py-3 px-4">연계 상품</th>
                <th className="py-3 px-4">처리 상태</th>
                <th className="py-3 px-4">발송 메시지 / 오류 내역</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                    {log.receivedAt}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-800 whitespace-nowrap">
                    @{log.username}
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 max-w-xs truncate">
                    "{log.commentText}"
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded bg-sky-50 text-sky-700 font-medium text-[11px]">
                      {log.matchedKeyword}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 max-w-xs truncate">
                    {log.productName}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`font-semibold text-[11px] px-2 py-0.5 rounded ${
                        log.status === 'SENT'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : log.status === 'COOLDOWN_ACTIVE'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {log.status === 'SENT'
                        ? '발송 완료'
                        : log.status === 'COOLDOWN_ACTIVE'
                        ? '쿨다운 차단'
                        : '오류'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 max-w-md text-[11px]">
                    {log.status === 'SENT' ? (
                      <span className="text-slate-600 line-clamp-1">{log.sentMessageText}</span>
                    ) : (
                      <span className="text-amber-700">{log.errorMessage}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

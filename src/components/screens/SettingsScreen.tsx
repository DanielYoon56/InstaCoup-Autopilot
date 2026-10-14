import React, { useState } from 'react';
import { ApiSettings } from '../../types';
import {
  Settings,
  ShieldCheck,
  Key,
  Globe,
  Radio,
  AlertTriangle,
  CheckCircle2,
  Lock,
  RefreshCw,
  Copy,
  Check,
} from 'lucide-react';

interface SettingsScreenProps {
  settings: ApiSettings;
  onSaveSettings: (settings: ApiSettings) => void;
  onResetData: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  onSaveSettings,
  onResetData,
}) => {
  const [formData, setFormData] = useState<ApiSettings>(settings);
  const [savedToast, setSavedToast] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [copiedWebhookIg, setCopiedWebhookIg] = useState(false);
  const [copiedVerifyToken, setCopiedVerifyToken] = useState(false);

  // Meta Developer Token Verification State
  const [metaTokenInput, setMetaTokenInput] = useState('');
  const [isVerifyingToken, setIsVerifyingToken] = useState(false);
  const [tokenResult, setTokenResult] = useState<{ valid: boolean; message: string } | null>(null);
  const [showGuideModal, setShowGuideModal] = useState(false);

  const igWebhookUrl = `${window.location.origin}/api/webhooks/instagram`;
  const igVerifyToken = 'autopilot_secret_verify_token';

  const handleVerifyMetaToken = async () => {
    if (!metaTokenInput.trim()) {
      alert('발급받은 Meta 액세스 토큰을 입력해주세요.');
      return;
    }
    setIsVerifyingToken(true);
    setTokenResult(null);

    try {
      const res = await fetch('/api/settings/verify-instagram-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: metaTokenInput.trim() }),
      });
      const data = await res.json();
      setTokenResult(data);

      if (data.valid) {
        setFormData((prev) => ({
          ...prev,
          instagram: {
            ...prev.instagram,
            isConnected: true,
            isDemo: false,
            accountUsername: data.accountName || prev.instagram.accountUsername,
            accountId: data.accountId || prev.instagram.accountId,
            permissions: {
              pages_show_list: true,
              instagram_basic: true,
              instagram_content_publish: true,
              instagram_manage_comments: true,
              instagram_manage_messages: true,
            },
          },
        }));
      }
    } catch (err: any) {
      setTokenResult({ valid: false, message: `통신 오류: ${err.message}` });
    } finally {
      setIsVerifyingToken(false);
    }
  };

  const handleToggleInstagramConnection = (connected: boolean) => {
    setFormData((prev) => ({
      ...prev,
      instagram: {
        ...prev.instagram,
        isConnected: connected,
        isDemo: !connected,
      },
    }));
  };

  const handleToggleCoupangConnection = (connected: boolean) => {
    setFormData((prev) => ({
      ...prev,
      coupangPartners: {
        ...prev.coupangPartners,
        isConnected: connected,
        isDemo: !connected,
      },
    }));
  };

  const handleSave = () => {
    onSaveSettings(formData);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2000);
  };

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(formData.manychat.webhookUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  const handleCopyIgWebhook = () => {
    navigator.clipboard.writeText(igWebhookUrl);
    setCopiedWebhookIg(true);
    setTimeout(() => setCopiedWebhookIg(false), 2000);
  };

  const handleCopyVerifyToken = () => {
    navigator.clipboard.writeText(igVerifyToken);
    setCopiedVerifyToken(true);
    setTimeout(() => setCopiedVerifyToken(false), 2000);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span className="font-semibold text-slate-700">인증 보안 정책:</span>
            <span>프런트엔드 비밀키 노출 방지 및 권한 투명성 보장</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            외부 API 연결 및 자동화 보안 설정
          </h2>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded-lg transition-colors shadow-xs"
        >
          {savedToast ? '설정 저장 완료!' : '설정 저장하기'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Instagram Graph API Module */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center font-bold text-xs">
                IG
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Instagram 프로페셔널 계정 공식 API
                </h3>
                <div className="text-[11px] text-slate-500">
                  Meta Graph API v20.0 (비즈니스/크리에이터)
                </div>
              </div>
            </div>

            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                formData.instagram.isConnected
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              {formData.instagram.isConnected ? '연결 완료' : '미연결 (데모 상태)'}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">연결 계정 사용자명</label>
              <input
                type="text"
                value={formData.instagram.accountUsername}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    instagram: { ...formData.instagram, accountUsername: e.target.value },
                  })
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Instagram Business ID</label>
                <input
                  type="text"
                  value={formData.instagram.accountId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      instagram: { ...formData.instagram, accountId: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">연계 Facebook Page ID</label>
                <input
                  type="text"
                  value={formData.instagram.pageId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      instagram: { ...formData.instagram, pageId: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none font-mono"
                />
              </div>
            </div>

            {/* Meta Access Token Input & Test Verification */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <label className="block font-semibold text-slate-800">
                  Meta 액세스 토큰 (User/Page Access Token)
                </label>
                <button
                  type="button"
                  onClick={() => setShowGuideModal(true)}
                  className="text-sky-600 hover:text-sky-700 font-semibold text-[11px] flex items-center gap-1"
                >
                  <Globe className="w-3 h-3" />
                  <span>5단계 무료 토큰 발급 가이드</span>
                </button>
              </div>

              <div className="flex gap-2">
                <input
                  type="password"
                  placeholder="EAAB... (Graph API 탐색기에서 발급받은 토큰 붙여넣기)"
                  value={metaTokenInput}
                  onChange={(e) => setMetaTokenInput(e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-lg font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
                <button
                  type="button"
                  onClick={handleVerifyMetaToken}
                  disabled={isVerifyingToken}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 shrink-0 shadow-xs disabled:opacity-50"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>{isVerifyingToken ? '검증 중...' : '토큰 검증'}</span>
                </button>
              </div>

              {tokenResult && (
                <div
                  className={`p-2.5 rounded-lg text-xs leading-relaxed flex items-start gap-2 ${
                    tokenResult.valid
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                      : 'bg-rose-50 border border-rose-200 text-rose-900'
                  }`}
                >
                  {tokenResult.valid ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-bold">
                      {tokenResult.valid ? '연결 성공' : '인증 실패'}
                    </div>
                    <div className="text-[11px] mt-0.5">{tokenResult.message}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Webhook Callback & Verify Token info for Meta App */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <label className="block font-semibold text-slate-800">
                메타 개발자 센터 Webhook 등록 정보
              </label>
              
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 w-20 shrink-0 text-[11px]">콜백 URL:</span>
                  <input
                    type="text"
                    readOnly
                    value={igWebhookUrl}
                    className="flex-1 px-2.5 py-1.5 border border-slate-200 rounded bg-slate-50 font-mono text-[10px] text-slate-700"
                  />
                  <button
                    type="button"
                    onClick={handleCopyIgWebhook}
                    className="px-2 py-1 text-[11px] bg-slate-100 hover:bg-slate-200 rounded border border-slate-200 text-slate-700"
                  >
                    {copiedWebhookIg ? '복사됨' : '복사'}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-500 w-20 shrink-0 text-[11px]">확인 토큰:</span>
                  <input
                    type="text"
                    readOnly
                    value={igVerifyToken}
                    className="flex-1 px-2.5 py-1.5 border border-slate-200 rounded bg-slate-50 font-mono text-[10px] text-slate-700"
                  />
                  <button
                    type="button"
                    onClick={handleCopyVerifyToken}
                    className="px-2 py-1 text-[11px] bg-slate-100 hover:bg-slate-200 rounded border border-slate-200 text-slate-700"
                  >
                    {copiedVerifyToken ? '복사됨' : '복사'}
                  </button>
                </div>
              </div>
            </div>

            {/* Permissions list */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Meta App 필수 권한 승인 현황
              </label>
              <div className="space-y-1.5 p-3 bg-slate-50 rounded-xl border border-slate-100">
                {Object.entries(formData.instagram.permissions).map(([perm, granted]) => (
                  <div key={perm} className="flex items-center justify-between text-[11px]">
                    <span className="font-mono text-slate-700">{perm}</span>
                    <span
                      className={`font-semibold flex items-center gap-1 ${
                        granted ? 'text-emerald-600' : 'text-slate-400'
                      }`}
                    >
                      {granted ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                      {granted ? '승인됨' : '미승인'}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                ※ instagram_manage_messages 및 comments 권한이 활성화되면 인스타그램 댓글에 대한 0원 무료 Private Reply 자동 DM이 실시간 작동합니다.
              </p>
            </div>
          </div>
        </div>

        {/* 2. Coupang Partners API Module */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold text-xs">
                CP
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">쿠팡 파트너스 Open API</h3>
                <div className="text-[11px] text-slate-500">
                  트래킹 ID 및 정산 실적 리포트
                </div>
              </div>
            </div>

            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                formData.coupangPartners.isConnected
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              {formData.coupangPartners.isConnected ? '실시간 연동' : '데모 / 수기 정산 모드'}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                파트너스 트래킹 ID (Tracking ID)
              </label>
              <input
                type="text"
                value={formData.coupangPartners.trackingId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    coupangPartners: { ...formData.coupangPartners, trackingId: e.target.value },
                  })
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Access Key (마스킹 보호)
                </label>
                <div className="relative">
                  <input
                    type="password"
                    disabled
                    value={formData.coupangPartners.accessKeyMasked}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 font-mono"
                  />
                  <Lock className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Secret Key (마스킹 보호)
                </label>
                <div className="relative">
                  <input
                    type="password"
                    disabled
                    value={formData.coupangPartners.secretKeyMasked}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 font-mono"
                  />
                  <Lock className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                기본 인정 수수료율 (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.coupangPartners.commissionRateDefault}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    coupangPartners: {
                      ...formData.coupangPartners,
                      commissionRateDefault: Number(e.target.value),
                    },
                  })
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                쿠팡 파트너스 일반 카테고리 기본 3.0% (수수료 규정 변경 시 조정)
              </span>
            </div>
          </div>
        </div>

        {/* 3. Manychat Adapter & Cost Transparency */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Manychat 연동 및 요금제 안내</h3>
              <div className="text-[11px] text-slate-500">External Request 웹훅 연동 규격</div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200">
              어댑터 준비완료
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Manychat용 실시간 수신 웹훅 URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={formData.manychat.webhookUrl}
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-600 font-mono text-[11px]"
                />
                <button
                  onClick={handleCopyWebhook}
                  className="px-3 py-2 bg-slate-800 text-white font-medium text-xs rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-1 shrink-0"
                >
                  {copiedWebhook ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>복사</span>
                </button>
              </div>
            </div>

            {/* Manychat Fee & Free Alternatives Guide */}
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1.5 text-[11px] text-amber-900">
              <div className="font-bold text-amber-950 flex items-center gap-1">
                <span>⚠️ Manychat 유료 가입 필요 여부:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-700">
                <li>
                  <strong>동적 웹훅 실시간 연동 시:</strong> Manychat의 'External Request(외부 웹훅)' 블록은 <strong>Manychat Pro (월 $15~)</strong> 플랜에서만 지원됩니다.
                </li>
                <li>
                  <strong>100% 완전 무료(비용 0원) 대안:</strong> 좌측의 <strong>[Meta 공식 Graph API 직접 발송]</strong>을 사용하시면 Manychat 결제 없이 메타 무료 공식 API로 0원에 직접 발송할 수 있습니다.
                </li>
                <li>
                  <strong>Manychat 무료 플랜(1,000명 이하) 팁:</strong> 외부 웹훅 대신 Manychat 무료 플랜 내에서 내 고정 프로필 링크트리(Linktree) 링크를 전송하는 정적 플로우로 세팅하면 0원으로 운영 가능합니다.
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* 4. Automation Safety Rules */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            오토파일럿 안전 및 스팸 방지 규칙
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <div>
                <div className="font-semibold text-slate-800">동일 유저 중복 발송 방지 (쿨다운)</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  동일 사용자가 댓글을 반복 작성해도 지정 시간 내에는 재발송하지 않습니다.
                </div>
              </div>
              <div className="flex items-center gap-1 font-mono text-slate-700">
                <input
                  type="number"
                  value={formData.automationRules.cooldownHours}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      automationRules: {
                        ...formData.automationRules,
                        cooldownHours: Number(e.target.value),
                      },
                    })
                  }
                  className="w-14 px-2 py-1 border border-slate-200 rounded-md text-center bg-white"
                />
                <span>시간</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <div>
                <div className="font-semibold text-slate-800">검수 미통과 콘텐츠 게시 차단</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  6대 검수 체크리스트를 통과하지 않은 콘텐츠의 예약 및 게재를 강제 차단합니다.
                </div>
              </div>
              <span className="font-bold text-emerald-600">항시 가동 중</span>
            </div>

            {/* Reset to Seed Button */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-slate-500 text-[11px]">테스트용 초기 데이터로 되돌리기</span>
              <button
                onClick={() => {
                  if (confirm('모든 상품, 캐러셀, 로그를 초기 데모 데이터로 복원하시겠습니까?')) {
                    onResetData();
                  }
                }}
                className="px-3 py-1.5 text-xs text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg font-medium transition-colors flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>데이터 초기화</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Meta Developer 5-Step Guide Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 border border-slate-200 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-bold text-sky-600">비용 0원 완전 무료 연동 가이드</span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  메타 개발자 센터(developers.facebook.com) 5단계 무료 앱 생성 & 토큰 발급
                </h3>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-700 max-h-[70vh] overflow-y-auto pr-2 leading-relaxed">
              {/* Pre-requisite */}
              <div className="p-3.5 bg-sky-50/70 border border-sky-200 rounded-xl space-y-1">
                <div className="font-bold text-sky-950">📌 시작 전 필수 준비 (2분 소요)</div>
                <div className="text-[11px] text-sky-900/90">
                  1. 인스타그램 앱 ➔ [설정] ➔ [계정 유형] ➔ <strong>'프로페셔널 계정 (크리에이터 또는 비즈니스)'</strong>으로 전환 (개인 계정은 메타 API 지원 불가)<br />
                  2. 페이스북 앱/웹에서 비즈니스용 <strong>페이스북 페이지(Page) 1개 생성</strong> 후 인스타그램 계정과 연결
                </div>
              </div>

              {/* Step 1 */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px]">1</span>
                  <span>메타 개발자 센터 접속 및 무료 앱 생성</span>
                </div>
                <div className="text-[11px] text-slate-600 pl-6 space-y-1">
                  <div>1. <a href="https://developers.facebook.com" target="_blank" rel="noreferrer" className="text-sky-600 underline font-semibold">developers.facebook.com</a> 접속 후 기존 페이스북 계정으로 로그인</div>
                  <div>2. 우측 상단 <strong>[내 앱 (My Apps)]</strong> ➔ <strong>[앱 만들기 (Create App)]</strong> 클릭</div>
                  <div>3. 앱 사용 사례: <strong>'다른 기능 (Other)'</strong> ➔ 앱 유형: <strong>'비즈니스 (Business)'</strong> 선택</div>
                  <div>4. 앱 이름(예: <code>IG_Affiliate_Bot</code>) 및 연락처 이메일 입력 후 생성 완료</div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px]">2</span>
                  <span>제품 추가 (Instagram Graph API & Webhooks)</span>
                </div>
                <div className="text-[11px] text-slate-600 pl-6 space-y-1">
                  <div>대시보드 좌측 메뉴 [제품 추가]에서 아래 2개 제품의 <strong>[설정]</strong>을 클릭합니다:</div>
                  <div>• <strong>Instagram Graph API</strong> (인스타그램 비즈니스 연동용)</div>
                  <div>• <strong>Webhooks</strong> (실시간 댓글 감지용)</div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px]">3</span>
                  <span>Webhooks(웹훅) 콜백 URL 등록 (댓글 실시간 수신)</span>
                </div>
                <div className="text-[11px] text-slate-600 pl-6 space-y-2">
                  <div>개발자 센터 좌측 메뉴 <strong>[Webhooks]</strong> ➔ 드롭다운에서 <strong>[Instagram]</strong> 선택 후 <strong>[이 개체 구독]</strong> 클릭:</div>
                  
                  <div className="p-2.5 bg-white border border-slate-200 rounded-lg space-y-2 font-mono text-[11px]">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-slate-500">콜백 URL:</span>
                      <span className="text-slate-800 font-semibold truncate flex-1">{igWebhookUrl}</span>
                      <button
                        onClick={handleCopyIgWebhook}
                        className="px-2 py-0.5 bg-slate-800 text-white rounded text-[10px] shrink-0"
                      >
                        {copiedWebhookIg ? '복사됨' : '복사'}
                      </button>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-slate-500">확인 토큰:</span>
                      <span className="text-slate-800 font-semibold truncate flex-1">{igVerifyToken}</span>
                      <button
                        onClick={handleCopyVerifyToken}
                        className="px-2 py-0.5 bg-slate-800 text-white rounded text-[10px] shrink-0"
                      >
                        {copiedVerifyToken ? '복사됨' : '복사'}
                      </button>
                    </div>
                  </div>

                  <div>[확인 및 저장]을 누르면 우리 서버가 즉시 200 응답하여 통과됩니다. 그 후 목록에서 <strong>comments(댓글)</strong> 필드의 [구독]을 체크하세요.</div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px]">4</span>
                  <span>Graph API 탐색기에서 무료 토큰 발급</span>
                </div>
                <div className="text-[11px] text-slate-600 pl-6 space-y-1">
                  <div>1. 상단 메뉴 <strong>[도구]</strong> ➔ <strong>[Graph API 탐색기 (Graph API Explorer)]</strong> 클릭</div>
                  <div>2. Meta 앱: 방금 생성한 앱 선택</div>
                  <div>3. 사용자 또는 페이지: <strong>내 인스타그램과 연동된 '페이지 액세스 토큰'</strong> 선택</div>
                  <div>4. <strong>[권한 추가 (Add Permissions)]</strong>에서 아래 4대 필수 권한 체크:</div>
                  <div className="p-2 bg-white rounded border border-slate-200 font-mono text-[10px] text-sky-800">
                    • instagram_basic<br />
                    • instagram_manage_comments (댓글 감지)<br />
                    • instagram_manage_messages (비공개 답장 DM 전송)<br />
                    • pages_show_list, pages_read_engagement
                  </div>
                  <div>5. <strong>[Generate Access Token]</strong> 버튼 클릭 ➔ 페이스북 계정 권한 승인 팝업 통과</div>
                </div>
              </div>

              {/* Step 5 */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px]">5</span>
                  <span>토큰 60일/영구 연장 & 본 시스템 등록</span>
                </div>
                <div className="text-[11px] text-slate-600 pl-6 space-y-1">
                  <div>1. 발급된 임시 토큰을 [액세스 토큰 도구(Access Token Tool)]에서 <strong>[디버그] ➔ [액세스 토큰 연장(Extend Access Token)]</strong> 클릭하면 60일 또는 무기한 토큰으로 변환됩니다.</div>
                  <div>2. 변환된 토큰 문자열(<code>EAAB...</code>)을 복사하여 아래 본 시스템의 <strong>[Meta 액세스 토큰]</strong> 입력란에 붙여넣고 <strong>[토큰 검증]</strong>을 누르면 비용 0원 무료 자동 DM 시스템이 영구 가동됩니다!</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowGuideModal(false)}
                className="px-4 py-2 bg-slate-900 text-white font-semibold text-xs rounded-lg hover:bg-slate-800 transition-colors"
              >
                확인 및 닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

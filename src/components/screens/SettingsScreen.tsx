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
                ※ instagram_content_publish 권한이 없는 경우 공식 정책에 따라 "연결 완료"로 간주되지 않습니다.
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

        {/* 3. Manychat Adapter */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Manychat 선택형 웹훅 어댑터</h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
              DEMO 상태
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                수신 웹훅 엔드포인트 URL
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

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Manychat Instagram Automation 템플릿의 외부 웹훅 액션에 위 엔드포인트를 등록하면, 댓글 이벤트 발생 시 본 시스템의 24시간 쿨다운 엔진 및 올바른 쿠팡 트래킹 링크가 즉시 응답됩니다.
            </p>
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
    </div>
  );
};

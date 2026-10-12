import React, { useState } from 'react';
import { AffiliatePerformanceRecord, PostContent, Product } from '../../types';
import { MetricCard } from '../common/MetricCard';
import {
  TrendingUp,
  Coins,
  MousePointerClick,
  ShoppingBag,
  Clock,
  Plus,
  Trash2,
  FileCheck,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

interface AnalyticsScreenProps {
  performance: AffiliatePerformanceRecord[];
  posts: PostContent[];
  products: Product[];
  onSaveRecord: (record: AffiliatePerformanceRecord) => void;
  onDeleteRecord: (id: string) => void;
}

export const AnalyticsScreen: React.FC<AnalyticsScreenProps> = ({
  performance,
  posts,
  products,
  onSaveRecord,
  onDeleteRecord,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State for manual entry
  const [selectedPostId, setSelectedPostId] = useState(posts[0]?.id || '');
  const [dateStr, setDateStr] = useState('2026-10-12');
  const [reach, setReach] = useState(12000);
  const [commentsCount, setCommentsCount] = useState(55);
  const [dmSentCount, setDmSentCount] = useState(50);
  const [dmFailedCount, setDmFailedCount] = useState(1);
  const [linkClicks, setLinkClicks] = useState(280);
  const [approvedOrders, setApprovedOrders] = useState(8);
  const [approvedCommission, setApprovedCommission] = useState(21360);
  const [productionTimeMinutes, setProductionTimeMinutes] = useState(40);
  const [toolCost, setToolCost] = useState(0);
  const [notes, setNotes] = useState('쿠팡 파트너스 리포트 실적 대조 수기 입력');

  // Aggregated calculations
  const totalCommission = performance.reduce((sum, r) => sum + r.approvedCommission, 0);
  const totalOrders = performance.reduce((sum, r) => sum + r.approvedOrders, 0);
  const totalClicks = performance.reduce((sum, r) => sum + r.linkClicks, 0);
  const totalReach = performance.reduce((sum, r) => sum + r.reach, 0);
  const totalProductionMinutes = performance.reduce((sum, r) => sum + r.productionTimeMinutes, 0);
  const totalToolCost = performance.reduce((sum, r) => sum + r.toolCost, 0);

  const cvr = totalClicks > 0 ? ((totalOrders / totalClicks) * 100).toFixed(2) : '0.00';
  const epc = totalClicks > 0 ? Math.round(totalCommission / totalClicks) : 0;
  const netProfit = totalCommission - totalToolCost;
  const hourlyRate =
    totalProductionMinutes > 0
      ? Math.round((netProfit / (totalProductionMinutes / 60)))
      : 0;

  const handleAddRecord = () => {
    const post = posts.find((p) => p.id === selectedPostId) || posts[0];
    const newRecord: AffiliatePerformanceRecord = {
      id: `perf-${Date.now()}`,
      postId: post?.id || 'post-001',
      productId: post?.productId || 'prod-001',
      productName: post?.productName || '상품명',
      date: dateStr,
      isVerifiedApi: false, // Strictly manual unless connected to real live API
      sourceType: 'COUPANG_PARTNERS_MANUAL',
      reach: Number(reach) || 0,
      commentsCount: Number(commentsCount) || 0,
      dmSentCount: Number(dmSentCount) || 0,
      dmFailedCount: Number(dmFailedCount) || 0,
      linkClicks: Number(linkClicks) || 0,
      approvedOrders: Number(approvedOrders) || 0,
      approvedCommission: Number(approvedCommission) || 0,
      productionTimeMinutes: Number(productionTimeMinutes) || 0,
      toolCost: Number(toolCost) || 0,
      notes: notes.trim(),
    };

    onSaveRecord(newRecord);
    setIsModalOpen(false);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span className="font-semibold text-slate-700">실적 신뢰도 원칙:</span>
            <span>임의의 가짜 수익 데이터 생성을 엄격히 배제합니다</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            쿠팡 파트너스 제휴 실적 및 ROI 성과 분석
          </h2>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>정산 실적 수기 기록</span>
        </button>
      </div>

      {/* Distinction Banner: Manual vs Verified API */}
      <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0" />
          <div className="text-slate-700">
            <span className="font-bold text-slate-900">데이터 출처 투명성: </span>
            아래 실적은 쿠팡 파트너스 정산 리포트를 대조하여 입력한 <strong className="text-sky-700">[수동 입력(Manual)]</strong> 데이터입니다. API 미연결 시 임의의 가짜 숫자를 조작하지 않습니다.
          </div>
        </div>
        <div className="flex items-center gap-2 text-[11px] shrink-0">
          <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-medium">
            수동 입력: {performance.filter((p) => !p.isVerifiedApi).length}건
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 font-medium">
            공식 API: 0건 (미연동)
          </span>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="인정 제휴 수수료 합계"
          value={`${totalCommission.toLocaleString()}원`}
          kicker="순이익 기준"
          subtext={`툴 비용 ${totalToolCost.toLocaleString()}원 차감`}
          icon={<Coins className="w-4 h-4" />}
          change={`순익 ${netProfit.toLocaleString()}원`}
          changeType="positive"
        />

        <MetricCard
          label="인정 구매 전환율 (CVR)"
          value={`${cvr}%`}
          kicker="구매율 지표"
          subtext={`총 클릭 ${totalClicks.toLocaleString()}회 중 ${totalOrders}건 주문`}
          icon={<ShoppingBag className="w-4 h-4" />}
          change={`클릭당 가치(EPC) ${epc.toLocaleString()}원`}
          changeType="positive"
        />

        <MetricCard
          label="총 노출 및 도달수"
          value={`${totalReach.toLocaleString()}회`}
          kicker="도달 지표"
          subtext={`DM 발송 전환율: ${totalReach > 0 ? ((totalClicks / totalReach) * 100).toFixed(1) : 0}%`}
          icon={<MousePointerClick className="w-4 h-4" />}
          change={`${performance.reduce((s, r) => s + r.dmSentCount, 0)}건 DM 전송`}
          changeType="neutral"
        />

        <MetricCard
          label="제작 시간당 생산성 (시급 환산)"
          value={`${hourlyRate.toLocaleString()}원/hr`}
          kicker="운영 효율성"
          subtext={`총 제작 소요 시간 ${totalProductionMinutes}분`}
          icon={<Clock className="w-4 h-4" />}
          change="시간당 순익 분석"
          changeType="positive"
        />
      </div>

      {/* Performance Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">상품 및 일자별 실적 리포트</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              정산 리포트 대조 일자, 도달, 클릭, 주문 건수 및 수수료 내역
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">정산 일자</th>
                <th className="py-3 px-4">대상 상품</th>
                <th className="py-3 px-4">데이터 구분</th>
                <th className="py-3 px-4 text-right">도달 수</th>
                <th className="py-3 px-4 text-right">댓글 / DM</th>
                <th className="py-3 px-4 text-right">링크 클릭</th>
                <th className="py-3 px-4 text-right">인정 주문</th>
                <th className="py-3 px-4 text-right">인정 수수료</th>
                <th className="py-3 px-4 text-right">제작 시간</th>
                <th className="py-3 px-4 text-center">삭제</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {performance.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                    {record.date}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900 max-w-xs truncate">
                    {record.productName}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                        record.isVerifiedApi
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {record.isVerifiedApi ? '공식 API 실측' : '수동 입력(Manual)'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-medium text-slate-700">
                    {record.reach.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-right text-slate-600">
                    {record.commentsCount} / {record.dmSentCount}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-slate-800">
                    {record.linkClicks.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-sky-700">
                    {record.approvedOrders}건
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                    {record.approvedCommission.toLocaleString()}원
                  </td>
                  <td className="py-3.5 px-4 text-right text-slate-500">
                    {record.productionTimeMinutes}분
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => onDeleteRecord(record.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                      title="실적 삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Entry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 border border-slate-200">
            <div>
              <div className="text-xs font-semibold text-sky-600">쿠팡 파트너스 정산 실적 기록</div>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">
                수기 실적 추가 (가짜 수익 생성 방지)
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">대상 게시물 / 상품</label>
                <select
                  value={selectedPostId}
                  onChange={(e) => setSelectedPostId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                >
                  {posts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.productName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">정산 확인 일자</label>
                  <input
                    type="date"
                    value={dateStr}
                    onChange={(e) => setDateStr(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">도달 수 (Reach)</label>
                  <input
                    type="number"
                    value={reach}
                    onChange={(e) => setReach(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">댓글 수</label>
                  <input
                    type="number"
                    value={commentsCount}
                    onChange={(e) => setCommentsCount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">DM 성공수</label>
                  <input
                    type="number"
                    value={dmSentCount}
                    onChange={(e) => setDmSentCount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">링크 클릭수</label>
                  <input
                    type="number"
                    value={linkClicks}
                    onChange={(e) => setLinkClicks(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    인정 주문 건수 (건)
                  </label>
                  <input
                    type="number"
                    value={approvedOrders}
                    onChange={(e) => setApprovedOrders(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    인정 제휴 수수료 (원)
                  </label>
                  <input
                    type="number"
                    value={approvedCommission}
                    onChange={(e) => setApprovedCommission(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    콘텐츠 제작 시간 (분)
                  </label>
                  <input
                    type="number"
                    value={productionTimeMinutes}
                    onChange={(e) => setProductionTimeMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    도구 이용 비용 (원)
                  </label>
                  <input
                    type="number"
                    value={toolCost}
                    onChange={(e) => setToolCost(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">정산 대조 메모</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleAddRecord}
                className="px-4 py-2 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition-colors"
              >
                실적 저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

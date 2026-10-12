import React from 'react';
import { ScoreBreakdown, ScoreGrade } from '../../types';

interface ScoreGaugeProps {
  totalScore: number;
  grade: ScoreGrade;
  scores?: ScoreBreakdown;
  compact?: boolean;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  totalScore,
  grade,
  scores,
  compact = false,
}) => {
  const getGradeColor = (g: ScoreGrade) => {
    switch (g) {
      case 'S':
        return 'text-sky-700 bg-sky-50 border-sky-200';
      case 'A':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'B':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'C':
        return 'text-slate-700 bg-slate-100 border-slate-200';
    }
  };

  if (compact) {
    return (
      <div className="inline-flex items-center gap-1.5">
        <span
          className={`inline-flex items-center justify-center font-bold text-xs w-5 h-5 rounded border ${getGradeColor(
            grade
          )}`}
        >
          {grade}
        </span>
        <span className="text-xs font-semibold text-slate-800">{totalScore}점</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center justify-center font-bold text-sm w-7 h-7 rounded border ${getGradeColor(
              grade
            )}`}
          >
            {grade}
          </span>
          <div>
            <div className="text-sm font-semibold text-slate-900">{totalScore}점 / 100점</div>
            <div className="text-[11px] text-slate-500">
              {grade === 'S'
                ? '최우수 (즉시 콘텐츠 제작 권장)'
                : grade === 'A'
                ? '우수 (시즌 매력 및 수요 양호)'
                : grade === 'B'
                ? '보통 (차별화 포인트 보강 필요)'
                : '보류 (경쟁력/신뢰도 재검토)'}
            </div>
          </div>
        </div>
      </div>

      {scores && (
        <div className="grid grid-cols-3 gap-2 text-xs pt-1 border-t border-slate-100">
          <div className="p-2 bg-slate-50 rounded-lg">
            <div className="text-slate-500 text-[11px]">수요 신호 (25)</div>
            <div className="font-semibold text-slate-800 mt-0.5">{scores.demandSignal}점</div>
          </div>
          <div className="p-2 bg-slate-50 rounded-lg">
            <div className="text-slate-500 text-[11px]">가격 경쟁력 (20)</div>
            <div className="font-semibold text-slate-800 mt-0.5">{scores.priceCompetitiveness}점</div>
          </div>
          <div className="p-2 bg-slate-50 rounded-lg">
            <div className="text-slate-500 text-[11px]">콘텐츠 매력 (20)</div>
            <div className="font-semibold text-slate-800 mt-0.5">{scores.contentAppeal}점</div>
          </div>
          <div className="p-2 bg-slate-50 rounded-lg">
            <div className="text-slate-500 text-[11px]">계절성 (15)</div>
            <div className="font-semibold text-slate-800 mt-0.5">{scores.seasonality}점</div>
          </div>
          <div className="p-2 bg-slate-50 rounded-lg">
            <div className="text-slate-500 text-[11px]">정보 신뢰도 (10)</div>
            <div className="font-semibold text-slate-800 mt-0.5">{scores.infoReliability}점</div>
          </div>
          <div className="p-2 bg-slate-50 rounded-lg">
            <div className="text-slate-500 text-[11px]">구매 편의성 (10)</div>
            <div className="font-semibold text-slate-800 mt-0.5">{scores.purchaseConvenience}점</div>
          </div>
        </div>
      )}
    </div>
  );
};

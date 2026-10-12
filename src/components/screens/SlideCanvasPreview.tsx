import React, { useEffect, useRef, useState } from 'react';
import { CarouselSlide } from '../../types';
import { renderSlideToCanvas, downloadCanvasAsPng } from '../../utils/canvasExporter';
import { Download, Sparkles, CheckCircle2 } from 'lucide-react';

interface SlideCanvasPreviewProps {
  slide: CarouselSlide;
  totalSlides: number;
  productName: string;
  aspectRatio: '1:1' | '4:5';
}

export const SlideCanvasPreview: React.FC<SlideCanvasPreviewProps> = ({
  slide,
  totalSlides,
  productName,
  aspectRatio,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dataUrl, setDataUrl] = useState<string>('');
  const [isRendering, setIsRendering] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    setIsRendering(true);

    renderSlideToCanvas(slide, totalSlides, { aspectRatio, productName })
      .then((canvas) => {
        if (!isCancelled) {
          setDataUrl(canvas.toDataURL('image/png'));
          setIsRendering(false);
        }
      })
      .catch((err) => {
        console.error('Canvas render error:', err);
        if (!isCancelled) setIsRendering(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [slide, totalSlides, productName, aspectRatio]);

  const handleDownload = async () => {
    const canvas = await renderSlideToCanvas(slide, totalSlides, {
      aspectRatio,
      productName,
    });
    const filename = `slide-${slide.slideNumber}-${slide.slideType.toLowerCase()}.png`;
    downloadCanvasAsPng(canvas, filename);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Visual Canvas Display Frame (Instagram Mobile Style) */}
      <div
        ref={containerRef}
        className={`relative w-full max-w-sm rounded-xl overflow-hidden shadow-md border border-slate-300/80 bg-slate-900 flex items-center justify-center transition-all ${
          aspectRatio === '4:5' ? 'aspect-4/5' : 'aspect-square'
        }`}
      >
        {dataUrl ? (
          <img
            src={dataUrl}
            alt={slide.altText}
            className="w-full h-full object-cover select-none"
          />
        ) : (
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
            <span>1080px 고해상도 렌더링 중...</span>
          </div>
        )}

        {/* AI Graphic Label Overlay */}
        {slide.isAIGeneratedGraphic && (
          <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[10px] text-white/90">
            설명용 그래픽 표기 적용됨
          </div>
        )}
      </div>

      {/* Slide Actions */}
      <div className="flex items-center justify-between w-full max-w-sm px-1 text-xs text-slate-500">
        <span className="font-mono text-[11px]">
          {aspectRatio === '4:5' ? '1080 x 1350 px (4:5)' : '1080 x 1080 px (1:1)'}
        </span>
        <button
          onClick={handleDownload}
          disabled={isRendering}
          className="px-2.5 py-1 text-slate-700 hover:text-sky-700 hover:bg-sky-50 rounded-md font-medium flex items-center gap-1 transition-colors text-[11px]"
        >
          <Download className="w-3 h-3" />
          <span>이 장 PNG 다운로드</span>
        </button>
      </div>
    </div>
  );
};

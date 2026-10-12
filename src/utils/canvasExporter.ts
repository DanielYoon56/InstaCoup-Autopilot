import { CarouselSlide } from '../types';

interface RenderOptions {
  aspectRatio: '1:1' | '4:5';
  productName: string;
}

/**
 * High-definition Canvas renderer for Instagram Carousel Slides (1080x1080 or 1080x1350)
 */
export async function renderSlideToCanvas(
  slide: CarouselSlide,
  totalSlides: number,
  options: RenderOptions
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  const width = 1080;
  const height = options.aspectRatio === '4:5' ? 1350 : 1080;

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D context from canvas');

  // Background
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  if (slide.slideType === 'HOOK') {
    gradient.addColorStop(0, '#0f172a');
    gradient.addColorStop(1, '#1e293b');
  } else if (slide.slideType === 'CTA_DISCLOSURE') {
    gradient.addColorStop(0, '#042f2e');
    gradient.addColorStop(1, '#0f172a');
  } else {
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(1, '#f8fafc');
  }
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Soft decorative background shapes
  ctx.save();
  ctx.globalAlpha = 0.08;
  ctx.fillStyle = slide.accentColor || '#0284c7';
  ctx.beginPath();
  ctx.arc(width * 0.85, height * 0.15, 280, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  const isDark = slide.slideType === 'HOOK' || slide.slideType === 'CTA_DISCLOSURE';

  // 1. Top Bar: Category/Kicker, Page indicator, Graphic tag
  const topY = 90;
  ctx.font = '600 24px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
  ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
  ctx.textAlign = 'left';
  const badge = slide.badgeText || `0${slide.slideNumber}. ${slide.slideType}`;
  ctx.fillText(badge, 80, topY);

  // Page Indicator
  ctx.textAlign = 'right';
  ctx.font = '700 24px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
  ctx.fillStyle = isDark ? '#38bdf8' : '#0284c7';
  ctx.fillText(`${slide.slideNumber} / ${totalSlides}`, width - 80, topY);

  // Subtle separator line
  ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(80, topY + 24);
  ctx.lineTo(width - 80, topY + 24);
  ctx.stroke();

  // 2. Main Title (Wrapped)
  ctx.textAlign = 'left';
  ctx.font = '800 48px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
  ctx.fillStyle = isDark ? '#ffffff' : '#0f172a';

  let currentY = topY + 110;
  const titleLines = wrapText(ctx, slide.title, width - 160);
  for (const line of titleLines) {
    ctx.fillText(line, 80, currentY);
    currentY += 62;
  }

  // 3. Subtitle (if any)
  if (slide.subtitle) {
    currentY += 10;
    ctx.font = '600 28px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
    ctx.fillStyle = isDark ? '#38bdf8' : '#0284c7';
    const subLines = wrapText(ctx, slide.subtitle, width - 160);
    for (const line of subLines) {
      ctx.fillText(line, 80, currentY);
      currentY += 40;
    }
  }

  currentY += 30;

  // 4. Central Visual / Feature Card Box
  const cardBoxY = currentY;
  const cardBoxHeight = options.aspectRatio === '4:5' ? 440 : 360;
  const cardBoxWidth = width - 160;

  // Render card background
  ctx.fillStyle = isDark ? 'rgba(255,255,255,0.05)' : '#ffffff';
  roundRect(ctx, 80, cardBoxY, cardBoxWidth, cardBoxHeight, 20);
  ctx.fill();

  ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Inside Card: Body prose
  ctx.fillStyle = isDark ? '#e2e8f0' : '#334155';
  ctx.font = '500 28px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
  let cardInnerY = cardBoxY + 54;
  const bodyLines = wrapText(ctx, slide.body, cardBoxWidth - 60);
  for (const line of bodyLines.slice(0, 3)) {
    ctx.fillText(line, 110, cardInnerY);
    cardInnerY += 42;
  }

  // Inside Card: Key Points
  cardInnerY += 24;
  ctx.font = '600 26px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';

  slide.bulletPoints.slice(0, 3).forEach((bp) => {
    // Bullet marker
    ctx.fillStyle = isDark ? '#38bdf8' : '#0284c7';
    ctx.beginPath();
    ctx.arc(120, cardInnerY - 8, 5, 0, Math.PI * 2);
    ctx.fill();

    // Bullet text
    ctx.fillStyle = isDark ? '#f1f5f9' : '#1e293b';
    const bpLines = wrapText(ctx, bp, cardBoxWidth - 90);
    for (const bLine of bpLines.slice(0, 2)) {
      ctx.fillText(bLine, 140, cardInnerY);
      cardInnerY += 38;
    }
    cardInnerY += 6;
  });

  // 5. Visual Guide / AI Graphic Disclosure Tag
  currentY = cardBoxY + cardBoxHeight + 40;

  if (slide.isAIGeneratedGraphic) {
    ctx.font = '500 20px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
    ctx.fillStyle = isDark ? '#64748b' : '#94a3b8';
    ctx.fillText('※ 본 이미지는 제품 이해를 돕기 위한 설명용 그래픽 디자인입니다.', 80, currentY);
    currentY += 34;
  }

  // 6. Fact Source
  ctx.font = '500 22px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
  ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
  ctx.fillText(`출처: ${slide.factSource}`, 80, currentY);

  // 7. Bottom FTC Bar
  const footerY = height - 70;
  ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
  ctx.beginPath();
  ctx.moveTo(80, footerY - 24);
  ctx.lineTo(width - 80, footerY - 24);
  ctx.stroke();

  ctx.font = '500 20px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
  ctx.fillStyle = isDark ? '#64748b' : '#94a3b8';
  ctx.fillText('Instagram @affiliate_autopilot  ·  쿠팡 파트너스 활동 수수료 고지 준수', 80, footerY);

  return canvas;
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = ctx.measureText(testLine).width;
    if (testWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Trigger browser download for a rendered canvas
 */
export function downloadCanvasAsPng(canvas: HTMLCanvasElement, filename: string) {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

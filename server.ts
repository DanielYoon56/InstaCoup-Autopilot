import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Google GenAI
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// POST /api/generate/post: Generates 7-slide Korean Instagram carousel + FTC compliant caption
app.post('/api/generate/post', async (req: Request, res: Response) => {
  const { product } = req.body;

  if (!product) {
    return res.status(400).json({ error: '상품 정보가 필요합니다.' });
  }

  if (!ai) {
    // If no GEMINI_API_KEY, return 404 so client fallback takes over seamlessly
    return res.status(503).json({ error: 'GEMINI_API_KEY not configured on server' });
  }

  try {
    const prompt = `당신은 한국 시장 인스타그램 및 쿠팡 파트너스 전문 제휴 마케팅 기획자입니다.
반드시 공정거래위원회 '추천·보증 등에 관한 표시·광고 심사지침' 및 인스타그램 커뮤니티 가이드라인을 100% 준수해야 합니다.

[절대 금지 사항]
1. "제가 직접 써보니 대박", "내돈내산 솔직후기", "지인이 극찬해서" 등 가짜 체험기/허위 후기 절대 작성 금지.
2. 검증되지 않은 의학적 효능, 만병통치, 100% 보장 등 허위 과장 표현 금지.
3. 가짜 가격 할인율 날조 금지.
4. 이미지 프롬프트에는 반드시 '설명용 그래픽 디자인'임을 명시할 것.

[대상 상품 정보]
- 상품명: ${product.name}
- 카테고리: ${product.category}
- 공식 확인 가격: ${product.price?.toLocaleString()}원
- 규격/사양: ${product.specification}
- 정보 출처: ${product.source}
- 콘텐츠 키워드: ${(product.keywords || []).join(', ')}

[요청 사항]
정확히 7장의 슬라이드로 구성된 인스타그램 캐러셀 기획과 인스타그램 본문 캡션을 JSON 형식으로 생성하세요.

슬라이드 구조:
1. 관심 유발 훅 (HOOK): 문제 제기 및 선택 기준 요약
2. 상품 선택 기준 (CRITERIA): 구매 시 실패하지 않는 체크 기준 3가지
3. 확인된 특징 (FEATURES): 공식 스펙표/고시정보 기반 팩트 요약
4. 비교 시 주의사항 (COMPARISON): 소재, 규격, A/S 등 장단점 대조
5. 사용 및 보관 팁 (TIPS): 올바른 취급 요령 및 수명 연장 팁
6. 구매 전 체크리스트 (CHECKLIST): 배치 공간, 배선, 환불 규정 점검
7. 댓글 참여 및 제휴 고지 (CTA_DISCLOSURE): 댓글 [링크] 유도 및 공정위 필수 문구

캡션 필수 사항:
- 읽기 편한 줄바꿈과 정돈된 문장
- 필수 공정위 문구: "이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다."
- 댓글 트리거 단어: ['링크', '정보', '가격']

JSON 스키마:
{
  "carousel": [
    {
      "slideNumber": 1,
      "slideType": "HOOK",
      "title": "슬라이드 제목",
      "subtitle": "부제목",
      "body": "핵심 설명 문장 (2~3줄)",
      "bulletPoints": ["포인트 1", "포인트 2", "포인트 3"],
      "visualPrompt": "설명용 그래픽 디자인 시각 묘사",
      "altText": "시각 장애인을 위한 접근성 대체 텍스트",
      "factSource": "${product.source}",
      "badgeText": "01. 선택 기준",
      "accentColor": "#0284c7",
      "isAIGeneratedGraphic": true
    }
    // ... 2부터 7까지 총 7개
  ],
  "caption": {
    "koreanCaption": "줄바꿈이 포함된 정갈한 인스타그램 캡션 본문",
    "hashtags": ["#태그1", "#태그2"],
    "commentCallToAction": "댓글에 '링크'라고 남겨주시면 DM으로 최저가 구매 링크를 즉시 보내드립니다!",
    "triggerKeywords": ["링크", "정보", "가격"],
    "ftcDisclosure": "이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.",
    "verificationChecklistSummary": "상품명 일치, 가격 검증, 공정위 고지 확인"
  }
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('빈 응답이 반환되었습니다.');
    }

    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (error: any) {
    console.error('Gemini post generation error:', error);
    return res.status(500).json({ error: error.message || '콘텐츠 생성 중 오류 발생' });
  }
});

// POST /api/webhooks/simulate-comment: Simulate incoming Instagram comment trigger
app.post('/api/webhooks/simulate-comment', (req: Request, res: Response) => {
  const { username, commentText, triggerKeywords, affiliateUrl, productName } = req.body;

  const matched = (triggerKeywords || ['링크', '정보']).find((kw: string) =>
    (commentText || '').includes(kw)
  );

  if (!matched) {
    return res.json({
      triggered: false,
      reason: '트리거 키워드가 포함되지 않은 일반 댓글입니다.',
    });
  }

  const dmText = `안녕하세요 @${username}님! 문의주신 [${productName}] 쿠팡 로켓배송 실시간 할인 링크입니다:
🔗 ${affiliateUrl}

※ 이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.`;

  return res.json({
    triggered: true,
    matchedKeyword: matched,
    dmText,
    sentAt: new Date().toISOString(),
    status: 'SENT',
  });
});

// GET /api/health
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    geminiConfigured: !!ai,
    environment: process.env.NODE_ENV || 'development',
    time: new Date().toISOString(),
  });
});

// Mount Vite middleware in development
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static('dist'));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Instagram Affiliate Autopilot server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();

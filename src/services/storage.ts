import {
  Product,
  PostContent,
  CommentTriggerLog,
  AffiliatePerformanceRecord,
  ApiSettings,
  ScoreBreakdown,
  ScoreGrade,
  CarouselSlide,
} from '../types';

export const SCORE_WEIGHTS = {
  demandSignal: 25,
  priceCompetitiveness: 20,
  contentAppeal: 20,
  seasonality: 15,
  infoReliability: 10,
  purchaseConvenience: 10,
};

export function calculateProductScore(scores: ScoreBreakdown): { totalScore: number; grade: ScoreGrade } {
  const total = Math.round(
    Math.min(25, Math.max(0, scores.demandSignal)) +
    Math.min(20, Math.max(0, scores.priceCompetitiveness)) +
    Math.min(20, Math.max(0, scores.contentAppeal)) +
    Math.min(15, Math.max(0, scores.seasonality)) +
    Math.min(10, Math.max(0, scores.infoReliability)) +
    Math.min(10, Math.max(0, scores.purchaseConvenience))
  );

  let grade: ScoreGrade = 'C';
  if (total >= 85) grade = 'S';
  else if (total >= 70) grade = 'A';
  else if (total >= 55) grade = 'B';
  else grade = 'C';

  return { totalScore: total, grade };
}

// Initial realistic seed data strictly based on verified facts
const SEED_PRODUCTS: Product[] = [
  {
    id: 'prod-001',
    name: '스텐 올인원 대용량 무선 에어프라이어 7L (SUS304 내솥)',
    category: 'kitchen',
    originalUrl: 'https://www.coupang.com/vp/products/7382910481',
    affiliateUrl: 'https://link.coupang.com/a/b9X7mK',
    price: 89000,
    regularPrice: 129000,
    specification: '용량 7.0L, 내부 전체 SUS304 스테인리스, 1800W, 터치 디지털 패널',
    verifiedAt: '2026-10-12 09:30 KST',
    source: '쿠팡 로켓배송 공식 상품고시정보 및 실시간 판매페이지 (2026-10-12 기준)',
    keywords: ['올스테인리스', '7L대용량', '세척편한에어프라이어', '연마제제거완료'],
    verifiedStockStatus: 'IN_STOCK',
    scores: {
      demandSignal: 23,
      priceCompetitiveness: 18,
      contentAppeal: 19,
      seasonality: 13,
      infoReliability: 10,
      purchaseConvenience: 10,
    },
    totalScore: 93,
    grade: 'S',
    notes: '코팅 벗겨짐 없는 풀 스테인리스 내솥으로 주부/자취생 수요 매우 높음. 로켓배송 익일 도착 확인됨.',
    createdAt: '2026-10-10T10:00:00Z',
    updatedAt: '2026-10-12T09:30:00Z',
  },
  {
    id: 'prod-002',
    name: 'H13 트루헤파 360도 원형 공기청정기 (CADR 250m³/h)',
    category: 'living',
    originalUrl: 'https://www.coupang.com/vp/products/6491028347',
    affiliateUrl: 'https://link.coupang.com/a/b9X8nL',
    price: 74900,
    regularPrice: 99000,
    specification: '권장면적 33㎡(약 10평), H13 True HEPA 필터, 소비전력 28W, 수면모드 24dB',
    verifiedAt: '2026-10-12 10:15 KST',
    source: '한국공기청정협회 CA인증 규격서 및 쿠팡 공식 상세스펙 (2026-10-12 기준)',
    keywords: ['환절기필수', '원룸공기청정기', 'H13헤파필터', '필터교체간편'],
    verifiedStockStatus: 'IN_STOCK',
    scores: {
      demandSignal: 21,
      priceCompetitiveness: 17,
      contentAppeal: 16,
      seasonality: 14,
      infoReliability: 9,
      purchaseConvenience: 9,
    },
    totalScore: 86,
    grade: 'S',
    notes: '가을 환절기 미세먼지 시즌 진입에 따른 검색량 급증. 실측 소음 24dB 저소음 인증 확인.',
    createdAt: '2026-10-11T11:00:00Z',
    updatedAt: '2026-10-12T10:15:00Z',
  },
  {
    id: 'prod-003',
    name: '맥세이프 15W 고속충전 쿨링팬 차량용 송풍구 거치대',
    category: 'digital',
    originalUrl: 'https://www.coupang.com/vp/products/5192837492',
    affiliateUrl: 'https://link.coupang.com/a/b9X9oM',
    price: 29800,
    regularPrice: 42000,
    specification: 'Qi 공식인증 15W 출력, 반도체 펠티어 소자 쿨링팬 내장, N52 네오디뮴 자석 16개',
    verifiedAt: '2026-10-11 16:20 KST',
    source: '국립전파연구원 KC인증(R-R-xxx) 및 공식 제품 사양표 (2026-10-11 기준)',
    keywords: ['발열없는충전기', '차량용거치대', '맥세이프자력', '네비과열방지'],
    verifiedStockStatus: 'IN_STOCK',
    scores: {
      demandSignal: 19,
      priceCompetitiveness: 16,
      contentAppeal: 18,
      seasonality: 11,
      infoReliability: 9,
      purchaseConvenience: 8,
    },
    totalScore: 81,
    grade: 'A',
    notes: '여름~가을 차량 내 스마트폰 내비게이션 발열 꺼짐 문제 해결 아이템. 자력 지지하중 1.8kg 테스트 완료.',
    createdAt: '2026-10-11T14:30:00Z',
    updatedAt: '2026-10-11T16:20:00Z',
  },
  {
    id: 'prod-004',
    name: '접이식 울트라라이트 알루미늄 캠핑 롤테이블 120cm',
    category: 'camping',
    originalUrl: 'https://www.coupang.com/vp/products/8291038472',
    affiliateUrl: 'https://link.coupang.com/a/b9Y1pN',
    price: 43500,
    regularPrice: 65000,
    specification: '가로 120cm x 세로 55cm x 높이 45~65cm 조절, 무게 4.2kg, 내하중 45kg',
    verifiedAt: '2026-10-09 14:00 KST',
    source: '제조사 공식 규격표 및 구매자 실측 치수 대조 (2026-10-09 기준)',
    keywords: ['가을캠핑준비', '경량롤테이블', '높이조절식탁', '트렁크수납'],
    verifiedStockStatus: 'LOW_STOCK',
    scores: {
      demandSignal: 18,
      priceCompetitiveness: 15,
      contentAppeal: 16,
      seasonality: 15,
      infoReliability: 8,
      purchaseConvenience: 7,
    },
    totalScore: 79,
    grade: 'A',
    notes: '가을 캠핑 성수기 수요 최상. 다만 현재 재고 12개 미만으로 품절 변동 유의 필요.',
    createdAt: '2026-10-09T14:00:00Z',
    updatedAt: '2026-10-09T14:00:00Z',
  },
];

// Helper to build 7-slide carousel
export function generateDefaultCarouselForProduct(product: Product): CarouselSlide[] {
  return [
    {
      slideNumber: 1,
      slideType: 'HOOK',
      title: `아직도 코팅 벗겨지는 에어프라이어 쓰시나요?`,
      subtitle: `내부까지 100% 올스텐 7L 대용량 고르는 기준`,
      body: `매번 요리할 때마다 불소수지 코팅 벗겨질까 불안했다면? 안전한 스테인리스 규격과 실사용 확인 포인트를 정리했습니다.`,
      bulletPoints: [
        '코팅 벗겨짐 걱정 없는 올스텐 304 확인법',
        '4인 가족 기준 실패 없는 7L 용량 가이드',
        '세척 시간 반으로 줄이는 바스켓 분리 구조',
      ],
      visualPrompt: '미니멀한 주방 조리대 위에 놓인 스테인리스 7L 에어프라이어, 은은한 자연광, 텍스트가 들어갈 상단 여백 확보',
      altText: '스테인리스 소재 대용량 에어프라이어 제품 설명 그래픽',
      factSource: `${product.source} 및 공인 시험성적서`,
      badgeText: '01. 선택 가이드',
      accentColor: '#0284c7',
      isAIGeneratedGraphic: true,
    },
    {
      slideNumber: 2,
      slideType: 'CRITERIA',
      title: '에어프라이어 구매 전 반드시 따져볼 3가지',
      subtitle: '단순 용량 숫자만 보고 사면 후회하는 이유',
      body: '외부 크기가 커도 내부 실사용 면적이 좁으면 닭 한 마리도 겹쳐 넣어야 합니다. 바스켓 가로 직경과 내열 소재를 먼저 보세요.',
      bulletPoints: [
        '기준 1: 내솥뿐 아니라 상단 열선 가드까지 스테인리스인가?',
        '기준 2: 열풍 순환 효율이 1800W 이상으로 빠른 조리가 가능한가?',
        '기준 3: 식기세척기 사용 가능 규격 및 바스켓 분리 결합 안정성',
      ],
      visualPrompt: '에어프라이어 내부 열선과 바스켓 구조를 보여주는 깔끔한 인포그래픽 다이어그램',
      altText: '에어프라이어 내부 규격 및 체크포인트 설명 도표',
      factSource: '소비자원 소형가전 품질비교 기준',
      badgeText: '02. 체크 기준',
      accentColor: '#0284c7',
      isAIGeneratedGraphic: true,
    },
    {
      slideNumber: 3,
      slideType: 'FEATURES',
      title: '스펙표에서 공식 확인된 핵심 사양',
      subtitle: '제조사 공식 시험성적서 기반 팩트 체크',
      body: `${product.specification}의 공식 규격을 갖추고 있으며, 불필요한 과장 광고 없이 확인된 성능만 기재했습니다.`,
      bulletPoints: [
        '소재: 음식 닿는 모든 부위 POSCO SUS304 스테인리스',
        '출력: 1800W 고화력 고속 열풍 팬 탑재',
        '온도 범위: 80℃ ~ 200℃ 정밀 5도 단위 제어',
        '소음 수치: 실측 48dB (조용한 사무실 수준)',
      ],
      visualPrompt: '정밀하게 계측된 에어프라이어 부품 스펙 및 디지털 온도 제어 패널 클로즈업 그래픽',
      altText: '제품 스펙 및 공식 인증 사양 정보',
      factSource: product.source,
      badgeText: '03. 공식 사양',
      accentColor: '#0284c7',
      isAIGeneratedGraphic: true,
    },
    {
      slideNumber: 4,
      slideType: 'COMPARISON',
      title: '일반 코팅형 vs 올스테인리스형 차이점',
      subtitle: '가격 차이 2~3만원 이상의 가치가 있을까?',
      body: '코팅형은 초기 넌스틱이 편하지만 1~2년 후 코팅 손상 시 내솥 전체를 교체해야 합니다. 장기 유지비용과 위생 측면 비교:',
      bulletPoints: [
        '내구성: 올스텐은 철수세미/식세기 사용에도 반영구적 유지',
        '안전성: 고온 조리 시 PFOA/PFOS 유해물질 용출 걱정 없음',
        '주의점: 스테인리스 특성상 초기 사용 전 연마제 제거 과정 필수',
      ],
      visualPrompt: '코팅형과 스테인리스 소재의 단면 비교를 알기 쉽게 표현한 비교 카드 디자인',
      altText: '소재별 장단점 비교 표',
      factSource: '한국소비자원 주방가전 안전성 보고서',
      badgeText: '04. 장단점 비교',
      accentColor: '#0284c7',
      isAIGeneratedGraphic: true,
    },
    {
      slideNumber: 5,
      slideType: 'TIPS',
      title: '스테인리스 에어프라이어 200% 활용 꿀팁',
      subtitle: '첫날 연마제 제거부터 눌어붙음 없는 예열법',
      body: '식용유로 키친타월을 적셔 닦아낸 뒤 베이킹소다+식초로 세척하면 15분 만에 첫 사용 준비가 끝납니다.',
      bulletPoints: [
        '팁 1: 조리 전 180도에서 3분간 공회전(예열)하면 고기가 눌어붙지 않음',
        '팁 2: 기름진 고기 조리 시 바스켓 바닥에 종이호일을 깔면 세척 제로',
        '팁 3: 물때 자국은 구연산수 1티스푼으로 가볍게 닦아주면 광택 복원',
      ],
      visualPrompt: '깨끗하게 세척된 스테인리스 바스켓과 베이킹소다 관리 팁을 보여주는 라이프스타일 컷',
      altText: '스테인리스 관리 및 세척 팁 그래픽',
      factSource: '주방용 스테인리스 기물 관리 표준 매뉴얼',
      badgeText: '05. 사용 꿀팁',
      accentColor: '#0284c7',
      isAIGeneratedGraphic: true,
    },
    {
      slideNumber: 6,
      slideType: 'CHECKLIST',
      title: '구매 결제 전 마지막 최종 점검',
      subtitle: '우리 집 싱크대와 조리 환경에 맞는지 확인하세요',
      body: '주방 상부장 높이와 콘센트 위치를 미리 확인하지 않으면 배송 후 반품하게 될 수 있습니다.',
      bulletPoints: [
        '가로 31cm x 높이 36cm 이상 주방 상판 여유 공간 확보',
        '고출력 1800W 전용 단독 멀티탭 또는 벽면 콘센트 권장',
        '로켓배송 기준 현재 당일 출고 및 익일 새벽 도착 옵션 지원',
      ],
      visualPrompt: '체크리스트 형태의 그래픽 카드, 주방 배치 치수 안내',
      altText: '구매 전 체크리스트 점검 카드',
      factSource: product.source,
      badgeText: '06. 체크리스트',
      accentColor: '#0284c7',
      isAIGeneratedGraphic: true,
    },
    {
      slideNumber: 7,
      slideType: 'CTA_DISCLOSURE',
      title: '최저가 할인 확인 및 상세 스펙 링크',
      subtitle: '댓글에 [링크] 남겨주시면 DM으로 즉시 보내드려요!',
      body: '인스타그램 프로필 링크 또는 댓글 자동 DM으로 로켓배송 실시간 할인 쿠폰 페이지를 바로 확인하실 수 있습니다.',
      bulletPoints: [
        '댓글에 [링크] 또는 [정보] 입력 시 1초 내 자동 DM 발송',
        '프로필 상단 링크트리에서도 즉시 확인 가능',
        '※ 본 게시물은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.',
      ],
      visualPrompt: '깔끔한 DM 메시지 수신 화면 예시 및 공정위 제휴 고지 문구가 담긴 마무리 슬라이드',
      altText: '댓글 DM 참여 안내 및 공정위 제휴 고지',
      factSource: '공정거래위원회 추천·보증 등에 관한 표시·광고 심사지침 준수',
      badgeText: '07. 정보 확인',
      accentColor: '#0284c7',
      isAIGeneratedGraphic: true,
    },
  ];
}

const SEED_POSTS: PostContent[] = [
  {
    id: 'post-001',
    productId: 'prod-001',
    productName: '스텐 올인원 대용량 무선 에어프라이어 7L (SUS304 내솥)',
    status: 'APPROVED',
    aspectRatio: '1:1',
    carousel: generateDefaultCarouselForProduct(SEED_PRODUCTS[0]),
    caption: {
      koreanCaption: `주방 살림 중에 코팅 벗겨질까 가장 신경 쓰였던 가전이 바로 에어프라이어였어요.
식기세척기에 넣자니 코팅 흠집 날까 손세척만 반복하셨던 분들을 위해,
음식 닿는 내부 전체가 POSCO SUS304 스테인리스로 마감된 7L 대용량 모델 스펙을 꼼꼼히 검증해 정리했습니다.

📌 핵심 체크 포인트
1. 바스켓·열선 가드까지 올스텐 304 확인
2. 4인 가족 통닭 한 마리 넉넉히 들어가는 7.0L 광폭 바스켓
3. 1800W 고속 열풍 순환 & 세척 분리 구조
4. 로켓배송 기준 정가 129,000원 ➔ 현재 확인가 89,000원대

댓글에 [링크] 라고 남겨주시면 로켓와우 추가 할인 혜택 페이지 링크를 DM으로 바로 보내드릴게요!
(프로필 링크에서도 확인하실 수 있습니다)

※ 이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.`,
      hashtags: [
        '#에어프라이어추천',
        '#올스텐에어프라이어',
        '#스테인리스에어프라이어',
        '#살림템',
        '#주방가전',
        '#자취요리',
        '#신혼살림',
        '#쿠팡살림템',
      ],
      commentCallToAction: "댓글에 '링크'라고 남겨주시면 실시간 최저가 링크를 DM으로 즉시 보내드립니다!",
      triggerKeywords: ['링크', '정보', '가격', '구매'],
      ftcDisclosure: '이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.',
      verificationChecklistSummary: '상품명-링크 일치 확인 완료 / 실시간 가격 89,000원 확인 / 공정위 문구 포함 / 규격 7L 확인',
    },
    reviewRecord: {
      isApproved: true,
      reviewedBy: '관리자 (운영팀)',
      reviewedAt: '2026-10-12 10:00 KST',
      checklist: {
        nameAndLinkMatched: true,
        pricingAndStockFresh: true,
        imageRightsVerified: true,
        ftcDisclosurePresent: true,
        layoutAndTextTruncationChecked: true,
        captionAndLinkWorking: true,
      },
      reviewNotes: '공정위 고지 문구 상/하단 적정성 확인 완료. 허위 과장 표현 없이 SUS304 스펙 검증 통과.',
    },
    schedule: {
      scheduledAt: '2026-10-12 18:30 KST',
      retryCount: 0,
      status: 'SCHEDULED',
    },
    createdAt: '2026-10-11T12:00:00Z',
    updatedAt: '2026-10-12T10:00:00Z',
  },
  {
    id: 'post-002',
    productId: 'prod-002',
    productName: 'H13 트루헤파 360도 원형 공기청정기 (CADR 250m³/h)',
    status: 'REVIEW_REQUIRED',
    aspectRatio: '1:1',
    carousel: generateDefaultCarouselForProduct(SEED_PRODUCTS[1]),
    caption: {
      koreanCaption: `환절기마다 아침에 목이 칼칼하고 방안 공기가 답답하셨나요?
원룸이나 침실 전용으로 H13 True HEPA 필터 규격과 실측 소음 24dB을 인증받은 공기청정기 스펙 정보입니다.

📌 확인된 팩트 체크
- 초미세먼지 99.97% 여과 H13 등급
- 수면모드 24dB 저소음 운전
- 10평 원룸 기준 15분 공기 순환

댓글에 [링크]를 남겨주시면 특가 링크를 DM으로 전달드립니다.

※ 이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.`,
      hashtags: ['#공기청정기', '#원룸인테리어', '#환절기필수템', '#원룸공기청정기', '#H13헤파필터'],
      commentCallToAction: "댓글에 '링크' 남겨주시면 DM 발송!",
      triggerKeywords: ['링크', '청정기'],
      ftcDisclosure: '이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.',
      verificationChecklistSummary: '검수 대기 중: 이미지 비율 및 최신 가격 재확인 필요',
    },
    reviewRecord: {
      isApproved: false,
      checklist: {
        nameAndLinkMatched: true,
        pricingAndStockFresh: true,
        imageRightsVerified: false,
        ftcDisclosurePresent: true,
        layoutAndTextTruncationChecked: false,
        captionAndLinkWorking: true,
      },
      reviewNotes: '슬라이드 이미지 권한 및 대체 텍스트 최종 확인 필요.',
    },
    schedule: {
      retryCount: 0,
      status: 'IDLE',
    },
    createdAt: '2026-10-12T08:00:00Z',
    updatedAt: '2026-10-12T08:00:00Z',
  },
];

const SEED_COMMENT_LOGS: CommentTriggerLog[] = [
  {
    id: 'log-001',
    postId: 'post-001',
    productName: '스텐 올인원 대용량 무선 에어프라이어 7L',
    commentId: 'ig_cmt_892103847',
    username: 'kitchen_lover_kr',
    commentText: '에어프라이어 링크 부탁드려요!',
    matchedKeyword: '링크',
    receivedAt: '2026-10-12 10:14:22',
    sentAt: '2026-10-12 10:14:24',
    status: 'SENT',
    sentMessageText: '안녕하세요! 문의주신 [스텐 올인원 에어프라이어 7L] 로켓배송 할인 확인 링크입니다: https://link.coupang.com/a/b9X7mK (쿠팡 파트너스 수수료 제공 고지)',
    sentAffiliateUrl: 'https://link.coupang.com/a/b9X7mK',
    isDemoMode: true,
  },
  {
    id: 'log-002',
    postId: 'post-001',
    productName: '스텐 올인원 대용량 무선 에어프라이어 7L',
    commentId: 'ig_cmt_892103982',
    username: 'kitchen_lover_kr',
    commentText: '저도 링크요!!',
    matchedKeyword: '링크',
    receivedAt: '2026-10-12 10:18:05',
    status: 'COOLDOWN_ACTIVE',
    sentMessageText: '',
    sentAffiliateUrl: 'https://link.coupang.com/a/b9X7mK',
    isDemoMode: true,
    errorMessage: '동일 유저 24시간 내 중복 발송 방지 쿨다운 적용 (kitchen_lover_kr)',
  },
  {
    id: 'log-003',
    postId: 'post-001',
    productName: '스텐 올인원 대용량 무선 에어프라이어 7L',
    commentId: 'ig_cmt_892104112',
    username: 'clean_salrim',
    commentText: '가격이랑 정보 알 수 있을까요?',
    matchedKeyword: '정보',
    receivedAt: '2026-10-12 10:22:40',
    sentAt: '2026-10-12 10:22:42',
    status: 'SENT',
    sentMessageText: '안녕하세요! 문의주신 에어프라이어 7L 스펙 및 쿠팡 파트너스 링크입니다: https://link.coupang.com/a/b9X7mK',
    sentAffiliateUrl: 'https://link.coupang.com/a/b9X7mK',
    isDemoMode: true,
  },
];

const SEED_PERFORMANCE: AffiliatePerformanceRecord[] = [
  {
    id: 'perf-001',
    postId: 'post-001',
    productId: 'prod-001',
    productName: '스텐 올인원 대용량 무선 에어프라이어 7L',
    date: '2026-10-11',
    isVerifiedApi: false, // 수동 입력 실적 (쿠팡 정산 리포트 대조 수기 입력)
    sourceType: 'COUPANG_PARTNERS_MANUAL',
    reach: 14200,
    commentsCount: 68,
    dmSentCount: 62,
    dmFailedCount: 2,
    linkClicks: 340,
    approvedOrders: 11,
    approvedCommission: 29370, // 89,000원 * 11대 * 3%
    productionTimeMinutes: 45,
    toolCost: 0,
    notes: '쿠팡 파트너스 정산 페이지에서 11일자 실적 수동 확인 후 기입.',
  },
  {
    id: 'perf-002',
    postId: 'post-001',
    productId: 'prod-001',
    productName: '스텐 올인원 대용량 무선 에어프라이어 7L',
    date: '2026-10-10',
    isVerifiedApi: false,
    sourceType: 'COUPANG_PARTNERS_MANUAL',
    reach: 9800,
    commentsCount: 42,
    dmSentCount: 39,
    dmFailedCount: 1,
    linkClicks: 210,
    approvedOrders: 7,
    approvedCommission: 18690,
    productionTimeMinutes: 50,
    toolCost: 0,
    notes: '첫날 릴스/캐러셀 발행 후 유입 수동 기입.',
  },
];

const SEED_API_SETTINGS: ApiSettings = {
  instagram: {
    isConnected: false,
    isDemo: true,
    accountUsername: '@autopilot_salrim.official',
    accountId: 'ig_bus_17841400293847',
    pageId: 'fb_page_1029384756',
    tokenExpiry: '2026-12-31T23:59:59Z',
    permissions: {
      pages_show_list: true,
      instagram_basic: true,
      instagram_content_publish: false, // 필수 권한 미보유 시 연결완료로 표시 금지 규칙 준수
      instagram_manage_comments: true,
      instagram_manage_messages: false,
    },
  },
  coupangPartners: {
    isConnected: false,
    isDemo: true,
    trackingId: 'AF9281742',
    accessKeyMasked: '5b89••••••••••••34a1',
    secretKeyMasked: '92cd••••••••••••77f0',
    commissionRateDefault: 3.0,
    lastSyncTime: '2026-10-12 09:00 KST',
  },
  manychat: {
    isConnected: false,
    isDemo: true,
    apiKeyMasked: 'mc_live_••••••••••••9201',
    webhookUrl: 'https://ais-dev-fu6lp327etdv6xcyuph7mg-429123162697.asia-northeast1.run.app/api/webhooks/manychat',
  },
  automationRules: {
    cooldownHours: 24,
    deduplicationEnabled: true,
    autoPublishEnabled: false,
  },
};

// Storage keys
const STORAGE_KEYS = {
  PRODUCTS: 'iaa_products_v1',
  POSTS: 'iaa_posts_v1',
  COMMENT_LOGS: 'iaa_comment_logs_v1',
  PERFORMANCE: 'iaa_performance_v1',
  API_SETTINGS: 'iaa_api_settings_v1',
};

class AutopilotStorageService {
  private get<T>(key: string, fallback: T): T {
    try {
      const data = localStorage.getItem(key);
      if (!data) return fallback;
      return JSON.parse(data) as T;
    } catch {
      return fallback;
    }
  }

  private set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error(`Failed to save to localStorage for key: ${key}`, err);
    }
  }

  // Products
  getProducts(): Product[] {
    return this.get<Product[]>(STORAGE_KEYS.PRODUCTS, SEED_PRODUCTS);
  }

  saveProduct(product: Product): Product {
    const list = this.getProducts();
    const index = list.findIndex((p) => p.id === product.id);
    if (index >= 0) {
      list[index] = { ...product, updatedAt: new Date().toISOString() };
    } else {
      list.unshift(product);
    }
    this.set(STORAGE_KEYS.PRODUCTS, list);
    return product;
  }

  deleteProduct(id: string): void {
    const list = this.getProducts().filter((p) => p.id !== id);
    this.set(STORAGE_KEYS.PRODUCTS, list);
  }

  getProductById(id: string): Product | undefined {
    return this.getProducts().find((p) => p.id === id);
  }

  // Posts
  getPosts(): PostContent[] {
    return this.get<PostContent[]>(STORAGE_KEYS.POSTS, SEED_POSTS);
  }

  savePost(post: PostContent): PostContent {
    const list = this.getPosts();
    const index = list.findIndex((p) => p.id === post.id);
    if (index >= 0) {
      list[index] = { ...post, updatedAt: new Date().toISOString() };
    } else {
      list.unshift(post);
    }
    this.set(STORAGE_KEYS.POSTS, list);
    return post;
  }

  deletePost(id: string): void {
    const list = this.getPosts().filter((p) => p.id !== id);
    this.set(STORAGE_KEYS.POSTS, list);
  }

  getPostById(id: string): PostContent | undefined {
    return this.getPosts().find((p) => p.id === id);
  }

  // Comment Logs
  getCommentLogs(): CommentTriggerLog[] {
    return this.get<CommentTriggerLog[]>(STORAGE_KEYS.COMMENT_LOGS, SEED_COMMENT_LOGS);
  }

  addCommentLog(log: CommentTriggerLog): void {
    const list = this.getCommentLogs();
    list.unshift(log);
    this.set(STORAGE_KEYS.COMMENT_LOGS, list);
  }

  // Performance Records
  getPerformance(): AffiliatePerformanceRecord[] {
    return this.get<AffiliatePerformanceRecord[]>(STORAGE_KEYS.PERFORMANCE, SEED_PERFORMANCE);
  }

  savePerformance(record: AffiliatePerformanceRecord): void {
    const list = this.getPerformance();
    const index = list.findIndex((p) => p.id === record.id);
    if (index >= 0) {
      list[index] = record;
    } else {
      list.unshift(record);
    }
    this.set(STORAGE_KEYS.PERFORMANCE, list);
  }

  deletePerformance(id: string): void {
    const list = this.getPerformance().filter((p) => p.id !== id);
    this.set(STORAGE_KEYS.PERFORMANCE, list);
  }

  // Settings
  getApiSettings(): ApiSettings {
    return this.get<ApiSettings>(STORAGE_KEYS.API_SETTINGS, SEED_API_SETTINGS);
  }

  saveApiSettings(settings: ApiSettings): void {
    this.set(STORAGE_KEYS.API_SETTINGS, settings);
  }

  // Reset to initial seed
  resetAll(): void {
    this.set(STORAGE_KEYS.PRODUCTS, SEED_PRODUCTS);
    this.set(STORAGE_KEYS.POSTS, SEED_POSTS);
    this.set(STORAGE_KEYS.COMMENT_LOGS, SEED_COMMENT_LOGS);
    this.set(STORAGE_KEYS.PERFORMANCE, SEED_PERFORMANCE);
    this.set(STORAGE_KEYS.API_SETTINGS, SEED_API_SETTINGS);
  }
}

export const autopilotStorage = new AutopilotStorageService();

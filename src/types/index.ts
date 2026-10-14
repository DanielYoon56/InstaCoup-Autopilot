/**
 * Instagram Affiliate Autopilot v1.0
 * Core Type Definitions
 */

export type ProductCategory =
  | 'kitchen'
  | 'living'
  | 'digital'
  | 'fashion'
  | 'beauty'
  | 'food'
  | 'camping'
  | 'other';

export interface ScoreBreakdown {
  demandSignal: number; // 0~25 (수요 신호)
  priceCompetitiveness: number; // 0~20 (가격 경쟁력)
  contentAppeal: number; // 0~20 (콘텐츠 매력)
  seasonality: number; // 0~15 (계절성)
  infoReliability: number; // 0~10 (정보 신뢰도)
  purchaseConvenience: number; // 0~10 (구매 편의성)
}

export type ScoreGrade = 'S' | 'A' | 'B' | 'C';

export interface Product {
  id: string;
  name: string; // 상품명
  category: ProductCategory; // 카테고리
  originalUrl: string; // 공식/원문 판매 URL
  affiliateUrl: string; // 쿠팡 파트너스 트래킹 URL
  price: number; // 현재 가격 (KRW)
  regularPrice?: number; // 정가 (할인율 계산용)
  specification: string; // 규격 / 용량 / 사양
  verifiedAt: string; // 확인 시각 (ISO)
  source: string; // 확인 출처 (예: "쿠팡 로켓 공식 상세페이지 2026-10-12")
  keywords: string[]; // 콘텐츠 핵심 키워드
  scores: ScoreBreakdown;
  totalScore: number; // 총합 100점 만점
  grade: ScoreGrade;
  verifiedStockStatus: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type CompetitionStatus = 'BLUE_OCEAN' | 'NORMAL' | 'RED_OCEAN';
export type SeasonalityStatus = 'RISING' | 'PEAK' | 'STEADY' | 'DECLINING';

export interface SourcingKeyword {
  id: string;
  keyword: string; // 핵심 검색 키워드
  category: ProductCategory; // 카테고리
  monthlySearchVolume: number; // 월간 검색수 (PC + MO)
  mobileSearchRatio: number; // 모바일 검색 비중 (%)
  productCount: number; // 네이버/쿠팡 등록 상품수
  competitionIndex: number; // 경쟁 강도 (상품수 / 검색수)
  competitionStatus: CompetitionStatus; // 블루오션 / 보통 / 레드오션
  trendGrowthRate: number; // 전월 대비 검색 증가율 (%)
  seasonalityStatus: SeasonalityStatus; // 급상승 / 성수기 피크 / 안정 / 비수기
  shoppingIntentRatio: number; // 쇼핑성 검색 의도 비율 (%)
  recommendedProductTitle: string; // 발굴된 추천 상품 후보명
  estimatedPrice: number; // 적정 타겟 가격대 (원)
  estimatedCommissionRate: number; // 쿠팡 파트너스 예상 수수료율 (%)
  suggestedSpecs: string; // 확인된 핵심 스펙 가이드
  sourcingPoints: string[]; // 인스타그램 캐러셀 소구 포인트
  dataSources: string; // 데이터 출처 (네이버 데이터랩, 아이템스카우트 등)
  isImported?: boolean; // 파이프라인 등록 여부
}

export type SlideType =
  | 'HOOK' // 1. 관심을 끄는 첫 장
  | 'CRITERIA' // 2. 상품 선택 기준
  | 'FEATURES' // 3. 상품의 확인된 특징
  | 'COMPARISON' // 4. 비교할 때 주의할 점
  | 'TIPS' // 5. 사용·보관 팁
  | 'CHECKLIST' // 6. 구매 전 체크리스트
  | 'CTA_DISCLOSURE'; // 7. 댓글 참여 안내 및 제휴 고지

export interface CarouselSlide {
  slideNumber: number; // 1~7
  slideType: SlideType;
  title: string;
  subtitle?: string;
  body: string;
  bulletPoints: string[];
  visualPrompt: string; // 이미지 촬영/선정 가이드
  altText: string; // 접근성 대체 텍스트
  factSource: string; // 상품 사실의 출처
  badgeText?: string;
  accentColor?: string;
  isAIGeneratedGraphic: boolean; // AI 설명용 그래픽 여부 고지
}

export type ContentStatus =
  | 'DRAFT'
  | 'GENERATED'
  | 'REVIEW_REQUIRED'
  | 'APPROVED'
  | 'SCHEDULED'
  | 'PUBLISHED'
  | 'FAILED';

export interface ReviewChecklist {
  nameAndLinkMatched: boolean; // 상품명과 링크의 일치
  pricingAndStockFresh: boolean; // 가격·규격·재고 정보 최신성
  imageRightsVerified: boolean; // 이미지 사용 권한 및 설명그래픽 고지
  ftcDisclosurePresent: boolean; // 공정위 제휴 관계 고지 포함
  layoutAndTextTruncationChecked: boolean; // 1:1 / 4:5 비율 및 글자 잘림
  captionAndLinkWorking: boolean; // 캡션 및 제휴 링크 URL 정상 작동
}

export interface ReviewRecord {
  isApproved: boolean;
  reviewedBy?: string;
  reviewedAt?: string;
  checklist: ReviewChecklist;
  reviewNotes?: string;
}

export interface PostSchedule {
  scheduledAt?: string;
  publishedAt?: string;
  instagramPostId?: string;
  instagramPermalink?: string;
  publishError?: string;
  retryCount: number;
  status: 'IDLE' | 'SCHEDULED' | 'PUBLISHING' | 'PUBLISHED' | 'FAILED';
}

export interface PostContent {
  id: string;
  productId: string;
  productName: string;
  status: ContentStatus;
  aspectRatio: '1:1' | '4:5';
  carousel: CarouselSlide[];
  caption: {
    koreanCaption: string;
    hashtags: string[];
    commentCallToAction: string; // 댓글 유도 문구
    triggerKeywords: string[]; // 트리거 단어들 (e.g. ['링크', '정보'])
    ftcDisclosure: string; // "이 포스팅은 쿠팡 파트너스 활동의 일환으로..."
    verificationChecklistSummary: string;
  };
  reviewRecord: ReviewRecord;
  schedule: PostSchedule;
  createdAt: string;
  updatedAt: string;
}

export interface CommentTriggerLog {
  id: string;
  postId: string;
  productName: string;
  commentId: string;
  username: string;
  commentText: string;
  matchedKeyword: string;
  receivedAt: string;
  sentAt?: string;
  status: 'SENT' | 'SKIPPED_DUPLICATE' | 'COOLDOWN_ACTIVE' | 'ERROR' | 'DEMO_QUEUED';
  sentMessageText: string;
  sentAffiliateUrl: string;
  isDemoMode: boolean;
  errorMessage?: string;
}

export interface AffiliatePerformanceRecord {
  id: string;
  postId: string;
  productId: string;
  productName: string;
  date: string; // YYYY-MM-DD
  isVerifiedApi: boolean; // true = Coupang API 실측, false = 수동 입력 (Manual)
  sourceType: 'COUPANG_PARTNERS_MANUAL' | 'COUPANG_PARTNERS_API';
  reach: number; // 도달 수
  commentsCount: number; // 댓글 수
  dmSentCount: number; // DM 발송 성공
  dmFailedCount: number; // DM 발송 실패
  linkClicks: number; // 링크 클릭 수
  approvedOrders: number; // 인정 주문 건수
  approvedCommission: number; // 인정 제휴 수수료 (원)
  productionTimeMinutes: number; // 콘텐츠 제작 시간 (분)
  toolCost: number; // 툴 및 광고 비용 (원)
  notes?: string;
}

export interface ApiSettings {
  instagram: {
    isConnected: boolean;
    isDemo: boolean;
    accountUsername: string;
    accountId: string;
    pageId: string;
    tokenExpiry: string;
    permissions: {
      pages_show_list: boolean;
      instagram_basic: boolean;
      instagram_content_publish: boolean;
      instagram_manage_comments: boolean;
      instagram_manage_messages: boolean;
    };
  };
  coupangPartners: {
    isConnected: boolean;
    isDemo: boolean;
    trackingId: string;
    accessKeyMasked: string;
    secretKeyMasked: string;
    commissionRateDefault: number; // 보통 3.0%
    lastSyncTime?: string;
  };
  manychat: {
    isConnected: boolean;
    isDemo: boolean;
    apiKeyMasked: string;
    webhookUrl: string;
  };
  automationRules: {
    cooldownHours: number; // 동일 유저 재발송 방지 (24시간 등)
    deduplicationEnabled: boolean;
    autoPublishEnabled: boolean; // 검수 완료 시에만 허용
  };
}

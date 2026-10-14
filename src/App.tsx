/**
 * Instagram Affiliate Autopilot v1.0
 * Master Application Entry Point
 */

import React, { useState, useEffect } from 'react';
import {
  Product,
  PostContent,
  CommentTriggerLog,
  AffiliatePerformanceRecord,
  ApiSettings,
  SourcingKeyword,
} from './types';
import { autopilotStorage, calculateProductScore } from './services/storage';
import { generateContentForProduct } from './services/aiGenerator';
import { Sidebar, ScreenId } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { DashboardScreen } from './components/screens/DashboardScreen';
import { KeywordSourcingScreen } from './components/screens/KeywordSourcingScreen';
import { ProductListScreen } from './components/screens/ProductListScreen';
import { ProductRegisterModal } from './components/screens/ProductRegisterModal';
import { CarouselEditorScreen } from './components/screens/CarouselEditorScreen';
import { CaptionStudioScreen } from './components/screens/CaptionStudioScreen';
import { ReviewInboxScreen } from './components/screens/ReviewInboxScreen';
import { ScheduleScreen } from './components/screens/ScheduleScreen';
import { CommentDmLogScreen } from './components/screens/CommentDmLogScreen';
import { AnalyticsScreen } from './components/screens/AnalyticsScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [posts, setPosts] = useState<PostContent[]>([]);
  const [commentLogs, setCommentLogs] = useState<CommentTriggerLog[]>([]);
  const [performance, setPerformance] = useState<AffiliatePerformanceRecord[]>([]);
  const [apiSettings, setApiSettings] = useState<ApiSettings>(autopilotStorage.getApiSettings());
  const [sourcingKeywords, setSourcingKeywords] = useState<SourcingKeyword[]>([]);

  const [currentPostId, setCurrentPostId] = useState<string>('');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const loadedProducts = autopilotStorage.getProducts();
    const loadedPosts = autopilotStorage.getPosts();
    const loadedLogs = autopilotStorage.getCommentLogs();
    const loadedPerf = autopilotStorage.getPerformance();
    const loadedSettings = autopilotStorage.getApiSettings();
    const loadedKeywords = autopilotStorage.getSourcingKeywords();

    setProducts(loadedProducts);
    setPosts(loadedPosts);
    setCommentLogs(loadedLogs);
    setPerformance(loadedPerf);
    setApiSettings(loadedSettings);
    setSourcingKeywords(loadedKeywords);

    if (loadedPosts.length > 0 && !currentPostId) {
      setCurrentPostId(loadedPosts[0].id);
    }
  };

  // Convert SourcingKeyword to real Product in pipeline
  const handleImportKeywordToProduct = async (
    kw: SourcingKeyword,
    andGenerate = false
  ) => {
    // Generate scores based on ItemScout & DataLab metrics
    const demandSignal = Math.min(25, Math.round((kw.monthlySearchVolume / 100000) * 15 + 10));
    const priceComp = kw.estimatedPrice < 100000 ? 19 : 16;
    const contentAppeal = kw.shoppingIntentRatio > 80 ? 19 : 16;
    const seasonality = kw.seasonalityStatus === 'RISING' || kw.seasonalityStatus === 'PEAK' ? 15 : 12;
    const infoRel = 10;
    const purchaseConv = 9;

    const scores = {
      demandSignal,
      priceCompetitiveness: priceComp,
      contentAppeal,
      seasonality,
      infoReliability: infoRel,
      purchaseConvenience: purchaseConv,
    };

    const { totalScore, grade } = calculateProductScore(scores);

    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(
      2,
      '0'
    )} KST`;

    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      name: kw.recommendedProductTitle,
      category: kw.category,
      originalUrl: `https://www.coupang.com/np/search?q=${encodeURIComponent(kw.keyword)}`,
      affiliateUrl: `https://link.coupang.com/a/auto_${kw.id.replace('kw-', '')}`,
      price: kw.estimatedPrice,
      regularPrice: Math.round(kw.estimatedPrice * 1.35),
      specification: kw.suggestedSpecs,
      verifiedAt: dateStr,
      source: kw.dataSources,
      keywords: [kw.keyword, ...kw.sourcingPoints.map((p) => p.split(' ')[0])],
      scores,
      totalScore,
      grade,
      verifiedStockStatus: 'IN_STOCK',
      notes: `[DataLab/ItemScout 발굴] 월 검색 ${kw.monthlySearchVolume.toLocaleString()}회 / 경쟁강도 ${kw.competitionIndex} / 급상승 +${kw.trendGrowthRate}%`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    autopilotStorage.saveProduct(newProduct);
    autopilotStorage.markKeywordImported(kw.id, true);
    setProducts(autopilotStorage.getProducts());
    setSourcingKeywords(autopilotStorage.getSourcingKeywords());

    if (andGenerate) {
      await handleGenerateContent(newProduct);
    } else {
      alert(`[${newProduct.name}] 상품이 파이프라인에 등록되었습니다! (평가: ${totalScore}점 ${grade}등급)`);
    }
  };

  // Handlers
  const handleSaveProduct = async (product: Product, andGenerate = false) => {
    autopilotStorage.saveProduct(product);
    setProducts(autopilotStorage.getProducts());

    if (andGenerate) {
      await handleGenerateContent(product);
    }
  };

  const handleUpdateProduct = (product: Product) => {
    autopilotStorage.saveProduct(product);
    setProducts(autopilotStorage.getProducts());
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('해당 상품을 목록에서 삭제하시겠습니까?')) {
      autopilotStorage.deleteProduct(id);
      setProducts(autopilotStorage.getProducts());
    }
  };

  const handleGenerateContent = async (product: Product) => {
    setIsGenerating(true);
    try {
      // Find if post exists already
      const existingPost = posts.find((p) => p.productId === product.id);

      const generated = await generateContentForProduct(product);

      const newPost: PostContent = {
        id: existingPost ? existingPost.id : `post-${Date.now()}`,
        productId: product.id,
        productName: product.name,
        status: 'REVIEW_REQUIRED', // Generated posts always enter Review Required state
        aspectRatio: '1:1',
        carousel: generated.carousel,
        caption: generated.caption,
        reviewRecord: {
          isApproved: false,
          checklist: {
            nameAndLinkMatched: true,
            pricingAndStockFresh: true,
            imageRightsVerified: true,
            ftcDisclosurePresent: true,
            layoutAndTextTruncationChecked: false,
            captionAndLinkWorking: false,
          },
          reviewNotes: '신규 AI 캐러셀 기획 생성 완료. 최종 레이아웃 및 링크 검수 요망.',
        },
        schedule: {
          retryCount: 0,
          status: 'IDLE',
        },
        createdAt: existingPost ? existingPost.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      autopilotStorage.savePost(newPost);
      setPosts(autopilotStorage.getPosts());
      setCurrentPostId(newPost.id);
      setCurrentScreen('carousel');
    } catch (err) {
      console.error('Failed to generate post:', err);
      alert('콘텐츠 생성 중 오류가 발생했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdatePost = (post: PostContent) => {
    autopilotStorage.savePost(post);
    setPosts(autopilotStorage.getPosts());
  };

  const handleAddCommentLog = (log: CommentTriggerLog) => {
    autopilotStorage.addCommentLog(log);
    setCommentLogs(autopilotStorage.getCommentLogs());
  };

  const handleSavePerformance = (record: AffiliatePerformanceRecord) => {
    autopilotStorage.savePerformance(record);
    setPerformance(autopilotStorage.getPerformance());
  };

  const handleDeletePerformance = (id: string) => {
    autopilotStorage.deletePerformance(id);
    setPerformance(autopilotStorage.getPerformance());
  };

  const handleSaveApiSettings = (settings: ApiSettings) => {
    autopilotStorage.saveApiSettings(settings);
    setApiSettings(settings);
  };

  const handleResetData = () => {
    autopilotStorage.resetAll();
    loadData();
    alert('모든 데이터가 초기 샘플로 초기화되었습니다.');
  };

  // Navigations from buttons
  const handleSelectProductForCarousel = (productId: string) => {
    const post = posts.find((p) => p.productId === productId);
    if (post) {
      setCurrentPostId(post.id);
      setCurrentScreen('carousel');
    } else {
      const product = products.find((p) => p.id === productId);
      if (product) {
        handleGenerateContent(product);
      }
    }
  };

  const reviewRequiredCount = posts.filter((p) => p.status === 'REVIEW_REQUIRED').length;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans antialiased text-slate-900">
      {/* Left Sidebar */}
      <Sidebar
        currentScreen={currentScreen}
        onSelectScreen={(screen) => {
          if (screen === 'register') {
            setIsRegisterModalOpen(true);
          } else {
            setCurrentScreen(screen);
          }
        }}
        reviewCount={reviewRequiredCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <Navbar
          currentScreen={currentScreen}
          apiSettings={apiSettings}
          onResetData={handleResetData}
          onNavigateToSettings={() => setCurrentScreen('settings')}
        />

        {/* Screen Routing Body */}
        <main className="flex-1 overflow-y-auto">
          {isGenerating && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full text-center space-y-3">
                <div className="w-10 h-10 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <h4 className="font-bold text-slate-900 text-sm">
                  인스타그램 캐러셀 7장 기획 생성 중...
                </h4>
                <p className="text-xs text-slate-500">
                  공정위 광고 심사 지침과 팩트 스펙을 분석하여 슬라이드 및 캡션을 구성하고 있습니다.
                </p>
              </div>
            </div>
          )}

          {currentScreen === 'dashboard' && (
            <DashboardScreen
              products={products}
              posts={posts}
              commentLogs={commentLogs}
              performance={performance}
              onNavigate={(s) => setCurrentScreen(s)}
              onSelectProductForCarousel={handleSelectProductForCarousel}
            />
          )}

          {currentScreen === 'sourcing' && (
            <KeywordSourcingScreen
              keywords={sourcingKeywords}
              onImportKeywordToProduct={handleImportKeywordToProduct}
              onRefreshKeywords={(updatedKeywords) => {
                setSourcingKeywords(updatedKeywords);
                updatedKeywords.forEach((k) => autopilotStorage.saveSourcingKeyword(k));
              }}
              onNavigateToProducts={() => setCurrentScreen('products')}
            />
          )}

          {currentScreen === 'products' && (
            <ProductListScreen
              products={products}
              onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
              onGeneratePostForProduct={handleGenerateContent}
              onUpdateProduct={handleUpdateProduct}
              onDeleteProduct={handleDeleteProduct}
              onNavigateToSourcing={() => setCurrentScreen('sourcing')}
            />
          )}

          {currentScreen === 'carousel' && (
            <CarouselEditorScreen
              posts={posts}
              products={products}
              currentPostId={currentPostId}
              onSelectPost={(id) => setCurrentPostId(id)}
              onUpdatePost={handleUpdatePost}
              onNavigateToCaption={(id) => {
                setCurrentPostId(id);
                setCurrentScreen('caption');
              }}
              onNavigateToReview={(id) => {
                setCurrentPostId(id);
                setCurrentScreen('review');
              }}
            />
          )}

          {currentScreen === 'caption' && (
            <CaptionStudioScreen
              posts={posts}
              products={products}
              currentPostId={currentPostId}
              onSelectPost={(id) => setCurrentPostId(id)}
              onUpdatePost={handleUpdatePost}
              onNavigateToReview={(id) => {
                setCurrentPostId(id);
                setCurrentScreen('review');
              }}
            />
          )}

          {currentScreen === 'review' && (
            <ReviewInboxScreen
              posts={posts}
              products={products}
              currentPostId={currentPostId}
              onSelectPost={(id) => setCurrentPostId(id)}
              onUpdatePost={handleUpdatePost}
              onNavigateToSchedule={(id) => {
                setCurrentPostId(id);
                setCurrentScreen('schedule');
              }}
              onNavigateToEditor={(id) => {
                setCurrentPostId(id);
                setCurrentScreen('carousel');
              }}
            />
          )}

          {currentScreen === 'schedule' && (
            <ScheduleScreen
              posts={posts}
              apiSettings={apiSettings}
              onUpdatePost={handleUpdatePost}
              onNavigateToSettings={() => setCurrentScreen('settings')}
              onNavigateToReview={(id) => {
                setCurrentPostId(id);
                setCurrentScreen('review');
              }}
            />
          )}

          {currentScreen === 'comment-dm' && (
            <CommentDmLogScreen
              logs={commentLogs}
              posts={posts}
              products={products}
              apiSettings={apiSettings}
              onAddLog={handleAddCommentLog}
            />
          )}

          {currentScreen === 'analytics' && (
            <AnalyticsScreen
              performance={performance}
              posts={posts}
              products={products}
              onSaveRecord={handleSavePerformance}
              onDeleteRecord={handleDeletePerformance}
            />
          )}

          {currentScreen === 'settings' && (
            <SettingsScreen
              settings={apiSettings}
              onSaveSettings={handleSaveApiSettings}
              onResetData={handleResetData}
            />
          )}
        </main>
      </div>

      {/* Global Product Register Modal */}
      <ProductRegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSave={handleSaveProduct}
      />
    </div>
  );
}

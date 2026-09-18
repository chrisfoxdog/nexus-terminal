import React, { useState, useEffect } from 'react';
import { HeaderNav, NavMode } from './components/HeaderNav';
import { MarketplaceView } from './components/MarketplaceView';
import { MemberPassesView } from './components/MemberPassesView';
import { CreatorStudioView } from './components/CreatorStudioView';
import { DevApiPlayground } from './components/DevApiPlayground';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CheckoutModal } from './components/CheckoutModal';
import { GeminiProductChatWidget } from './components/GeminiProductChatWidget';
import { HowToUseModal } from './components/HowToUseModal';
import { WhopAppStoreModal } from './components/WhopAppStoreModal';

import { WhopProduct, ProductPlan, AccessPass } from './types';
import { INITIAL_PRODUCTS, INITIAL_USER_PASSES } from './data/whopProducts';

export default function App() {
  const [currentMode, setCurrentMode] = useState<NavMode>('marketplace');
  const [darkMode, setDarkMode] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEmbedded, setIsEmbedded] = useState(false);
  const [isWhopAppStoreOpen, setIsWhopAppStoreOpen] = useState(false);

  // Detect Whop iframe environment and URL view parameters.
  useEffect(() => {
    try {
      const inIframe = window.self !== window.top;
      const params = new URLSearchParams(window.location.search);
      const viewParam = params.get('view');
      const embeddedParam = params.get('embedded');

      if (inIframe || embeddedParam === 'true') {
        setIsEmbedded(true);
      }

      if (viewParam === 'creator' || viewParam === 'admin') {
        setCurrentMode('creator');
      } else if (viewParam === 'passes' || viewParam === 'member') {
        setCurrentMode('passes');
      } else if (viewParam === 'developer' || viewParam === 'api') {
        setCurrentMode('developer');
      } else if (viewParam === 'marketplace') {
        setCurrentMode('marketplace');
      }
    } catch (err) {
      console.warn('Iframe check failed:', err);
    }
  }, []);

  // Products state with local persistence.
  const [products, setProducts] = useState<WhopProduct[]>(() => {
    const saved = localStorage.getItem('whop_products_catalog');

    if (saved) {
      try {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Error loading products from localStorage:', e);
      }
    }

    return INITIAL_PRODUCTS;
  });

  // User access passes.
  const [userPasses, setUserPasses] = useState<AccessPass[]>(() => {
    const saved = localStorage.getItem('whop_user_passes');

    if (saved) {
      try {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {
        console.error('Error loading passes from localStorage:', e);
      }
    }

    return INITIAL_USER_PASSES;
  });

  // Fetch passes from the backend.
  useEffect(() => {
    fetch('/api/v1/passes')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Pass request failed: ${res.status}`);
        }

        return res.json();
      })
      .then((data) => {
        if (data && Array.isArray(data.passes) && data.passes.length > 0) {
          setUserPasses(data.passes);
        }
      })
      .catch((err) => {
        console.warn('Using local cache for passes:', err);
      });
  }, []);

  // Persist product catalog locally.
  useEffect(() => {
    localStorage.setItem(
      'whop_products_catalog',
      JSON.stringify(products)
    );
  }, [products]);

  // Persist user passes locally.
  useEffect(() => {
    localStorage.setItem(
      'whop_user_passes',
      JSON.stringify(userPasses)
    );
  }, [userPasses]);

  // Reset local demo catalog.
  const handleResetCatalog = () => {
    if (
      window.confirm(
        'Reset catalog and passes back to default initial Whop marketplace data?'
      )
    ) {
      localStorage.removeItem('whop_products_catalog');
      localStorage.removeItem('whop_user_passes');

      setProducts(INITIAL_PRODUCTS);
      setUserPasses(INITIAL_USER_PASSES);
    }
  };

  // Product detail modal.
  const [selectedProduct, setSelectedProduct] =
    useState<WhopProduct | null>(null);

  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Checkout modal.
  const [checkoutProduct, setCheckoutProduct] =
    useState<WhopProduct | null>(null);

  const [checkoutPlan, setCheckoutPlan] =
    useState<ProductPlan | null>(null);

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // How-to-use modal.
  const [isHowToUseOpen, setIsHowToUseOpen] = useState(false);

  // Sync dark mode with the document.
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const userPassProductIds = userPasses.map(
    (pass) => pass.productId
  );

  const handleSelectProduct = (product: WhopProduct) => {
    setSelectedProduct(product);
    setIsDetailOpen(true);
  };

  const handleStartCheckout = (
    product: WhopProduct,
    plan: ProductPlan
  ) => {
    setIsDetailOpen(false);
    setCheckoutProduct(product);
    setCheckoutPlan(plan);
    setIsCheckoutOpen(true);
  };

  const handleCompleteCheckout = (newPass: AccessPass) => {
    setUserPasses((prev) => [newPass, ...prev]);
  };

  const handleAddProduct = (newProd: WhopProduct) => {
    setProducts((prev) => [newProd, ...prev]);
  };

  // Reviews update product review data only.
  // Reviews do NOT grant, upgrade, or create access passes.
  const handleAddReview = (
    productId: string,
    newReview: {
      userName: string;
      userAvatar: string;
      rating: number;
      comment: string;
      date: string;
    }
  ) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) => {
        if (product.id !== productId) {
          return product;
        }

        const updatedReviews = [
          newReview,
          ...product.sampleReviews,
        ];

        const newReviewCount = product.reviewCount + 1;

        const totalStars = updatedReviews.reduce(
          (sum, review) => sum + review.rating,
          0
        );

        const newAverageRating = Number(
          (totalStars / updatedReviews.length).toFixed(1)
        );

        return {
          ...product,
          rating: newAverageRating,
          reviewCount: newReviewCount,
          sampleReviews: updatedReviews,
        };
      })
    );

    setSelectedProduct((prev) => {
      if (!prev || prev.id !== productId) {
        return prev;
      }

      const updatedReviews = [
        newReview,
        ...prev.sampleReviews,
      ];

      const newReviewCount = prev.reviewCount + 1;

      const totalStars = updatedReviews.reduce(
        (sum, review) => sum + review.rating,
        0
      );

      const newAverageRating = Number(
        (totalStars / updatedReviews.length).toFixed(1)
      );

      return {
        ...prev,
        rating: newAverageRating,
        reviewCount: newReviewCount,
        sampleReviews: updatedReviews,
      };
    });
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-200 font-sans ${
        darkMode
          ? 'bg-slate-950 text-slate-100'
          : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Header Navigation */}
      <HeaderNav
        currentMode={currentMode}
        onSelectMode={setCurrentMode}
        activePassesCount={userPasses.length}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenHowToUse={() => setIsHowToUseOpen(true)}
        onResetCatalog={handleResetCatalog}
        onOpenWhopAppStore={() => setIsWhopAppStoreOpen(true)}
        isEmbedded={isEmbedded}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {currentMode === 'marketplace' && (
          <MarketplaceView
            products={products}
            darkMode={darkMode}
            onSelectProduct={handleSelectProduct}
            searchQuery={searchQuery}
            userPassProductIds={userPassProductIds}
          />
        )}

        {currentMode === 'passes' && (
          <MemberPassesView
            userPasses={userPasses}
            darkMode={darkMode}
            onBrowseMarketplace={() =>
              setCurrentMode('marketplace')
            }
            products={products}
            onRedeemKey={(newPass) =>
              setUserPasses((prev) => [newPass, ...prev])
            }
          />
        )}

        {currentMode === 'creator' && (
          <CreatorStudioView
            products={products}
            darkMode={darkMode}
            onAddProduct={handleAddProduct}
          />
        )}

        {currentMode === 'developer' && (
          <DevApiPlayground darkMode={darkMode} />
        )}
      </main>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        darkMode={darkMode}
        onStartCheckout={handleStartCheckout}
        isAlreadyUnlocked={
          selectedProduct
            ? userPassProductIds.includes(selectedProduct.id)
            : false
        }
        onLaunchAppWidget={() => {
          setIsDetailOpen(false);
          setCurrentMode('passes');
        }}
        onSubmitReview={handleAddReview}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        product={checkoutProduct}
        plan={checkoutPlan}
        darkMode={darkMode}
        onCompleteCheckout={handleCompleteCheckout}
      />

      {/* Gemini AI Product Advisory Chat */}
      <GeminiProductChatWidget
        products={products}
        darkMode={darkMode}
        onSelectProduct={handleSelectProduct}
      />

      {/* How To Use Modal */}
      <HowToUseModal
        isOpen={isHowToUseOpen}
        onClose={() => setIsHowToUseOpen(false)}
        darkMode={darkMode}
        onSelectMode={setCurrentMode}
      />

      {/* Whop App Store Listing & Launch Guide Modal */}
      <WhopAppStoreModal
        isOpen={isWhopAppStoreOpen}
        onClose={() => setIsWhopAppStoreOpen(false)}
        darkMode={darkMode}
        onSwitchMode={setCurrentMode}
      />
    </div>
  );
}
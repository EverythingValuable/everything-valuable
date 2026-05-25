import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

import AppLayout from './components/layout/AppLayout';
import Home from './pages/Home';
import Browse from './pages/Browse';
import ProductDetail from './pages/ProductDetail';
import SellerDashboard from './pages/SellerDashboard';
import BuyerDashboard from './pages/BuyerDashboard';
import HowItWorks from './pages/HowItWorks';
import Pricing from './pages/Pricing';
import About from './pages/About';
import SellerOnboarding from './pages/SellerOnboarding';
import ListingStudio from './pages/ListingStudio';
import SellWithUs from './pages/SellWithUs';
import SellerSettings from './pages/SellerSettings';
import SellerPublicProfile from './pages/SellerPublicProfile';
import RealEstateHome from './pages/RealEstateHome';
import RealEstateDetail from './pages/RealEstateDetail';
import Portal from './pages/Portal';
import HotspotManager from './pages/HotspotManager';
import BulkUpload from './pages/BulkUpload';
import AdminDashboard from './pages/AdminDashboard';
import ConsignorDetail from './pages/ConsignorDetail';
import SellerAccess from './pages/SellerAccess';
import Dealers from './pages/Dealers';
import ItemsNearMe from './pages/ItemsNearMe';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <img src="https://media.base44.com/images/public/69beac1c3231aaeb891946d5/3a2676053_LOGOEV.png" alt="Everything Valuable Logo" className="h-12 w-auto mx-auto" />
          <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    }
    // auth_required and other errors: allow browsing — bidding will gate itself
  }

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Portal />} />
        <Route path="/personal-property" element={<Home />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/item/:id" element={<ProductDetail />} />
        <Route path="/seller" element={<SellerDashboard />} />
        <Route path="/buyer" element={<BuyerDashboard />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/about" element={<About />} />
        <Route path="/sell" element={<SellWithUs />} />
        <Route path="/seller/onboarding" element={<SellerOnboarding />} />
        <Route path="/seller/studio" element={<ListingStudio />} />
        <Route path="/seller/settings" element={<SellerSettings />} />
        <Route path="/seller/profile" element={<SellerPublicProfile />} />
        <Route path="/real-property" element={<RealEstateHome />} />
        <Route path="/real-property/listing/:id" element={<RealEstateDetail />} />
        <Route path="/hotspot-manager" element={<HotspotManager />} />
        <Route path="/seller/bulk-upload" element={<BulkUpload />} />
        <Route path="/seller/consignor/:id" element={<ConsignorDetail />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/seller-access" element={<SellerAccess />} />
        <Route path="/dealers" element={<Dealers />} />
        <Route path="/items-near-me" element={<ItemsNearMe />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster position="bottom-center" />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
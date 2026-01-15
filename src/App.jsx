import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import Home from './pages/Home';
import ProductsPage from './pages/ProductsPage';
import Gifting from './pages/Gifting';
import Blogs from './pages/Blogs';
import BlogDetail from './pages/BlogDetail';
import About from './pages/About';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';
import AdminLogin from './pages/admin/AdminLogin';
import AdminForgotPassword from './pages/admin/AdminForgotPassword';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Products from './pages/admin/Products';


import TestCosmetics from './pages/admin/TestCosmetics';
import AdminBlogs from './pages/admin/Blogs';
import Newsletter from './pages/admin/Newsletter';
import Settings from './pages/admin/Settings';
import AIBlogAssistant from './pages/admin/AIBlogAssistant';
import SEOKeywords from './pages/admin/SEOKeywords';
import EnhancedB2B from './pages/admin/EnhancedB2B';
import OrdersReturns from './pages/admin/OrdersReturns';
import AdManagement from './pages/admin/AdManagement';
import { initializeStorage } from './utils/storage';

function MainLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}

// Protected Route Component for Admin
function ProtectedAdminRoute({ children }) {
  const isAuthenticated = localStorage.getItem('adminLoggedIn') === 'true';

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

function App() {
  useEffect(() => {
    // Initialize storage with sample data on first load
    initializeStorage();
  }, []);

  return (
    <Router>
      <Routes>
        {/* Admin Login Route (Not Protected) */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />

        {/* Protected Admin Routes with AdminLayout (no Navigation/Footer) */}
        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute>
              <AdminLayout />
            </ProtectedAdminRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          

          <Route path="blogs" element={<AdminBlogs />} />
          <Route path="ai-blog-assistant" element={<AIBlogAssistant />} />
          <Route path="seo-keywords" element={<SEOKeywords />} />
          <Route path="b2b-inquiries" element={<EnhancedB2B />} />
          <Route path="orders-returns" element={<OrdersReturns />} />
          <Route path="ad-management" element={<AdManagement />} />
          <Route path="newsletter" element={<Newsletter />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Main Site Routes with Navigation and Footer */}
        <Route path="/" element={<MainLayout><Home /></MainLayout>} />
        <Route path="/products/:category" element={<MainLayout><ProductsPage /></MainLayout>} />
        <Route path="/gifting" element={<MainLayout><Gifting /></MainLayout>} />
        <Route path="/about" element={<MainLayout><About /></MainLayout>} />
        <Route path="/blogs" element={<MainLayout><Blogs /></MainLayout>} />
        <Route path="/blogs/:id" element={<MainLayout><BlogDetail /></MainLayout>} />
        <Route path="/login" element={<MainLayout><Login /></MainLayout>} />
        <Route path="/signup" element={<MainLayout><Signup /></MainLayout>} />
        <Route path="/profile" element={<MainLayout><Profile /></MainLayout>} />
        <Route path="/forgot-password" element={<MainLayout><ForgotPassword /></MainLayout>} />
      </Routes>
    </Router>
  );
}

export default App;
import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from './pages/admin/AdminLogin';
import AdminForgotPassword from './pages/admin/AdminForgotPassword';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Products from './pages/admin/Products';
import AdminBlogs from './pages/admin/Blogs';
import Newsletter from './pages/admin/Newsletter';
import Settings from './pages/admin/Settings';
import AIBlogAssistant from './pages/admin/AIBlogAssistant';
import SEOKeywords from './pages/admin/SEOKeywords';
import EnhancedB2B from './pages/admin/EnhancedB2B';
import OrdersReturns from './pages/admin/OrdersReturns';
import AdManagement from './pages/admin/AdManagement';
import { initializeStorage } from './utils/storage';

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
        {/* Redirect root to admin login */}
        <Route path="/" element={<Navigate to="/admin/login" replace />} />

        {/* Admin Login Route (Not Protected) */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />

        {/* Protected Admin Routes with AdminLayout */}
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

        {/* Catch all - redirect to admin login */}
        <Route path="*" element={<Navigate to="/admin/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Sparkles,
  Palette,
  FileText,
  Mail,
  Settings,
  LogOut,
  Menu,
  X,
  Clock,
  Search,
  BookOpen,
  Briefcase,
  Package,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import logo from '../../assets/images/logo.png';
import {
  logoutUser,
  updateActivity,
  isSessionValid,
  getRemainingTime,
  setupSessionListener,
  checkMultiAccess,
} from '../../utils/sessionManager';
import {
  getCurrentUserPermissions,
  filterMenuByPermissions,
  PERMISSIONS,
} from '../../utils/permissions';
import NotificationCenter from '../../components/NotificationCenter';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [remainingTime, setRemainingTime] = useState(30);
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  const [userPermissions, setUserPermissions] = useState([]);
  const [userRole, setUserRole] = useState('');
  const [filteredMenu, setFilteredMenu] = useState([]);
  const [pendingPasswordRequests, setPendingPasswordRequests] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const sessionCheckInterval = useRef(null);
  const activityTimeout = useRef(null);

  const allMenuItems = [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      path: '/admin',
      requiredPermission: PERMISSIONS.VIEW_ANALYTICS
    },
    {
      icon: Package,
      label: 'Products',
      path: '/admin/products',
      requiredPermission: PERMISSIONS.VIEW_PRODUCTS
    },
    {
      icon: FileText,
      label: 'Blogs',
      path: '/admin/blogs',
      requiredPermission: PERMISSIONS.VIEW_BLOGS
    },
    {
      icon: BookOpen,
      label: 'AI Blog Assistant',
      path: '/admin/ai-blog-assistant',
      requiredPermission: PERMISSIONS.CREATE_BLOGS
    },
    {
      icon: Search,
      label: 'SEO Keywords',
      path: '/admin/seo-keywords',
      requiredPermission: PERMISSIONS.VIEW_ANALYTICS
    },
    {
      icon: Briefcase,
      label: 'B2B Inquiries',
      path: '/admin/b2b-inquiries',
      requiredPermission: PERMISSIONS.VIEW_ANALYTICS
    },
    {
      icon: Package,
      label: 'Orders & Returns',
      path: '/admin/orders-returns',
      requiredPermission: PERMISSIONS.VIEW_ANALYTICS
    },
    {
      icon: TrendingUp,
      label: 'Ad Management',
      path: '/admin/ad-management',
      requiredPermission: PERMISSIONS.VIEW_ANALYTICS
    },
    {
      icon: Mail,
      label: 'Newsletter',
      path: '/admin/newsletter',
      requiredPermission: PERMISSIONS.VIEW_SUBSCRIBERS
    },
    {
      icon: Settings,
      label: 'Settings',
      path: '/admin/settings',
      requiredPermission: [PERMISSIONS.VIEW_SETTINGS, PERMISSIONS.VIEW_USERS]
    },
  ];

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = (message = null) => {
    logoutUser();
    if (message) {
      navigate('/admin/login', { state: { message } });
    } else {
      navigate('/admin/login');
    }
  };

  const handleActivity = async () => {
    await updateActivity();
    setShowTimeoutWarning(false);
    setRemainingTime(30);
  };

  // Load user permissions on mount
  useEffect(() => {
    const loadPermissions = async () => {
      const { role, permissions } = await getCurrentUserPermissions();
      setUserRole(role || 'Unknown');
      setUserPermissions(permissions || []);

      // Filter menu based on permissions
      const filtered = filterMenuByPermissions(allMenuItems, permissions || []);
      setFilteredMenu(filtered);
    };

    loadPermissions();
  }, []);

  // Check for pending password reset requests
  useEffect(() => {
    const checkPasswordRequests = () => {
      const requests = JSON.parse(localStorage.getItem('passwordResetRequests') || '[]');
      const pending = requests.filter(r => r.status === 'pending').length;
      setPendingPasswordRequests(pending);
    };

    // Check initially
    checkPasswordRequests();

    // Check every 30 seconds
    const interval = setInterval(checkPasswordRequests, 30000);

    // Listen for storage changes (for updates from other tabs)
    const handleStorageChange = (e) => {
      if (e.key === 'passwordResetRequests') {
        checkPasswordRequests();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Check session validity and update remaining time
  useEffect(() => {
    const checkSession = () => {
      if (!isSessionValid()) {
        handleLogout('Your session has expired due to inactivity.');
        return;
      }

      const timeLeft = getRemainingTime();
      setRemainingTime(timeLeft);

      // Show warning when less than 5 minutes remaining
      if (timeLeft <= 5 && timeLeft > 0) {
        setShowTimeoutWarning(true);
      }
    };

    // Check immediately
    checkSession();

    // Check every 30 seconds
    sessionCheckInterval.current = setInterval(checkSession, 30000);

    return () => {
      if (sessionCheckInterval.current) {
        clearInterval(sessionCheckInterval.current);
      }
    };
  }, []);

  // Listen for multi-access (another tab logging in)
  useEffect(() => {
    const cleanup = setupSessionListener((message) => {
      handleLogout(message);
    });

    return cleanup;
  }, []);

  // Track user activity
  useEffect(() => {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

    const throttledActivity = () => {
      if (activityTimeout.current) {
        clearTimeout(activityTimeout.current);
      }

      activityTimeout.current = setTimeout(() => {
        handleActivity();
      }, 1000); // Throttle to once per second
    };

    events.forEach((event) => {
      window.addEventListener(event, throttledActivity);
    });

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, throttledActivity);
      });
      if (activityTimeout.current) {
        clearTimeout(activityTimeout.current);
      }
    };
  }, []);

  const adminEmail = localStorage.getItem('adminEmail') || 'admin@example.com';
  const adminInitial = adminEmail.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      {/* Sidebar */}
      <aside className={`hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 bg-burgundy-900 text-white z-50 transition-all duration-300 ${
        sidebarCollapsed ? 'lg:w-20' : 'lg:w-64'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo with Collapse Button */}
          <div className="p-6 border-b border-burgundy-800">
            <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
              <div className={`flex items-center ${sidebarCollapsed ? '' : 'space-x-3'}`}>
                <img src={logo} alt="Revieree" className="h-12 w-12 rounded-full object-cover flex-shrink-0" />
                {!sidebarCollapsed && (
                  <div>
                    <h1 className="text-xl font-serif font-bold">Revieree</h1>
                    <p className="text-xs text-burgundy-300">Admin Panel</p>
                  </div>
                )}
              </div>

              {/* Minimize Toggle Button */}
              {!sidebarCollapsed && (
                <button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="p-2 text-burgundy-300 hover:text-white transition-colors"
                  title="Collapse sidebar"
                >
                  <ChevronLeft size={20} />
                </button>
              )}
            </div>

            {/* Expand button when collapsed */}
            {sidebarCollapsed && (
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="mt-3 p-2 text-burgundy-300 hover:text-white transition-colors w-full flex justify-center"
                title="Expand sidebar"
              >
                <ChevronRight size={20} />
              </button>
            )}
          </div>

          {/* Navigation with Scrollbar */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-thin">
            {filteredMenu.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'} px-4 py-3 rounded-lg transition-colors relative ${
                  isActive(item.path)
                    ? 'bg-burgundy-800 text-white'
                    : 'text-burgundy-200 hover:bg-burgundy-800 hover:text-white'
                }`}
                title={sidebarCollapsed ? item.label : ''}
              >
                <item.icon size={20} className="flex-shrink-0" />
                {!sidebarCollapsed && (
                  <>
                    <span className="font-medium">{item.label}</span>
                    {item.label === 'Settings' && pendingPasswordRequests > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {pendingPasswordRequests}
                      </span>
                    )}
                  </>
                )}
                {sidebarCollapsed && item.label === 'Settings' && pendingPasswordRequests > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {pendingPasswordRequests}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-burgundy-800">
            <button
              onClick={() => handleLogout()}
              className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'} px-4 py-3 rounded-lg text-burgundy-200 hover:bg-burgundy-800 hover:text-white transition-colors`}
              title={sidebarCollapsed ? 'Logout' : ''}
            >
              <LogOut size={20} className="flex-shrink-0" />
              {!sidebarCollapsed && <span className="font-medium">Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
        sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
      }`}>
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <div className="flex items-center space-x-4 ml-auto">
              {/* Notification Bell */}
              <NotificationCenter />

              {/* Session Timer */}
              <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg ${
                remainingTime <= 5 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
              }`}>
                <Clock size={16} />
                <span className="text-xs font-medium">
                  {remainingTime} min{remainingTime !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{adminEmail}</p>
                <p className="text-xs text-gray-500">{userRole}</p>
              </div>
              <div className="w-10 h-10 bg-burgundy-100 rounded-full flex items-center justify-center">
                <span className="text-burgundy-700 font-semibold">{adminInitial}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>

      {/* Session Timeout Warning Modal */}
      <AnimatePresence>
        {showTimeoutWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
                  <Clock className="text-amber-600" size={32} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Session Expiring Soon</h2>
                <p className="text-gray-600 mb-6">
                  Your session will expire in <span className="font-bold text-red-600">{remainingTime} minute{remainingTime !== 1 ? 's' : ''}</span> due to inactivity.
                  Move your mouse or click anywhere to stay logged in.
                </p>
                <button
                  onClick={handleActivity}
                  className="w-full bg-burgundy-700 text-white py-3 rounded-lg font-medium hover:bg-burgundy-800 transition-colors"
                >
                  Stay Logged In
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminLayout;
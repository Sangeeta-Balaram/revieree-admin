import { useState, useEffect, useRef, useCallback } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Package, ShoppingCart, Briefcase, AlertCircle, Check, RotateCcw, Key } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
  NOTIFICATION_TYPES,
  getNotificationColor,
} from '../utils/notifications';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const NotificationCenter = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const dropdownRef = useRef(null);
  const realtimeSubscription = useRef(null);

  // Load notifications with better state management
  const loadNotifications = useCallback(async () => {
    try {
      const allNotifications = await getNotifications();
      const count = await getUnreadCount();
      
      // Only update state if notifications have actually changed or force refresh
      setNotifications(allNotifications);
      setUnreadCount(count);
      setLastSync(new Date());
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  }, []);

  // Setup real-time subscription for Supabase
  const setupRealtimeSubscription = useCallback(() => {
    if (!isSupabaseConfigured()) return;

    const channel = supabase
      .channel('notifications_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications'
        },
        (payload) => {
          console.log('Notification change received:', payload);
          // Refresh notifications when any change occurs
          loadNotifications(true);
        }
      )
      .subscribe();

    realtimeSubscription.current = channel;

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [loadNotifications]);

  useEffect(() => {
    // Setup real-time subscription
    const cleanup = setupRealtimeSubscription();

    // Fallback polling only if real-time is not available
    if (!isSupabaseConfigured()) {
      const interval = setInterval(() => loadNotifications(), 30000);
      return () => {
        clearInterval(interval);
        cleanup?.();
      };
    }

    return cleanup;
  }, [loadNotifications, setupRealtimeSubscription]);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  

  const handleMarkAsRead = async (notificationId) => {
    // Optimistic update
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));

    try {
      await markAsRead(notificationId);
      // Real-time subscription will handle the final sync
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Revert on error
      await loadNotifications(true);
    }
  };

  const handleMarkAllAsRead = async () => {
    // Optimistic update
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);

    try {
      await markAllAsRead();
      // Real-time subscription will handle the final sync
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      // Revert on error
      await loadNotifications(true);
    }
  };

  const handleDelete = async (notificationId) => {
    // Optimistic update
    const deletedNotification = notifications.find(n => n.id === notificationId);
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    if (deletedNotification && !deletedNotification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }

    try {
      await deleteNotification(notificationId);
      // Real-time subscription will handle the final sync
    } catch (error) {
      console.error('Error deleting notification:', error);
      // Revert on error
      await loadNotifications(true);
    }
  };

  const handleClearAll = async () => {
    // Optimistic update
    setNotifications([]);
    setUnreadCount(0);

    try {
      await clearAllNotifications();
      // Real-time subscription will handle the final sync
    } catch (error) {
      console.error('Error clearing all notifications:', error);
      // Revert on error
      await loadNotifications(true);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case NOTIFICATION_TYPES.CRITICAL_STOCK:
      case NOTIFICATION_TYPES.LOW_STOCK:
        return <Package size={18} />;
      case NOTIFICATION_TYPES.NEW_ORDER:
        return <ShoppingCart size={18} />;
      case NOTIFICATION_TYPES.ORDER_RETURN:
        return <RotateCcw size={18} />;
      case NOTIFICATION_TYPES.PASSWORD_RESET:
        return <Key size={18} />;
      case NOTIFICATION_TYPES.NEW_B2B_INQUIRY:
        return <Briefcase size={18} />;
      default:
        return <AlertCircle size={18} />;
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-GB');
  };

  const handleNotificationClick = async (notification) => {
    // Mark as read
    if (!notification.read) {
      await handleMarkAsRead(notification.id);
    }

    // Navigate to relevant section based on notification type
    switch (notification.type) {
      case NOTIFICATION_TYPES.LOW_STOCK:
      case NOTIFICATION_TYPES.CRITICAL_STOCK:
        navigate('/admin/products');
        break;
      case NOTIFICATION_TYPES.NEW_ORDER:
        navigate('/admin/orders-returns');
        break;
      case NOTIFICATION_TYPES.ORDER_RETURN:
        navigate('/admin/orders-returns');
        break;
      case NOTIFICATION_TYPES.PASSWORD_RESET:
        navigate('/admin/settings', { state: { activeTab: 'password-requests' } });
        break;
      case NOTIFICATION_TYPES.NEW_B2B_INQUIRY:
        navigate('/admin/b2b-inquiries');
        break;
      default:
        // Default to dashboard for system notifications
        navigate('/admin');
        break;
    }

    // Close dropdown
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell size={22} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#8B0000] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
                <p className="text-sm text-gray-500">{unreadCount} unread</p>
              </div>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-sm text-[#8B0000] hover:text-[#DC143C] font-medium"
                  >
                    Mark all read
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="text-sm text-gray-500 hover:text-red-600 font-medium"
                  >
                    Clear all
                  </button>
                )}
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell size={48} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500">No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                        !notification.read ? 'bg-blue-50/50' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg flex-shrink-0 ${getNotificationColor(notification.type)}`}>
                          {getNotificationIcon(notification.type)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="text-sm font-semibold text-gray-900">
                                {notification.title}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-2">
                                {formatTime(notification.createdAt)}
                              </p>
                            </div>

                            <div className="flex items-center space-x-1 ml-2 flex-shrink-0">
                              {!notification.read && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMarkAsRead(notification.id);
                                  }}
                                  className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                                  title="Mark as read"
                                >
                                  <Check size={16} />
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(notification.id);
                                }}
                                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Delete"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationCenter;
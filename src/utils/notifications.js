// Notification Management System with Supabase Integration
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const NOTIFICATION_TYPES = {
  LOW_STOCK: 'LOW_STOCK',
  CRITICAL_STOCK: 'CRITICAL_STOCK',
  NEW_ORDER: 'NEW_ORDER',
  ORDER_RETURN: 'ORDER_RETURN',
  PASSWORD_RESET: 'PASSWORD_RESET',
  NEW_B2B_INQUIRY: 'NEW_B2B_INQUIRY',
  SYSTEM: 'SYSTEM',
};

// Get all notifications
export const getNotifications = async () => {
  if (!isSupabaseConfigured()) {
    // Fallback to localStorage
    const notifications = localStorage.getItem('admin_notifications');
    return notifications ? JSON.parse(notifications) : [];
  }

  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Get notifications error:', error);
      return [];
    }

    // Transform to match localStorage format
    return data.map(n => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      data: n.data || {},
      read: n.read,
      createdAt: n.created_at,
    }));
  } catch (error) {
    console.error('Get notifications error:', error);
    return [];
  }
};

// Add a new notification
export const addNotification = async (type, title, message, data = {}) => {
  console.log('Adding notification:', { type, title, message, data });
  console.log('Supabase configured:', isSupabaseConfigured());

  const newNotification = {
    type,
    title,
    message,
    data,
    read: false,
    created_at: new Date().toISOString(),
  };

  if (!isSupabaseConfigured()) {
    console.log('Using localStorage fallback for notifications');
    // Fallback to localStorage
    const notifications = await getNotifications();
    const localNotification = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      ...newNotification,
      createdAt: newNotification.created_at,
    };
    notifications.unshift(localNotification);

    // Keep only last 100 notifications
    if (notifications.length > 100) {
      notifications.pop();
    }

    localStorage.setItem('admin_notifications', JSON.stringify(notifications));
    console.log('Notification saved to localStorage:', localNotification);
    return localNotification;
  }

  try {
    console.log('Inserting notification into Supabase:', newNotification);
    const { data: inserted, error } = await supabase
      .from('notifications')
      .insert([newNotification])
      .select()
      .single();

    if (error) {
      console.error('Add notification error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return null;
    }

    console.log('Notification successfully inserted into Supabase:', inserted);
    return {
      id: inserted.id,
      type: inserted.type,
      title: inserted.title,
      message: inserted.message,
      data: inserted.data || {},
      read: inserted.read,
      createdAt: inserted.created_at,
    };
  } catch (error) {
    console.error('Add notification exception:', error);
    return null;
  }
};

// Mark notification as read
export const markAsRead = async (notificationId) => {
  if (!isSupabaseConfigured()) {
    // Fallback to localStorage
    const notifications = await getNotifications();
    const updated = notifications.map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    );
    localStorage.setItem('admin_notifications', JSON.stringify(updated));
    return updated;
  }

  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) {
      console.error('Mark as read error:', error);
    }

    return await getNotifications();
  } catch (error) {
    console.error('Mark as read error:', error);
    return await getNotifications();
  }
};

// Mark all as read
export const markAllAsRead = async () => {
  if (!isSupabaseConfigured()) {
    // Fallback to localStorage
    const notifications = await getNotifications();
    const updated = notifications.map(n => ({ ...n, read: true }));
    localStorage.setItem('admin_notifications', JSON.stringify(updated));
    return updated;
  }

  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('read', false);

    if (error) {
      console.error('Mark all as read error:', error);
    }

    return await getNotifications();
  } catch (error) {
    console.error('Mark all as read error:', error);
    return await getNotifications();
  }
};

// Delete notification
export const deleteNotification = async (notificationId) => {
  if (!isSupabaseConfigured()) {
    // Fallback to localStorage
    const notifications = await getNotifications();
    const filtered = notifications.filter(n => n.id !== notificationId);
    localStorage.setItem('admin_notifications', JSON.stringify(filtered));
    return filtered;
  }

  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) {
      console.error('Delete notification error:', error);
    }

    return await getNotifications();
  } catch (error) {
    console.error('Delete notification error:', error);
    return await getNotifications();
  }
};

// Get unread count
export const getUnreadCount = async () => {
  if (!isSupabaseConfigured()) {
    // Fallback to localStorage
    const notifications = await getNotifications();
    return notifications.filter(n => !n.read).length;
  }

  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('read', false);

    if (error) {
      console.error('Get unread count error:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Get unread count error:', error);
    return 0;
  }
};

// Clear all notifications
export const clearAllNotifications = async () => {
  if (!isSupabaseConfigured()) {
    // Fallback to localStorage
    localStorage.setItem('admin_notifications', JSON.stringify([]));
    return [];
  }

  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (error) {
      console.error('Clear all notifications error:', error);
      throw error;
    }

    return []; // Return empty array after successful clear
  } catch (error) {
    console.error('Clear all notifications error:', error);
    throw error;
  }
};

// Check stock levels and create notifications
export const checkStockLevels = async (products) => {
  const existingNotifications = await getNotifications();

  for (const product of products) {
    const stock = product.stock || 0;
    
    // Set different thresholds for perfumes and kajal
    let lowStockThreshold, criticalStockThreshold;
    
    if (product.category === 'fragrance' || 
        (product.category === 'cosmetic' && product.subcategory === 'kajal')) {
      // For perfumes and kajal: alert when less than 5
      lowStockThreshold = 4;
      criticalStockThreshold = 2;
    } else {
      // For other products: use default thresholds
      lowStockThreshold = 10;
      criticalStockThreshold = 5;
    }

    // Check if notification already exists for this product
    const hasLowStockNotification = existingNotifications.some(
      n => n.type === NOTIFICATION_TYPES.LOW_STOCK && n.data.productId === product.id && !n.read
    );
    const hasCriticalStockNotification = existingNotifications.some(
      n => n.type === NOTIFICATION_TYPES.CRITICAL_STOCK && n.data.productId === product.id && !n.read
    );

    if (stock <= criticalStockThreshold && !hasCriticalStockNotification) {
      await addNotification(
        NOTIFICATION_TYPES.CRITICAL_STOCK,
        'Critical Stock Alert',
        `${product.name} has only ${stock} units left!`,
        { productId: product.id, productName: product.name, stock }
      );
    } else if (stock <= lowStockThreshold && stock > criticalStockThreshold && !hasLowStockNotification) {
      await addNotification(
        NOTIFICATION_TYPES.LOW_STOCK,
        'Low Stock Warning',
        `${product.name} is running low (${stock} units remaining)`,
        { productId: product.id, productName: product.name, stock }
      );
    }
  }
};

// Add new order notification
export const notifyNewOrder = async (orderId, customerName, amount) => {
  await addNotification(
    NOTIFICATION_TYPES.NEW_ORDER,
    'New Order Received',
    `Order #${orderId} from ${customerName} - ₹${amount}`,
    { orderId, customerName, amount }
  );
};

// Add new B2B inquiry notification
export const notifyNewB2BInquiry = async (companyName, contactPerson) => {
  await addNotification(
    NOTIFICATION_TYPES.NEW_B2B_INQUIRY,
    'New B2B Inquiry',
    `${companyName} (${contactPerson}) has submitted a wholesale inquiry`,
    { companyName, contactPerson }
  );
};

// Add order return notification
export const notifyOrderReturn = async (orderId, customerName, reason) => {
  await addNotification(
    NOTIFICATION_TYPES.ORDER_RETURN,
    'Return Request',
    `Order #${orderId} from ${customerName} - Return reason: ${reason}`,
    { orderId, customerName, reason }
  );
};

// Add password reset notification
export const notifyPasswordReset = async (email, requestedBy) => {
  console.log('Creating password reset notification for:', email, 'requested by:', requestedBy);
  const result = await addNotification(
    NOTIFICATION_TYPES.PASSWORD_RESET,
    'Password Reset Request',
    `Password reset requested for ${email} by ${requestedBy}`,
    { email, requestedBy }
  );
  console.log('Password reset notification created:', result);
  return result;
};

// Get notification icon color
export const getNotificationColor = (type) => {
  switch (type) {
    case NOTIFICATION_TYPES.CRITICAL_STOCK:
      return 'text-red-600 bg-red-100';
    case NOTIFICATION_TYPES.LOW_STOCK:
      return 'text-yellow-600 bg-yellow-100';
    case NOTIFICATION_TYPES.NEW_ORDER:
      return 'text-green-600 bg-green-100';
    case NOTIFICATION_TYPES.ORDER_RETURN:
      return 'text-orange-600 bg-orange-100';
    case NOTIFICATION_TYPES.PASSWORD_RESET:
      return 'text-purple-600 bg-purple-100';
    case NOTIFICATION_TYPES.NEW_B2B_INQUIRY:
      return 'text-blue-600 bg-blue-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};
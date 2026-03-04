// Supabase Orders & Returns Management for Admin Panel
import { supabase } from '../lib/supabase';

// Order Status
export const ORDER_STATUS = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  RETURNED: 'Returned',
};

// Return Status
export const RETURN_STATUS = {
  REQUESTED: 'Return Requested',
  APPROVED: 'Return Approved',
  PICKED_UP: 'Picked Up',
  IN_TRANSIT: 'In Transit to Warehouse',
  RECEIVED: 'Received at Warehouse',
  INSPECTED: 'Quality Inspected',
  APPROVED_REFUND: 'Refund Approved',
  REFUNDED: 'Refunded',
  REJECTED: 'Return Rejected',
};

// Payment Status
export const PAYMENT_STATUS = {
  PAID: 'Paid',
  UNPAID: 'Unpaid',
  FAILED: 'Failed',
  REFUNDED: 'Refunded',
  PARTIALLY_REFUNDED: 'Partially Refunded',
};

// Payment Methods
export const PAYMENT_METHODS = {
  COD: 'Cash on Delivery',
  ONLINE: 'Online Payment',
  UPI: 'UPI',
  CARD: 'Credit/Debit Card',
  NET_BANKING: 'Net Banking',
  WALLET: 'Wallet',
};

// Return Reasons
export const RETURN_REASONS = {
  DAMAGED: 'Damaged Product',
  WRONG_ITEM: 'Wrong Item Received',
  NOT_AS_DESCRIBED: 'Not as Described',
  SIZE_ISSUE: 'Size/Fit Issue',
  QUALITY_ISSUE: 'Quality Issue',
  CHANGED_MIND: 'Changed Mind',
  DEFECTIVE: 'Defective Product',
  EXPIRED: 'Product Expired',
  OTHER: 'Other',
};

/**
 * Check if Supabase is configured
 */
export const isSupabaseConfigured = () => {
  return supabase !== null;
};

// ==================== ORDERS ====================

/**
 * Get all orders
 */
export const getOrders = async () => {
  try {
    if (!supabase) {
      console.error('Supabase not configured');
      return [];
    }

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
};

/**
 * Get order by ID
 */
export const getOrderById = async (orderId) => {
  try {
    if (!supabase) throw new Error('Supabase not configured');

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting order:', error);
    return null;
  }
};

/**
 * Get orders by status
 */
export const getOrdersByStatus = async (status) => {
  try {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting orders by status:', error);
    return [];
  }
};

/**
 * Update order
 */
export const updateOrder = async (orderId, updates) => {
  try {
    if (!supabase) {
      console.error('Supabase not configured');
      throw new Error('Supabase not configured');
    }

    console.log('Updating order:', orderId, 'with:', updates);

    // Get current order
    const { data: currentOrder, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (fetchError) {
      console.error('Error fetching order:', fetchError);
      throw fetchError;
    }

    if (!currentOrder) {
      console.error('Order not found:', orderId);
      throw new Error('Order not found');
    }

    console.log('Current order:', currentOrder);

    const updatedData = { ...updates };

    // If status changed, add to history
    if (updates.status && updates.status !== currentOrder.status) {
      const statusHistory = currentOrder.status_history || [];
      statusHistory.push({
        status: updates.status,
        timestamp: new Date().toISOString(),
        note: updates.statusNote || `Status updated to ${updates.status}`,
      });
      updatedData.status_history = statusHistory;

      // If delivered, record actual delivery date
      if (updates.status === ORDER_STATUS.DELIVERED) {
        updatedData.actual_delivery = new Date().toISOString();
      }
    }

    console.log('Updating with data:', updatedData);

    const { data, error } = await supabase
      .from('orders')
      .update(updatedData)
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      console.error('Supabase update error:', error);
      throw error;
    }

    console.log('Order updated successfully:', data);
    return data;
  } catch (error) {
    console.error('Error updating order:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    return null;
  }
};

/**
 * Get order analytics
 */
export const getOrderAnalytics = async () => {
  try {
    const orders = await getOrders();

    const analytics = {
      total: orders.length,
      byStatus: {},
      totalRevenue: 0,
      deliveryRate: 0,
      returnRate: 0,
    };

    // Count by status
    Object.values(ORDER_STATUS).forEach((status) => {
      analytics.byStatus[status] = orders.filter((o) => o.status === status).length;
    });

    // Calculate revenue
    analytics.totalRevenue = orders
      .filter((o) => o.status === ORDER_STATUS.DELIVERED)
      .reduce((sum, o) => sum + (parseFloat(o.total_amount) || 0), 0);

    // Calculate rates
    const deliveredOrders = orders.filter((o) => o.status === ORDER_STATUS.DELIVERED).length;
    const totalNonPending = orders.filter((o) => o.status !== ORDER_STATUS.PENDING).length;
    analytics.deliveryRate = totalNonPending > 0 ? Math.round((deliveredOrders / totalNonPending) * 100) : 0;

    const returnedOrders = orders.filter((o) => o.status === ORDER_STATUS.RETURNED).length;
    analytics.returnRate = orders.length > 0 ? Math.round((returnedOrders / orders.length) * 100) : 0;

    return analytics;
  } catch (error) {
    console.error('Error getting analytics:', error);
    return { total: 0, byStatus: {}, totalRevenue: 0, deliveryRate: 0, returnRate: 0 };
  }
};

/**
 * Get orders needing attention
 */
export const getOrdersNeedingAttention = async () => {
  try {
    const orders = await getOrders();
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

    return orders.filter((order) => {
      // Pending orders older than 2 days
      if (order.status === ORDER_STATUS.PENDING && new Date(order.created_at) < twoDaysAgo) {
        return true;
      }
      // Shipped orders past estimated delivery
      if (
        order.status === ORDER_STATUS.SHIPPED &&
        order.estimated_delivery &&
        new Date(order.estimated_delivery) < new Date()
      ) {
        return true;
      }
      return false;
    });
  } catch (error) {
    console.error('Error getting orders needing attention:', error);
    return [];
  }
};

/**
 * Export orders to CSV
 */
export const exportOrdersToCSV = (orders) => {
  const headers = [
    'Order Number',
    'Customer Name',
    'Customer Email',
    'Status',
    'Total Amount',
    'Items',
    'Tracking Number',
    'Shipping Partner',
    'Order Date',
    'Delivery Date',
  ];

  const rows = orders.map((order) => [
    order.order_number,
    order.customer_name,
    order.customer_email,
    order.status,
    order.total_amount || 0,
    order.items?.length || 0,
    order.tracking_number || '',
    order.shipping_partner || '',
    new Date(order.created_at).toLocaleDateString('en-GB'),
    order.actual_delivery ? new Date(order.actual_delivery).toLocaleDateString('en-GB') : '',
  ]);

  return [headers, ...rows];
};

// ==================== RETURNS ====================

/**
 * Get all returns
 */
export const getReturns = async () => {
  try {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('returns')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching returns:', error);
    return [];
  }
};

/**
 * Create return
 */
export const createReturn = async (returnData) => {
  try {
    if (!supabase) throw new Error('Supabase not configured');

    const newReturn = {
      return_number: `RET-${Date.now().toString().slice(-8)}`,
      order_id: returnData.orderId,
      order_number: returnData.orderNumber,
      customer_name: returnData.customerName,
      customer_email: returnData.customerEmail,
      items: returnData.items || [],
      reason: returnData.reason,
      reason_detail: returnData.reasonDetail || '',
      images: returnData.images || [],
      status: RETURN_STATUS.REQUESTED,
      refund_amount: returnData.refundAmount,
      refund_method: returnData.refundMethod,
      pickup_address: returnData.pickupAddress,
      status_history: [{
        status: RETURN_STATUS.REQUESTED,
        timestamp: new Date().toISOString(),
        note: 'Return requested by customer',
      }],
    };

    const { data, error } = await supabase
      .from('returns')
      .insert([newReturn])
      .select()
      .single();

    if (error) throw error;

    // Update order status to returned
    await updateOrder(returnData.orderId, { status: ORDER_STATUS.RETURNED });

    return data;
  } catch (error) {
    console.error('Error creating return:', error);
    return null;
  }
};

/**
 * Update return
 */
export const updateReturn = async (returnId, updates) => {
  try {
    if (!supabase) throw new Error('Supabase not configured');

    // Get current return
    const { data: currentReturn } = await supabase
      .from('returns')
      .select('*')
      .eq('id', returnId)
      .single();

    if (!currentReturn) throw new Error('Return not found');

    const updatedData = { ...updates };

    // Add to status history
    if (updates.status && updates.status !== currentReturn.status) {
      const statusHistory = currentReturn.status_history || [];
      statusHistory.push({
        status: updates.status,
        timestamp: new Date().toISOString(),
        note: updates.statusNote || `Status updated to ${updates.status}`,
      });
      updatedData.status_history = statusHistory;

      // If refunded, record timestamp
      if (updates.status === RETURN_STATUS.REFUNDED) {
        updatedData.refunded_at = new Date().toISOString();
      }
    }

    const { data, error } = await supabase
      .from('returns')
      .update(updatedData)
      .eq('id', returnId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating return:', error);
    return null;
  }
};

/**
 * Get return analytics
 */
export const getReturnAnalytics = async () => {
  try {
    const returns = await getReturns();

    const analytics = {
      total: returns.length,
      byReason: {},
      byStatus: {},
      totalRefunded: 0,
      avgRefundAmount: 0,
    };

    // Count by reason
    Object.values(RETURN_REASONS).forEach((reason) => {
      analytics.byReason[reason] = returns.filter((r) => r.reason === reason).length;
    });

    // Count by status
    Object.values(RETURN_STATUS).forEach((status) => {
      analytics.byStatus[status] = returns.filter((r) => r.status === status).length;
    });

    // Calculate refunds
    const refundedReturns = returns.filter((r) => r.status === RETURN_STATUS.REFUNDED);
    analytics.totalRefunded = refundedReturns.reduce((sum, r) => sum + (parseFloat(r.refund_amount) || 0), 0);
    analytics.avgRefundAmount = refundedReturns.length > 0
      ? Math.round(analytics.totalRefunded / refundedReturns.length)
      : 0;

    return analytics;
  } catch (error) {
    console.error('Error getting return analytics:', error);
    return { total: 0, byReason: {}, byStatus: {}, totalRefunded: 0, avgRefundAmount: 0 };
  }
};

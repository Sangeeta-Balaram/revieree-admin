// Orders and Returns Management with Inventory & Finance Integration
import { notifyOrderReturn, notifyNewOrder } from './notifications';

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

// Get all orders
export const getOrders = () => {
  const orders = localStorage.getItem('orders');
  return orders ? JSON.parse(orders) : [];
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

// Add new order
export const addOrder = (order) => {
  const orders = getOrders();

  // Calculate totals
  const subtotal = order.subtotal || order.totalAmount || 0;
  const discount = order.discount || 0;
  const tax = order.tax || Math.round(subtotal * 0.18); // 18% GST default
  const shippingCharge = order.shippingCharge || 0;
  const totalAmount = subtotal - discount + tax + shippingCharge;

  const newOrder = {
    id: Date.now(),
    orderNumber: `ORD-${Date.now().toString().slice(-8)}`,
    ...order,
    status: order.status || ORDER_STATUS.PENDING,

    // Payment Information
    paymentStatus: order.paymentStatus || (order.paymentMethod === PAYMENT_METHODS.COD ? PAYMENT_STATUS.UNPAID : PAYMENT_STATUS.PAID),
    paymentMethod: order.paymentMethod || PAYMENT_METHODS.COD,
    transactionId: order.transactionId || null,

    // Pricing Details
    subtotal,
    discount,
    discountCode: order.discountCode || null,
    tax,
    taxRate: order.taxRate || 18,
    shippingCharge,
    totalAmount,

    // Shipping Information
    shippingAddress: order.shippingAddress || {},
    billingAddress: order.billingAddress || order.shippingAddress || {},
    trackingNumber: order.trackingNumber || null,
    shippingPartner: order.shippingPartner || '',
    estimatedDelivery: order.estimatedDelivery || null,
    actualDelivery: order.actualDelivery || null,

    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    statusHistory: [
      {
        status: order.status || ORDER_STATUS.PENDING,
        timestamp: new Date().toISOString(),
        note: 'Order placed',
      },
    ],
  };

  orders.unshift(newOrder);
  localStorage.setItem('orders', JSON.stringify(orders));

  // Send notification to admin
  notifyNewOrder(newOrder.orderNumber, order.customerName, totalAmount);

  return newOrder;
};

// Update order
export const updateOrder = (orderId, updates) => {
  const orders = getOrders();
  const updatedOrders = orders.map((order) => {
    if (order.id === orderId) {
      const updatedOrder = { ...order, ...updates, updatedAt: new Date().toISOString() };

      // If status changed, add to history
      if (updates.status && updates.status !== order.status) {
        updatedOrder.statusHistory = [
          ...(order.statusHistory || []),
          {
            status: updates.status,
            timestamp: new Date().toISOString(),
            note: updates.statusNote || `Status updated to ${updates.status}`,
          },
        ];

        // If delivered, record actual delivery date
        if (updates.status === ORDER_STATUS.DELIVERED) {
          updatedOrder.actualDelivery = new Date().toISOString();
        }
      }

      return updatedOrder;
    }
    return order;
  });

  localStorage.setItem('orders', JSON.stringify(updatedOrders));
  return updatedOrders.find((o) => o.id === orderId);
};

// Get order by ID
export const getOrderById = (orderId) => {
  const orders = getOrders();
  return orders.find((order) => order.id === orderId);
};

// Get orders by status
export const getOrdersByStatus = (status) => {
  const orders = getOrders();
  return orders.filter((order) => order.status === status);
};

// ==================== RETURNS MANAGEMENT ====================

// Get all returns
export const getReturns = () => {
  const returns = localStorage.getItem('returns');
  return returns ? JSON.parse(returns) : [];
};

// Create return request
export const createReturn = (returnData) => {
  const returns = getReturns();
  const order = getOrderById(returnData.orderId);

  if (!order) {
    throw new Error('Order not found');
  }

  const newReturn = {
    id: Date.now(),
    returnNumber: `RET-${Date.now().toString().slice(-8)}`,
    orderId: returnData.orderId,
    orderNumber: order.orderNumber,
    customerId: order.customerId,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    items: returnData.items || order.items, // Items being returned
    reason: returnData.reason,
    reasonDetail: returnData.reasonDetail || '',
    images: returnData.images || [],
    status: RETURN_STATUS.REQUESTED,
    refundAmount: returnData.refundAmount || order.totalAmount,
    refundMethod: order.paymentMethod,
    pickupAddress: order.shippingAddress,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    statusHistory: [
      {
        status: RETURN_STATUS.REQUESTED,
        timestamp: new Date().toISOString(),
        note: 'Return requested by customer',
      },
    ],
  };

  returns.unshift(newReturn);
  localStorage.setItem('returns', JSON.stringify(returns));

  // Send notification to admin
  notifyOrderReturn(newReturn.orderNumber, order.customerName, returnData.reason);

  // Update order status to returned
  updateOrder(returnData.orderId, { status: ORDER_STATUS.RETURNED });

  return newReturn;
};

// Update return status
export const updateReturn = (returnId, updates) => {
  const returns = getReturns();
  const updatedReturns = returns.map((returnItem) => {
    if (returnItem.id === returnId) {
      const updatedReturn = { ...returnItem, ...updates, updatedAt: new Date().toISOString() };

      // Add to status history
      if (updates.status && updates.status !== returnItem.status) {
        updatedReturn.statusHistory = [
          ...(returnItem.statusHistory || []),
          {
            status: updates.status,
            timestamp: new Date().toISOString(),
            note: updates.statusNote || `Status updated to ${updates.status}`,
          },
        ];

        // If refunded, update finance
        if (updates.status === RETURN_STATUS.REFUNDED) {
          updatedReturn.refundedAt = new Date().toISOString();
          recordRefund(returnItem.orderId, returnItem.refundAmount);
        }

        // If received at warehouse and approved, update inventory
        if (updates.status === RETURN_STATUS.RECEIVED || updates.status === RETURN_STATUS.APPROVED_REFUND) {
          restockReturnedItems(returnItem.items);
        }
      }

      return updatedReturn;
    }
    return returnItem;
  });

  localStorage.setItem('returns', JSON.stringify(updatedReturns));
  return updatedReturns.find((r) => r.id === returnId);
};

// Get return by ID
export const getReturnById = (returnId) => {
  const returns = getReturns();
  return returns.find((returnItem) => returnItem.id === returnId);
};

// Get returns by order ID
export const getReturnsByOrderId = (orderId) => {
  const returns = getReturns();
  return returns.filter((returnItem) => returnItem.orderId === orderId);
};

// ==================== INVENTORY INTEGRATION ====================

// Restock returned items back to inventory
const restockReturnedItems = (items) => {
  const products = JSON.parse(localStorage.getItem('products') || '[]');

  items.forEach((item) => {
    const productIndex = products.findIndex((p) => p.id === item.productId);
    if (productIndex !== -1) {
      // Add back to stock
      products[productIndex].stock = (products[productIndex].stock || 0) + (item.quantity || 1);

      // Update product
      products[productIndex].updatedAt = new Date().toISOString();
    }
  });

  localStorage.setItem('products', JSON.stringify(products));
};

// ==================== FINANCE TRACKING ====================

// Record refund in finance
const recordRefund = (orderId, amount) => {
  const refunds = JSON.parse(localStorage.getItem('refunds') || '[]');
  refunds.unshift({
    id: Date.now(),
    orderId,
    amount,
    date: new Date().toISOString(),
    reason: 'Product return',
  });
  localStorage.setItem('refunds', JSON.stringify(refunds));
};

// Get all refunds
export const getRefunds = () => {
  const refunds = localStorage.getItem('refunds');
  return refunds ? JSON.parse(refunds) : [];
};

// Get total refunds
export const getTotalRefunds = () => {
  const refunds = getRefunds();
  return refunds.reduce((sum, refund) => sum + (refund.amount || 0), 0);
};

// ==================== ANALYTICS ====================

// Order analytics
export const getOrderAnalytics = () => {
  const orders = getOrders();

  const analytics = {
    total: orders.length,
    byStatus: {},
    totalRevenue: 0,
    deliveryRate: 0,
    returnRate: 0,
    avgDeliveryTime: 0,
  };

  Object.values(ORDER_STATUS).forEach((status) => {
    analytics.byStatus[status] = orders.filter((o) => o.status === status).length;
  });

  analytics.totalRevenue = orders
    .filter((o) => o.status === ORDER_STATUS.DELIVERED)
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const deliveredOrders = orders.filter((o) => o.status === ORDER_STATUS.DELIVERED).length;
  const totalNonPending = orders.filter((o) => o.status !== ORDER_STATUS.PENDING).length;
  analytics.deliveryRate = totalNonPending > 0 ? Math.round((deliveredOrders / totalNonPending) * 100) : 0;

  const returnedOrders = orders.filter((o) => o.status === ORDER_STATUS.RETURNED).length;
  analytics.returnRate = orders.length > 0 ? Math.round((returnedOrders / orders.length) * 100) : 0;

  return analytics;
};

// Return analytics
export const getReturnAnalytics = () => {
  const returns = getReturns();

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

  // Calculate refund totals
  const refundedReturns = returns.filter((r) => r.status === RETURN_STATUS.REFUNDED);
  analytics.totalRefunded = refundedReturns.reduce((sum, r) => sum + (r.refundAmount || 0), 0);
  analytics.avgRefundAmount = refundedReturns.length > 0
    ? Math.round(analytics.totalRefunded / refundedReturns.length)
    : 0;

  return analytics;
};

// Get orders needing attention (pending shipment, delivery issues, etc.)
export const getOrdersNeedingAttention = () => {
  const orders = getOrders();
  const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

  return orders.filter((order) => {
    // Pending orders older than 2 days
    if (order.status === ORDER_STATUS.PENDING && new Date(order.createdAt) < twoDaysAgo) {
      return true;
    }
    // Shipped orders past estimated delivery
    if (
      order.status === ORDER_STATUS.SHIPPED &&
      order.estimatedDelivery &&
      new Date(order.estimatedDelivery) < new Date()
    ) {
      return true;
    }
    return false;
  });
};

// Export orders to CSV
export const exportOrdersToCSV = (orders = null) => {
  const ordersToExport = orders || getOrders();

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

  const rows = ordersToExport.map((order) => [
    order.orderNumber,
    order.customerName,
    order.customerEmail,
    order.status,
    order.totalAmount || 0,
    order.items?.length || 0,
    order.trackingNumber || '',
    order.shippingPartner || '',
    new Date(order.createdAt).toLocaleDateString('en-GB'),
    order.actualDelivery ? new Date(order.actualDelivery).toLocaleDateString('en-GB') : '',
  ]);

  return [headers, ...rows];
};
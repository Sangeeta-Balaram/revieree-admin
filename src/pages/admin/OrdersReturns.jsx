import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Package, TruckIcon, CheckCircle, XCircle, RotateCcw, DollarSign, AlertTriangle,
  Search, Filter, Download, Eye, Edit2, MapPin, Phone, Mail, Calendar, Clock
} from 'lucide-react';
import {
  getOrders, getReturns, updateOrder, updateReturn, ORDER_STATUS, RETURN_STATUS,
  getOrderAnalytics, getReturnAnalytics, exportOrdersToCSV, getOrdersNeedingAttention,
  PAYMENT_STATUS, PAYMENT_METHODS
} from '../../utils/supabaseOrders';

const OrdersReturns = () => {
  const [activeTab, setActiveTab] = useState('orders'); // orders, returns, analytics
  const [orders, setOrders] = useState([]);
  const [returns, setReturns] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [filteredReturns, setFilteredReturns] = useState([]);
  const [orderAnalytics, setOrderAnalytics] = useState(null);
  const [returnAnalytics, setReturnAnalytics] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Filter orders
    let filtered = orders;
    if (statusFilter !== 'all') {
      filtered = filtered.filter(o => o.status === statusFilter);
    }
    if (paymentStatusFilter !== 'all') {
      filtered = filtered.filter(o => o.paymentStatus === paymentStatusFilter);
    }
    if (searchTerm) {
      filtered = filtered.filter(o =>
        o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter, paymentStatusFilter]);

  useEffect(() => {
    // Filter returns
    let filtered = returns;
    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter);
    }
    if (searchTerm) {
      filtered = filtered.filter(r =>
        r.returnNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.customerName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredReturns(filtered);
  }, [returns, searchTerm, statusFilter]);

  const loadData = async () => {
    const [ordersData, returnsData, orderAnalyticsData, returnAnalyticsData] = await Promise.all([
      getOrders(),
      getReturns(),
      getOrderAnalytics(),
      getReturnAnalytics()
    ]);
    setOrders(ordersData);
    setReturns(returnsData);
    setOrderAnalytics(orderAnalyticsData);
    setReturnAnalytics(returnAnalyticsData);
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    await updateOrder(orderId, { status: newStatus });
    await loadData();
    console.log('Order status updated to:', newStatus);
  };

  const handleUpdateReturnStatus = async (returnId, newStatus) => {
    await updateReturn(returnId, { status: newStatus });
    await loadData();
    console.log('Return status updated to:', newStatus);
  };

  const handleExportOrders = () => {
    const csvData = exportOrdersToCSV(filteredOrders);
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getStatusColor = (status) => {
    const colors = {
      [ORDER_STATUS.PENDING]: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      [ORDER_STATUS.CONFIRMED]: 'bg-blue-100 text-blue-700 border-blue-300',
      [ORDER_STATUS.PROCESSING]: 'bg-indigo-100 text-indigo-700 border-indigo-300',
      [ORDER_STATUS.SHIPPED]: 'bg-purple-100 text-purple-700 border-purple-300',
      [ORDER_STATUS.OUT_FOR_DELIVERY]: 'bg-orange-100 text-orange-700 border-orange-300',
      [ORDER_STATUS.DELIVERED]: 'bg-green-100 text-green-700 border-green-300',
      [ORDER_STATUS.CANCELLED]: 'bg-red-100 text-red-700 border-red-300',
      [ORDER_STATUS.RETURNED]: 'bg-gray-100 text-gray-700 border-gray-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getReturnStatusColor = (status) => {
    const colors = {
      [RETURN_STATUS.REQUESTED]: 'bg-yellow-100 text-yellow-700',
      [RETURN_STATUS.APPROVED]: 'bg-blue-100 text-blue-700',
      [RETURN_STATUS.PICKED_UP]: 'bg-indigo-100 text-indigo-700',
      [RETURN_STATUS.IN_TRANSIT]: 'bg-purple-100 text-purple-700',
      [RETURN_STATUS.RECEIVED]: 'bg-orange-100 text-orange-700',
      [RETURN_STATUS.INSPECTED]: 'bg-teal-100 text-teal-700',
      [RETURN_STATUS.APPROVED_REFUND]: 'bg-cyan-100 text-cyan-700',
      [RETURN_STATUS.REFUNDED]: 'bg-green-100 text-green-700',
      [RETURN_STATUS.REJECTED]: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      [PAYMENT_STATUS.PAID]: 'bg-green-100 text-green-700 border-green-300',
      [PAYMENT_STATUS.UNPAID]: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      [PAYMENT_STATUS.FAILED]: 'bg-red-100 text-red-700 border-red-300',
      [PAYMENT_STATUS.REFUNDED]: 'bg-blue-100 text-blue-700 border-blue-300',
      [PAYMENT_STATUS.PARTIALLY_REFUNDED]: 'bg-purple-100 text-purple-700 border-purple-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-700 border-gray-300';
  };

  const [needsAttention, setNeedsAttention] = useState([]);

  useEffect(() => {
    const fetchAttention = async () => {
      const attention = await getOrdersNeedingAttention();
      setNeedsAttention(attention);
    };
    if (orders.length > 0) {
      fetchAttention();
    }
  }, [orders]);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Package className="text-blue-600" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Orders & Returns</h1>
            <p className="text-sm text-gray-600">Manage orders, tracking, and returns</p>
          </div>
        </div>
        <button
          onClick={handleExportOrders}
          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          <Download size={18} />
          <span>Export</span>
        </button>
      </div>

      {/* Alerts */}
      {needsAttention.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="text-amber-600" size={20} />
            <p className="text-amber-900 font-medium">
              {needsAttention.length} order{needsAttention.length > 1 ? 's' : ''} need attention!
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        {['orders', 'returns', 'analytics'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab ? 'bg-[#8B0000] text-white' : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            {tab === 'orders' && 'Orders'}
            {tab === 'returns' && 'Returns'}
            {tab === 'analytics' && 'Analytics'}
          </button>
        ))}
      </div>

      {/* Search & Filters */}
      {(activeTab === 'orders' || activeTab === 'returns') && (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by order number, customer name, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B0000]"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B0000]"
            >
              <option value="all">All Status</option>
              {Object.values(activeTab === 'orders' ? ORDER_STATUS : RETURN_STATUS).map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            {activeTab === 'orders' && (
              <select
                value={paymentStatusFilter}
                onChange={(e) => setPaymentStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B0000]"
              >
                <option value="all">All Payment Status</option>
                {Object.values(PAYMENT_STATUS).map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            )}
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              No orders found. Orders will appear here once customers make purchases.
            </div>
          ) : (
            filteredOrders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{order.order_number}</h3>
                    <p className="text-sm text-gray-600">
                      {order.customer_name} • {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                    {order.payment_status && (
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPaymentStatusColor(order.payment_status)}`}>
                        {order.payment_status}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center space-x-2 text-sm">
                    <DollarSign size={16} className="text-gray-400" />
                    <span className="text-gray-700">₹{order.total_amount?.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Package size={16} className="text-gray-400" />
                    <span className="text-gray-700">{order.items?.length || 0} items</span>
                  </div>
                  {order.tracking_number && (
                    <div className="flex items-center space-x-2 text-sm">
                      <TruckIcon size={16} className="text-gray-400" />
                      <span className="text-gray-700">{order.tracking_number}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  <select
                    value={order.status}
                    onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B0000]"
                  >
                    {Object.values(ORDER_STATUS).map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center space-x-1"
                  >
                    <Eye size={16} />
                    <span>Details</span>
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Returns Tab */}
      {activeTab === 'returns' && (
        <div className="space-y-4">
          {filteredReturns.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              No returns yet. Return requests will appear here.
            </div>
          ) : (
            filteredReturns.map((returnItem) => (
              <motion.div
                key={returnItem.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{returnItem.return_number}</h3>
                    <p className="text-sm text-gray-600">
                      Order: {returnItem.order_number} • {returnItem.customer_name}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getReturnStatusColor(returnItem.status)}`}>
                    {returnItem.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="text-sm">
                    <span className="text-gray-500">Reason:</span>
                    <p className="text-gray-900 font-medium">{returnItem.reason}</p>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">Refund Amount:</span>
                    <p className="text-gray-900 font-medium">₹{returnItem.refund_amount?.toLocaleString()}</p>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">Items:</span>
                    <p className="text-gray-900 font-medium">{returnItem.items?.length || 0}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <select
                    value={returnItem.status}
                    onChange={(e) => handleUpdateReturnStatus(returnItem.id, e.target.value)}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B0000]"
                  >
                    {Object.values(RETURN_STATUS).map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => setSelectedReturn(returnItem)}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center space-x-1"
                  >
                    <Eye size={16} />
                    <span>Details</span>
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && orderAnalytics && returnAnalytics && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 mb-1">Total Orders</p>
              <p className="text-3xl font-bold text-gray-900">{orderAnalytics.total}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
              <p className="text-3xl font-bold text-green-600">₹{orderAnalytics.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 mb-1">Delivery Rate</p>
              <p className="text-3xl font-bold text-blue-600">{orderAnalytics.deliveryRate}%</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 mb-1">Return Rate</p>
              <p className="text-3xl font-bold text-red-600">{orderAnalytics.returnRate}%</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Orders by Status</h3>
              <div className="space-y-3">
                {Object.entries(orderAnalytics.byStatus).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{status}</span>
                    <span className="text-sm font-bold text-gray-900">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Returns by Reason</h3>
              <div className="space-y-3">
                {Object.entries(returnAnalytics.byReason)
                  .filter(([_, count]) => count > 0)
                  .map(([reason, count]) => (
                    <div key={reason} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{reason}</span>
                      <span className="text-sm font-bold text-gray-900">{count}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedOrder.order_number}</h2>
                <p className="text-sm text-gray-600">Order Details</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <XCircle size={24} className="text-gray-600" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Order Status */}
              <div className="flex items-center space-x-4">
                <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(selectedOrder.status)}`}>
                  {selectedOrder.status}
                </span>
                {selectedOrder.payment_status && (
                  <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getPaymentStatusColor(selectedOrder.payment_status)}`}>
                    {selectedOrder.payment_status}
                  </span>
                )}
              </div>

              {/* Customer Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Customer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2">
                    <Mail size={16} className="text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Customer</p>
                      <p className="text-sm font-medium text-gray-900">{selectedOrder.customer_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail size={16} className="text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm font-medium text-gray-900">{selectedOrder.customer_email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar size={16} className="text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Order Date</p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(selectedOrder.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Products */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Products ({selectedOrder.items?.length || 0})</h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Quantity</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedOrder.items?.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 text-sm text-gray-900">{item.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-center">{item.quantity || 1}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right">₹{item.price?.toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                            ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pricing Breakdown */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Pricing Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium text-gray-900">
                      ₹{(selectedOrder.subtotal || selectedOrder.total_amount || 0).toLocaleString()}
                    </span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        Discount {selectedOrder.discount_code && `(${selectedOrder.discount_code})`}
                      </span>
                      <span className="font-medium text-green-600">-₹{selectedOrder.discount.toLocaleString()}</span>
                    </div>
                  )}
                  {selectedOrder.tax > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax ({selectedOrder.tax_rate || 18}% GST)</span>
                      <span className="font-medium text-gray-900">₹{selectedOrder.tax.toLocaleString()}</span>
                    </div>
                  )}
                  {selectedOrder.shipping_charge > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping Charges</span>
                      <span className="font-medium text-gray-900">₹{selectedOrder.shipping_charge.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-gray-300 flex justify-between">
                    <span className="font-semibold text-gray-900">Total Amount</span>
                    <span className="font-bold text-lg text-gray-900">₹{selectedOrder.total_amount?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Payment Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Payment Method</p>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        selectedOrder.payment_method === 'Cash on Delivery' || selectedOrder.payment_method === 'COD'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {selectedOrder.payment_method === 'Cash on Delivery' || selectedOrder.payment_method === 'COD' ? 'COD' : 'Online Payment'}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {selectedOrder.payment_method || 'Cash on Delivery'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Payment Status</p>
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                      selectedOrder.payment_status === 'Paid' || selectedOrder.payment_status === PAYMENT_STATUS.PAID
                        ? 'bg-green-100 text-green-700'
                        : selectedOrder.payment_status === 'Failed' || selectedOrder.payment_status === PAYMENT_STATUS.FAILED
                        ? 'bg-red-100 text-red-700'
                        : selectedOrder.payment_status === 'Refunded' || selectedOrder.payment_status === PAYMENT_STATUS.REFUNDED
                        ? 'bg-purple-100 text-purple-700'
                        : selectedOrder.payment_status === 'Partially Refunded' || selectedOrder.payment_status === PAYMENT_STATUS.PARTIALLY_REFUNDED
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {selectedOrder.payment_status || 'Unpaid'}
                    </span>
                  </div>
                  {selectedOrder.transaction_id && (
                    <div className="md:col-span-2">
                      <p className="text-xs text-gray-500">Transaction ID</p>
                      <p className="text-sm font-mono font-medium text-gray-900">{selectedOrder.transaction_id}</p>
                    </div>
                  )}
                  {(selectedOrder.payment_status === 'Refunded' || selectedOrder.payment_status === PAYMENT_STATUS.REFUNDED ||
                    selectedOrder.payment_status === 'Partially Refunded' || selectedOrder.payment_status === PAYMENT_STATUS.PARTIALLY_REFUNDED) && (
                    <div className="md:col-span-2 bg-purple-100 border border-purple-200 rounded-lg p-3">
                      <p className="text-xs font-semibold text-purple-900 mb-1">Refund Information</p>
                      <p className="text-sm text-purple-800">
                        {selectedOrder.payment_status === 'Partially Refunded' || selectedOrder.payment_status === PAYMENT_STATUS.PARTIALLY_REFUNDED
                          ? 'This order has been partially refunded to the customer.'
                          : 'This order has been fully refunded to the customer.'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Shipping Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Shipping Address */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <MapPin size={16} className="text-gray-600" />
                    <h3 className="font-semibold text-gray-900">Shipping Address</h3>
                  </div>
                  {selectedOrder.shipping_address && (
                    <div className="text-sm text-gray-700 space-y-1">
                      <p>{selectedOrder.shipping_address.street}</p>
                      <p>{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state}</p>
                      <p>{selectedOrder.shipping_address.pincode}</p>
                      {selectedOrder.shipping_address.phone && (
                        <p className="flex items-center space-x-1 mt-2">
                          <Phone size={14} />
                          <span>{selectedOrder.shipping_address.phone}</span>
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Billing Address */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <MapPin size={16} className="text-gray-600" />
                    <h3 className="font-semibold text-gray-900">Billing Address</h3>
                  </div>
                  {selectedOrder.billing_address && (
                    <div className="text-sm text-gray-700 space-y-1">
                      <p>{selectedOrder.billing_address.street || 'Same as shipping'}</p>
                      {selectedOrder.billing_address.city && (
                        <>
                          <p>{selectedOrder.billing_address.city}, {selectedOrder.billing_address.state}</p>
                          <p>{selectedOrder.billing_address.pincode}</p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Tracking Information */}
              {(selectedOrder.tracking_number || selectedOrder.shipping_partner) && (
                <div className="bg-purple-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Tracking Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedOrder.tracking_number && (
                      <div>
                        <p className="text-xs text-gray-500">Tracking Number</p>
                        <p className="text-sm font-mono font-medium text-gray-900">{selectedOrder.tracking_number}</p>
                      </div>
                    )}
                    {selectedOrder.shipping_partner && (
                      <div>
                        <p className="text-xs text-gray-500">Shipping Partner</p>
                        <p className="text-sm font-medium text-gray-900">{selectedOrder.shipping_partner}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Status History */}
              {selectedOrder.status_history && selectedOrder.status_history.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Order Timeline</h3>
                  <div className="space-y-3">
                    {selectedOrder.status_history.map((history, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="mt-1">
                          <div className="w-2 h-2 bg-burgundy-600 rounded-full"></div>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{history.status}</p>
                          <p className="text-xs text-gray-500">{history.note}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(history.timestamp).toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Print Shipping Label
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 bg-burgundy-700 text-white rounded-lg hover:bg-burgundy-800"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Return Details Modal */}
      {selectedReturn && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedReturn.return_number}</h2>
                <p className="text-sm text-gray-600">Return Details (Order: {selectedReturn.order_number})</p>
              </div>
              <button
                onClick={() => setSelectedReturn(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <XCircle size={24} className="text-gray-600" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Return Status */}
              <div>
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${getReturnStatusColor(selectedReturn.status)}`}>
                  {selectedReturn.status}
                </span>
              </div>

              {/* Customer Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Customer Information</h3>
                <div className="space-y-2">
                  <p className="text-sm"><span className="text-gray-500">Name:</span> <span className="font-medium">{selectedReturn.customer_name}</span></p>
                  <p className="text-sm"><span className="text-gray-500">Email:</span> <span className="font-medium">{selectedReturn.customer_email}</span></p>
                </div>
              </div>

              {/* Return Reason */}
              <div className="bg-amber-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Return Reason</h3>
                <p className="text-sm font-medium text-gray-900">{selectedReturn.reason}</p>
                {selectedReturn.reason_detail && (
                  <p className="text-sm text-gray-600 mt-1">{selectedReturn.reason_detail}</p>
                )}
              </div>

              {/* Returned Items */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Returned Items ({selectedReturn.items?.length || 0})</h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Quantity</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedReturn.items?.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 text-sm text-gray-900">{item.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-center">{item.quantity || 1}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right">₹{item.price?.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Refund Information */}
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Refund Information</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500">Refund Amount</p>
                    <p className="text-lg font-bold text-gray-900">₹{selectedReturn.refund_amount?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Refund Method</p>
                    <p className="text-sm font-medium text-gray-900">{selectedReturn.refund_method || 'Original Payment Method'}</p>
                  </div>
                </div>
              </div>

              {/* Pickup Address */}
              {selectedReturn.pickup_address && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <MapPin size={16} className="text-gray-600" />
                    <h3 className="font-semibold text-gray-900">Pickup Address</h3>
                  </div>
                  <div className="text-sm text-gray-700 space-y-1">
                    <p>{selectedReturn.pickup_address.street}</p>
                    <p>{selectedReturn.pickup_address.city}, {selectedReturn.pickup_address.state}</p>
                    <p>{selectedReturn.pickup_address.pincode}</p>
                  </div>
                </div>
              )}

              {/* Status History */}
              {selectedReturn.status_history && selectedReturn.status_history.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Return Timeline</h3>
                  <div className="space-y-3">
                    {selectedReturn.status_history.map((history, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="mt-1">
                          <div className="w-2 h-2 bg-burgundy-600 rounded-full"></div>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{history.status}</p>
                          <p className="text-xs text-gray-500">{history.note}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(history.timestamp).toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                  onClick={() => setSelectedReturn(null)}
                  className="px-4 py-2 bg-burgundy-700 text-white rounded-lg hover:bg-burgundy-800"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default OrdersReturns;
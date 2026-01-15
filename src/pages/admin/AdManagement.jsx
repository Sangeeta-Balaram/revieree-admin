import { useState, useEffect } from 'react';
import { TrendingUp, IndianRupee, Eye, MousePointerClick, Target, AlertCircle } from 'lucide-react';
import AIAdSpecialist from '../../components/AIAdSpecialist';
import { getProducts } from '../../utils/storage';
import { getOrders } from '../../utils/ordersStorage';

const AdManagement = () => {
  const [businessData, setBusinessData] = useState(null);

  useEffect(() => {
    loadBusinessData();
  }, []);

  const loadBusinessData = () => {
    const products = getProducts();
    const orders = getOrders();
    const subscribers = JSON.parse(localStorage.getItem('subscribers') || '[]');

    // Calculate total revenue from delivered orders
    const totalRevenue = orders
      .filter(o => o.status === 'Delivered')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    // Calculate average order value
    const deliveredOrders = orders.filter(o => o.status === 'Delivered');
    const avgOrderValue = deliveredOrders.length > 0
      ? Math.round(totalRevenue / deliveredOrders.length)
      : 0;

    // Get top products by sales
    const productSales = {};
    orders.forEach(order => {
      order.items?.forEach(item => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = { count: 0, revenue: 0, name: item.name };
        }
        productSales[item.productId].count += item.quantity || 1;
        productSales[item.productId].revenue += item.price * (item.quantity || 1);
      });
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
      .map(p => ({ name: p.name, sold: p.count, revenue: p.revenue }));

    setBusinessData({
      totalProducts: products.length,
      totalRevenue,
      totalOrders: orders.length,
      avgOrderValue,
      subscribers: subscribers.length,
      topProducts,
    });
  };

  if (!businessData) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600">Loading business data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-purple-100 rounded-lg">
            <TrendingUp className="text-purple-600" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Ad Management</h1>
            <p className="text-sm text-gray-600">AI-powered advertising strategy & insights</p>
          </div>
        </div>
      </div>

      {/* Business Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <IndianRupee className="text-green-600" size={20} />
            </div>
            <p className="text-sm text-gray-600">Total Revenue</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">₹{businessData.totalRevenue.toLocaleString()}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Target className="text-blue-600" size={20} />
            </div>
            <p className="text-sm text-gray-600">Total Orders</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{businessData.totalOrders}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <MousePointerClick className="text-purple-600" size={20} />
            </div>
            <p className="text-sm text-gray-600">Avg Order Value</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">₹{businessData.avgOrderValue.toLocaleString()}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Eye className="text-orange-600" size={20} />
            </div>
            <p className="text-sm text-gray-600">Subscribers</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{businessData.subscribers}</p>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <div className="flex items-start space-x-3">
          <AlertCircle className="text-blue-600 mt-1" size={20} />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">About Ad Management</h3>
            <p className="text-sm text-blue-800 mb-2">
              Our AI Ad Specialist analyzes your business data and provides personalized advertising recommendations including:
            </p>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Platform recommendations (Meta/Facebook/Instagram, Google Ads)</li>
              <li>Budget suggestions and ROI projections</li>
              <li>Campaign ideas with targeting strategies</li>
              <li>Best timing and audience insights</li>
              <li>Creative recommendations and quick wins</li>
            </ul>
            <p className="text-xs text-blue-700 mt-3">
              <strong>Note:</strong> Direct Meta Ads and Google Ads API integration requires business verification and API access. The AI provides strategic guidance that you can implement manually in your ad platforms.
            </p>
          </div>
        </div>
      </div>

      {/* AI Ad Specialist */}
      <AIAdSpecialist businessData={businessData} />
    </div>
  );
};

export default AdManagement;
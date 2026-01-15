import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Package,
  ShoppingCart,
  IndianRupee,
  TrendingUp,
  Star,
  Eye,
  MapPin,
  AlertTriangle,
  Globe,
  Mail,
  Download,
  FileText,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { getProducts } from '../../utils/adminStorage';
import { getNewsletterSubscribers } from '../../utils/adminStorage';
import {
  getCurrentUserPermissions,
  hasPermission,
  PERMISSIONS,
} from '../../utils/permissions';
import { checkStockLevels, getNotifications, addNotification, NOTIFICATION_TYPES } from '../../utils/notifications';
import AIInsights from '../../components/AIInsights';

const Dashboard = () => {
  const [products, setProducts] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [stockData, setStockData] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [userPermissions, setUserPermissions] = useState([]);

  useEffect(() => {
    loadData();
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    const { permissions } = await getCurrentUserPermissions();
    setUserPermissions(permissions || []);
  };

  const loadData = async () => {
    const allProducts = getProducts();
    const allSubscribers = getNewsletterSubscribers();

    setProducts(allProducts);
    setSubscribers(allSubscribers);
    setTotalProducts(allProducts.length);

    // Calculate stock data from real products with stock field
    const productsWithStock = allProducts
      .filter(p => p.stock !== undefined)
      .map(p => ({
        product: p.name,
        current: p.stock || 0,
        minimum: 20,
        status: p.stock === 0 ? 'critical' : p.stock < 10 ? 'low' : 'good',
      }));
    setStockData(productsWithStock);

    // Check stock levels and create notifications
    await checkStockLevels(allProducts);

    // Add sample notifications only once (for first-time testing)
    const samplesCreated = localStorage.getItem('sample_notifications_created');
    if (!samplesCreated) {
      const existingNotifications = await getNotifications();
      if (existingNotifications.length === 0) {
        await addNotification(
          NOTIFICATION_TYPES.NEW_ORDER,
          'New Order Received',
          'Order #ORD-12345678 from John Doe - ₹2,500',
          { orderId: 'ORD-12345678', customerName: 'John Doe', amount: 2500 }
        );
        await addNotification(
          NOTIFICATION_TYPES.LOW_STOCK,
          'Low Stock Warning',
          'Sample Product is running low (8 units remaining)',
          { productId: 1, productName: 'Sample Product', stock: 8 }
        );
        localStorage.setItem('sample_notifications_created', 'true');
      }
    }
  };

  // Export functions
  const exportToCSV = (data, filename) => {
    if (!data || data.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(obj => Object.values(obj).map(val => `"${val}"`).join(',')).join('\n');
    const csv = `${headers}\n${rows}`;

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExportDashboard = () => {
    const dashboardData = {
      totalProducts,
      totalSubscribers: subscribers.length,
      lowStockItems: stockData.filter(item => item.status === 'low' || item.status === 'critical').length,
      exportDate: new Date().toISOString(),
    };

    const csv = `Metric,Value\nTotal Products,${dashboardData.totalProducts}\nTotal Subscribers,${dashboardData.totalSubscribers}\nLow Stock Items,${dashboardData.lowStockItems}\nExport Date,${dashboardData.exportDate}`;

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard_summary_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExportStockReport = () => {
    exportToCSV(stockData, 'stock_report');
  };

  // Sales data - empty until we have order tracking
  const salesData = [
    { date: 'Mon', sales: 0, purchases: 0, revenue: 0 },
    { date: 'Tue', sales: 0, purchases: 0, revenue: 0 },
    { date: 'Wed', sales: 0, purchases: 0, revenue: 0 },
    { date: 'Thu', sales: 0, purchases: 0, revenue: 0 },
    { date: 'Fri', sales: 0, purchases: 0, revenue: 0 },
    { date: 'Sat', sales: 0, purchases: 0, revenue: 0 },
    { date: 'Sun', sales: 0, purchases: 0, revenue: 0 },
  ];

  // Stats cards with real data - filtered by permissions
  const allStats = [
    {
      icon: Users,
      label: 'Total Customers',
      value: '0',
      change: 'No orders yet',
      positive: true,
      color: 'blue',
      permission: PERMISSIONS.VIEW_ANALYTICS,
    },
    {
      icon: Package,
      label: 'Products in Stock',
      value: totalProducts.toString(),
      change: `${totalProducts} items total`,
      positive: true,
      color: 'green',
      permission: PERMISSIONS.VIEW_PRODUCTS,
    },
    {
      icon: ShoppingCart,
      label: 'Total Orders',
      value: '0',
      change: 'No orders yet',
      positive: true,
      color: 'purple',
      permission: PERMISSIONS.VIEW_ANALYTICS,
    },
    {
      icon: IndianRupee,
      label: 'Revenue (₹)',
      value: '₹0',
      change: 'No sales yet',
      positive: true,
      color: 'yellow',
      permission: PERMISSIONS.VIEW_ANALYTICS,
    },
    {
      icon: Eye,
      label: 'Website Visits',
      value: '0',
      change: 'Analytics not configured',
      positive: true,
      color: 'indigo',
      permission: PERMISSIONS.VIEW_ANALYTICS,
    },
    {
      icon: Mail,
      label: 'Subscriptions',
      value: subscribers.length.toString(),
      change: `${subscribers.length} total subscribers`,
      positive: true,
      color: 'pink',
      permission: PERMISSIONS.VIEW_SUBSCRIBERS,
    },
  ];

  // Filter stats based on user permissions
  const stats = allStats.filter(stat => hasPermission(userPermissions, stat.permission));

  // Empty data for charts until order tracking is implemented
  const trafficSources = [];
  const shippingAreas = [];
  const visitsData = [];
  const topProducts = [];

  // Prepare business data for AI insights
  const businessData = {
    totalProducts: totalProducts,
    totalRevenue: 0, // Will be populated when orders are tracked
    totalOrders: 0,
    avgOrderValue: 0,
    subscribers: subscribers.length,
    lowStockItems: stockData.filter(item => item.status === 'low' || item.status === 'critical').length,
    fragranceCount: products.filter(p => p.category === 'fragrance').length,
    cosmeticCount: products.filter(p => p.category === 'cosmetic').length,
    topProducts: topProducts,
  };

  return (
    <div>
      {/* Header with Export Buttons */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        {hasPermission(userPermissions, PERMISSIONS.EXPORT_DATA) && (
          <div className="flex items-center space-x-3">
            <button
              onClick={handleExportDashboard}
              className="flex items-center space-x-2 px-4 py-2 bg-burgundy-700 text-white rounded-lg hover:bg-burgundy-800 transition-colors"
            >
              <FileText size={18} />
              <span>Export Summary</span>
            </button>
            <button
              onClick={handleExportStockReport}
              className="flex items-center space-x-2 px-4 py-2 border border-burgundy-700 text-burgundy-700 rounded-lg hover:bg-burgundy-50 transition-colors"
            >
              <Download size={18} />
              <span>Export Stock Report</span>
            </button>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 bg-${stat.color}-100 rounded-lg`}>
                <stat.icon className={`text-${stat.color}-700`} size={24} />
              </div>
              <span className={`text-sm font-medium ${stat.positive ? 'text-green-600' : 'text-red-600'}`}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
            <p className="text-gray-600 text-sm">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* AI Business Insights */}
      {hasPermission(userPermissions, PERMISSIONS.VIEW_ANALYTICS) && (
        <div className="mb-8">
          <AIInsights businessData={businessData} />
        </div>
      )}

      {/* Charts Row 1 */}
      {hasPermission(userPermissions, PERMISSIONS.VIEW_ANALYTICS) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Sales & Revenue Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Sales & Revenue (Last 7 Days)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => `₹${(value || 0).toLocaleString()}`} />
                <Legend />
                <Area type="monotone" dataKey="revenue" stroke="#7C3AED" fill="#7C3AED" fillOpacity={0.6} name="Revenue (₹)" />
                <Area type="monotone" dataKey="sales" stroke="#10B981" fill="#10B981" fillOpacity={0.6} name="Sales" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Traffic Sources */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Customer Acquisition Sources</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={trafficSources}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {trafficSources.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Charts Row 2 */}
      {hasPermission(userPermissions, PERMISSIONS.VIEW_ANALYTICS) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Website Visits & Subscriptions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Website Traffic & Subscriptions</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={visitsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="visits" stroke="#3B82F6" strokeWidth={2} name="Visits" />
                <Line type="monotone" dataKey="subscriptions" stroke="#F59E0B" strokeWidth={2} name="Subscriptions" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Shipping Areas */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <MapPin size={20} className="mr-2" />
              Top Shipping Locations
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={shippingAreas} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="city" type="category" />
                <Tooltip />
                <Bar dataKey="orders" fill="#8B5CF6" name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Low Stock Alert & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alert */}
        {(hasPermission(userPermissions, PERMISSIONS.VIEW_PRODUCTS) || hasPermission(userPermissions, PERMISSIONS.MANAGE_STOCK)) && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <AlertTriangle size={20} className="mr-2 text-red-600" />
              Stock Levels
            </h2>
            <div className="space-y-4">
              {stockData.map((item, index) => (
                <div key={index} className="border-b pb-3 last:border-0">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-900">{item.product}</span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        item.status === 'critical'
                          ? 'bg-red-100 text-red-700'
                          : item.status === 'low'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {item.current} units
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        item.status === 'critical'
                          ? 'bg-red-600'
                          : item.status === 'low'
                          ? 'bg-yellow-600'
                          : 'bg-green-600'
                      }`}
                      style={{ width: `${(item.current / 50) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Minimum: {item.minimum} units</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Products */}
        {hasPermission(userPermissions, PERMISSIONS.VIEW_ANALYTICS) && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp size={20} className="mr-2 text-green-600" />
              Top Selling Products
            </h2>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-burgundy-100 text-burgundy-700 font-semibold mr-3">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-600">{product.sold} units sold</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">₹{(product.revenue || 0).toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Revenue</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
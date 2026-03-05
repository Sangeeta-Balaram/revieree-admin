import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, FileText, Plus, Edit, Trash2, X, Save, Bell, XCircle, AlertTriangle, CheckCircle } from 'lucide-react';
import {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  getBlogs,
  addBlog,
  updateBlog,
  deleteBlog,
} from '../utils/storage';
import logo from '../assets/images/logo.png';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [notifications, setNotifications] = useState(() => {
    const stored = localStorage.getItem('admin_notifications');
    return stored ? JSON.parse(stored) : [];
  });
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setProducts(getProducts());
    setBlogs(getBlogs());
    checkLowStock();
  };

  // Check for low stock products
  const checkLowStock = () => {
    const allProducts = getProducts();
    const lowStockProducts = allProducts.filter(p => p.stock && p.stock < 5);
    
    if (lowStockProducts.length > 0) {
      lowStockProducts.forEach(product => {
        const exists = notifications.find(n => 
          n.type === 'low_stock' && n.productId === product.id
        );
        if (!exists) {
          addNotification({
            type: 'low_stock',
            title: 'Low Stock Alert',
            message: `${product.name} is running low (${product.stock} left)`,
            productId: product.id
          });
        }
      });
    }
  };

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      ...notification,
      timestamp: new Date().toISOString(),
      read: false
    };
    const updated = [newNotification, ...notifications];
    setNotifications(updated);
    localStorage.setItem('admin_notifications', JSON.stringify(updated));
  };

  const markAsRead = (id) => {
    const updated = notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updated);
    localStorage.setItem('admin_notifications', JSON.stringify(updated));
  };

  const clearNotifications = () => {
    setNotifications([]);
    localStorage.setItem('admin_notifications', JSON.stringify([]));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleOpenModal = (item = null, type = 'product') => {
    setEditingItem(item);
    if (item) {
      setFormData(item);
    } else {
      setFormData(
        type === 'product'
          ? {
              name: '',
              category: 'fragrance',
              price: '',
              description: '',
              image: '',
              notes: '',
              featured: false,
            }
          : {
              title: '',
              excerpt: '',
              content: '',
              image: '',
              category: '',
              author: 'Revieree Team',
            }
      );
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({});
  };

  const handleSaveProduct = () => {
    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      notes: formData.notes ? formData.notes.split(',').map(n => n.trim()) : [],
    };

    if (editingItem) {
      updateProduct(editingItem.id, productData);
    } else {
      addProduct(productData);
    }

    loadData();
    handleCloseModal();
  };

  const handleSaveBlog = () => {
    if (editingItem) {
      updateBlog(editingItem.id, formData);
    } else {
      addBlog(formData);
    }

    loadData();
    handleCloseModal();
  };

  const handleDelete = (id, type) => {
    if (window.confirm(`Are you sure you want to delete this ${type}?`)) {
      if (type === 'product') {
        deleteProduct(id);
      } else {
        deleteBlog(id);
      }
      loadData();
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50">
      <div className="container-custom">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex justify-between items-start"
        >
          <div>
            <img src={logo} alt="Revieree" className="h-16 w-16 rounded-full object-cover mb-4 mx-auto" />
            <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">
              Admin Panel
            </h1>
            <p className="text-gray-600">Manage your products and blog posts</p>
          </div>
          
          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-600 hover:text-gray-900"
            >
              <Bell size={24} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            
            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
                <div className="p-3 border-b flex justify-between items-center">
                  <span className="font-semibold">Notifications</span>
                  {notifications.length > 0 && (
                    <button 
                      onClick={clearNotifications}
                      className="text-xs text-red-600 hover:text-red-800"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No notifications
                  </div>
                ) : (
                  notifications.map(n => (
                    <div 
                      key={n.id}
                      className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${!n.read ? 'bg-blue-50' : ''}`}
                      onClick={() => markAsRead(n.id)}
                    >
                      <div className="flex items-start space-x-2">
                        {n.type === 'low_stock' && <AlertTriangle size={16} className="text-orange-500 mt-1" />}
                        {n.type === 'new_order' && <CheckCircle size={16} className="text-green-500 mt-1" />}
                        {n.type === 'cancelled' && <XCircle size={16} className="text-red-500 mt-1" />}
                        <div>
                          <p className="font-medium text-sm">{n.title}</p>
                          <p className="text-xs text-gray-600">{n.message}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(n.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex space-x-2 md:space-x-4 mb-8 border-b overflow-x-auto">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 md:px-6 py-3 font-medium transition-colors relative whitespace-nowrap ${
              activeTab === 'products'
                ? 'text-burgundy-700'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Package size={18} />
              <span>Products</span>
            </div>
            {activeTab === 'products' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-burgundy-700"
              />
            )}
          </button>

          <button
            onClick={() => setActiveTab('blogs')}
            className={`px-4 md:px-6 py-3 font-medium transition-colors relative whitespace-nowrap ${
              activeTab === 'blogs'
                ? 'text-burgundy-700'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center space-x-2">
              <FileText size={18} />
              <span>Blogs</span>
            </div>
            {activeTab === 'blogs' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-burgundy-700"
              />
            )}
          </button>
        </div>

        {/* Products Tab */}
        {activeTab === 'products' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Products ({products.length})</h2>
              <button
                onClick={() => handleOpenModal(null, 'product')}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus size={20} />
                <span>Add Product</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">{product.name}</h3>
                        <span className="text-sm text-gray-500 capitalize">
                          {product.category}
                        </span>
                      </div>
                      <span className="text-lg font-bold text-burgundy-700">
                        ${product.price}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleOpenModal(product, 'product')}
                        className="flex-1 px-4 py-2 bg-burgundy-100 text-burgundy-700 rounded hover:bg-burgundy-200 transition-colors flex items-center justify-center space-x-1"
                      >
                        <Edit size={16} />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(product.id, 'product')}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Blogs Tab */}
        {activeTab === 'blogs' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Blog Posts ({blogs.length})</h2>
              <button
                onClick={() => handleOpenModal(null, 'blog')}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus size={20} />
                <span>Add Blog Post</span>
              </button>
            </div>

            <div className="space-y-4">
              {blogs.map((blog) => (
                <motion.div
                  key={blog.id}
                  layout
                  className="bg-white rounded-lg shadow-md p-6 flex items-start space-x-4"
                >
                  <img
                    src={blog.image}
                    alt={blog.title}
                    className="w-32 h-32 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-1">{blog.title}</h3>
                    <p className="text-sm text-gray-500 mb-2">
                      {blog.category} • {blog.date} • {blog.author}
                    </p>
                    <p className="text-gray-600 mb-4 line-clamp-2">{blog.excerpt}</p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleOpenModal(blog, 'blog')}
                        className="px-4 py-2 bg-burgundy-100 text-burgundy-700 rounded hover:bg-burgundy-200 transition-colors flex items-center space-x-1"
                      >
                        <Edit size={16} />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(blog.id, 'blog')}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors flex items-center space-x-1"
                      >
                        <Trash2 size={16} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-serif font-bold">
                    {editingItem ? 'Edit' : 'Add'}{' '}
                    {activeTab === 'products' ? 'Product' : 'Blog Post'}
                  </h2>
                  <button
                    onClick={handleCloseModal}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <X size={24} />
                  </button>
                </div>

                {activeTab === 'products' ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Product Name
                      </label>
                      <input
                        type="text"
                        value={formData.name || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <select
                        value={formData.category || 'fragrance'}
                        onChange={(e) =>
                          setFormData({ ...formData, category: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
                      >
                        <option value="fragrance">Fragrance</option>
                        <option value="cosmetic">Cosmetic</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.price || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, price: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={formData.description || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, description: e.target.value })
                        }
                        rows="3"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Image URL
                      </label>
                      <input
                        type="text"
                        value={formData.image || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, image: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
                      />
                    </div>

                    {formData.category === 'fragrance' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Notes (comma separated)
                        </label>
                        <input
                          type="text"
                          value={
                            Array.isArray(formData.notes)
                              ? formData.notes.join(', ')
                              : formData.notes || ''
                          }
                          onChange={(e) =>
                            setFormData({ ...formData, notes: e.target.value })
                          }
                          placeholder="Rose, Vanilla, Musk"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
                        />
                      </div>
                    )}

                    {formData.category === 'cosmetic' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Shade
                          </label>
                          <input
                            type="text"
                            value={formData.shade || ''}
                            onChange={(e) =>
                              setFormData({ ...formData, shade: e.target.value })
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Finish
                          </label>
                          <input
                            type="text"
                            value={formData.finish || ''}
                            onChange={(e) =>
                              setFormData({ ...formData, finish: e.target.value })
                            }
                            placeholder="Matte, Glossy, Satin"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
                          />
                        </div>
                      </>
                    )}

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="featured"
                        checked={formData.featured || false}
                        onChange={(e) =>
                          setFormData({ ...formData, featured: e.target.checked })
                        }
                        className="mr-2"
                      />
                      <label htmlFor="featured" className="text-sm font-medium text-gray-700">
                        Featured Product
                      </label>
                    </div>

                    <button
                      onClick={handleSaveProduct}
                      className="w-full btn-primary flex items-center justify-center space-x-2"
                    >
                      <Save size={20} />
                      <span>Save Product</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        value={formData.title || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <input
                        type="text"
                        value={formData.category || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, category: e.target.value })
                        }
                        placeholder="Tips & Tricks, Beauty Guide, etc."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Excerpt
                      </label>
                      <textarea
                        value={formData.excerpt || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, excerpt: e.target.value })
                        }
                        rows="2"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Content
                      </label>
                      <textarea
                        value={formData.content || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, content: e.target.value })
                        }
                        rows="6"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Image URL
                      </label>
                      <input
                        type="text"
                        value={formData.image || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, image: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Author
                      </label>
                      <input
                        type="text"
                        value={formData.author || 'Revieree Team'}
                        onChange={(e) =>
                          setFormData({ ...formData, author: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
                      />
                    </div>

                    <button
                      onClick={handleSaveBlog}
                      className="w-full btn-primary flex items-center justify-center space-x-2"
                    >
                      <Save size={20} />
                      <span>Save Blog Post</span>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Admin;
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Package, Search, Download, Upload, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { getProducts, addProduct, updateProduct, deleteProduct, saveProducts, exportToCSV, parseCSV } from '../../utils/adminStorage';
import {
  getCurrentUserPermissions,
  hasPermission,
  PERMISSIONS,
} from '../../utils/permissions';

const Products = () => {
  console.log('Products component is mounting...');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [userPermissions, setUserPermissions] = useState(['*']); // Default to all permissions
  const [sortField, setSortField] = useState('name'); // name, price, stock
  const [sortDirection, setSortDirection] = useState('asc'); // asc, desc
  const [stockFilter, setStockFilter] = useState('all'); // all, in-stock, low-stock, out-of-stock
  const [selectedItems, setSelectedItems] = useState([]); // For selective export
  const [selectedCategory, setSelectedCategory] = useState(''); // 'fragrances' or 'cosmetics'

  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    stock: '',
    category: '',
    subcategory: '',
    description: '',
    notes: '',
    images: [],
    video: null,
    variations: [],
    featured: false,
    hasOffer: false,
    offerPercentage: '',
  });

  // Load products from localStorage on mount
  useEffect(() => {
    loadProducts();
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    try {
      const { permissions } = await getCurrentUserPermissions();
      console.log('Loaded permissions:', permissions);
      setUserPermissions(permissions || []);
    } catch (error) {
      console.error('Error loading permissions:', error);
      setUserPermissions(['*']); // Fallback to admin permissions
    }
  };

  const loadProducts = () => {
    try {
      const allProducts = getProducts();
      console.log('Loaded products:', allProducts);
      setProducts(allProducts);
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
    }
  };

  const handleAddProduct = (e) => {
    e.preventDefault();
    const product = {
      name: newProduct.name,
      price: parseInt(newProduct.price),
      stock: parseInt(newProduct.stock),
      category: selectedCategory === 'fragrances' ? 'fragrance' : 'cosmetics',
      subcategory: newProduct.subcategory,
      description: newProduct.description,
      notes: newProduct.notes.split(',').map(n => n.trim()),
      images: newProduct.images.length > 0 ? newProduct.images : ['https://images.unsplash.com/photo-1594035910387-fea47794261f?w=500&h=500&fit=crop'],
      video: newProduct.video,
      variations: newProduct.variations,
      featured: newProduct.featured,
      hasOffer: newProduct.hasOffer,
      offerPercentage: newProduct.hasOffer ? parseInt(newProduct.offerPercentage) : 0,
    };

    addProduct(product);
    loadProducts();

    setNewProduct({
      name: '',
      price: '',
      stock: '',
      category: '',
      subcategory: '',
      description: '',
      notes: '',
      images: [],
      video: null,
      variations: [],
      featured: false,
      hasOffer: false,
      offerPercentage: '',
    });
    setSelectedCategory('');
    setShowAddModal(false);
  };

  const handleEditClick = (product) => {
    setEditingProduct({
      ...product,
      notes: product.notes ? product.notes.join(', ') : '',
      imageUrl: product.image || '',
      offerPercentage: product.offerPercentage || '',
    });
    setShowEditModal(true);
  };

  const handleUpdateProduct = (e) => {
    e.preventDefault();
    const updates = {
      name: editingProduct.name,
      price: parseInt(editingProduct.price),
      stock: parseInt(editingProduct.stock),
      description: editingProduct.description,
      notes: editingProduct.notes.split(',').map(n => n.trim()),
      images: editingProduct.images || editingProduct.image ? [editingProduct.image] : [],
      video: editingProduct.video,
      variations: editingProduct.variations || [],
      featured: editingProduct.featured,
      hasOffer: editingProduct.hasOffer,
      offerPercentage: editingProduct.hasOffer ? parseInt(editingProduct.offerPercentage) : 0,
    };

    updateProduct(editingProduct.id, updates);
    loadProducts();
    setShowEditModal(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteProduct(id);
      loadProducts();
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleExportTemplate = () => {
    // Create a template CSV with sample data
    const template = [
      {
        name: 'Sample Product Name',
        price: 12500,
        stock: 50,
        category: 'fragrance',
        subcategory: 'perfume',
        description: 'Description of the product',
        notes: 'Bergamot;Iris;Sandalwood',
        image: 'https://example.com/image.jpg',
        featured: false,
        hasOffer: false,
        offerPercentage: 0,
      }
    ];
    exportToCSV(template, 'products_template');
    alert('Template downloaded! Fill in the details and upload using the Import button.');
  };

  const handleExportAll = () => {
    if (products.length === 0) {
      alert('No products to export');
      return;
    }
    const exportData = products.map(p => ({
      name: p.name,
      price: p.price,
      stock: p.stock,
      description: p.description,
      notes: Array.isArray(p.notes) ? p.notes.join(';') : p.notes,
      image: p.image,
      featured: p.featured,
      hasOffer: p.hasOffer || false,
      offerPercentage: p.offerPercentage || 0,
    }));
    exportToCSV(exportData, 'products_export');
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(filteredProducts.map(p => p.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id) => {
    setSelectedItems(prev =>
      prev.includes(id)
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };

  const handleExportSelected = () => {
    if (selectedItems.length === 0) {
      alert('Please select at least one product to export');
      return;
    }
    const selectedProducts = products.filter(p => selectedItems.includes(p.id));
    const exportData = selectedProducts.map(p => ({
      name: p.name,
      price: p.price,
      stock: p.stock,
      description: p.description,
      notes: Array.isArray(p.notes) ? p.notes.join(';') : p.notes,
      image: p.image,
      featured: p.featured,
      hasOffer: p.hasOffer || false,
      offerPercentage: p.offerPercentage || 0,
    }));
    exportToCSV(exportData, 'products_selected');
    alert(`${selectedItems.length} product(s) exported successfully!`);
    setSelectedItems([]);
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvData = parseCSV(e.target.result);

        // Validate and convert data
        const newProducts = csvData.map(item => ({
          name: item.name,
          price: Number(item.price),
          stock: Number(item.stock),
          category: item.category || 'fragrance',
          subcategory: item.subcategory || 'perfume',
          description: item.description,
          notes: typeof item.notes === 'string' ? item.notes.split(';').map(n => n.trim()) : item.notes,
          image: item.image || 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=500&h=500&fit=crop',
          featured: item.featured === true || item.featured === 'true',
          hasOffer: item.hasOffer === true || item.hasOffer === 'true',
          offerPercentage: Number(item.offerPercentage) || 0,
        }));

        // Add all new products
        newProducts.forEach(product => addProduct(product));
        loadProducts();
        alert(`Successfully imported ${newProducts.length} products!`);
        event.target.value = ''; // Reset file input
      } catch (error) {
        console.error('Import error:', error);
        alert('Error importing CSV. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  const filteredProducts = products
    .filter((p) => {
      // Search query filter
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());

      // Stock filter
      const stock = p.totalStock || p.stock || 0;
      const matchesStock = stockFilter === 'all' ? true :
        stockFilter === 'out-of-stock' ? stock === 0 :
        stockFilter === 'low-stock' ? stock > 0 && stock < 20 :
        stockFilter === 'in-stock' ? stock >= 20 : true;

      return matchesSearch && matchesStock;
    })
    .sort((a, b) => {
      let comparison = 0;

      if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === 'price') {
        comparison = a.price - b.price;
      } else if (sortField === 'stock') {
        comparison = (a.totalStock || a.stock || 0) - (b.totalStock || b.stock || 0);
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

  const getStockStatus = (stock) => {
    if (stock === 0) return 'Out of Stock';
    if (stock < 5) return 'Low Stock';
    return 'In Stock';
  };

  const getSortIcon = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown size={14} className="text-gray-400" />;
    }
    return sortDirection === 'asc' ?
      <ArrowUp size={14} className="text-burgundy-700" /> :
      <ArrowDown size={14} className="text-burgundy-700" />;
  };

  console.log('Products component rendering with:', { products: products.length, userPermissions });
  
  if (!userPermissions || userPermissions.length === 0) {
    return <div className="flex items-center justify-center h-64"><p>Loading permissions...</p></div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-1">{products.length} products total</p>
        </div>
        <div className="flex space-x-3">
          {hasPermission(userPermissions, PERMISSIONS.EXPORT_DATA) && (
            <>
              <button
                onClick={handleExportTemplate}
                className="flex items-center space-x-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download size={18} />
                <span>Download Template</span>
              </button>
              <button
                onClick={handleExportAll}
                className="flex items-center space-x-2 border border-burgundy-700 text-burgundy-700 px-4 py-2 rounded-lg hover:bg-burgundy-50 transition-colors"
              >
                <Download size={18} />
                <span>Export All</span>
              </button>
              <button
                onClick={handleExportSelected}
                disabled={selectedItems.length === 0}
                className={`flex items-center space-x-2 border px-4 py-2 rounded-lg transition-colors ${
                  selectedItems.length > 0
                    ? 'border-blue-600 text-blue-600 hover:bg-blue-50'
                    : 'border-gray-300 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Download size={18} />
                <span>Export Selected ({selectedItems.length})</span>
              </button>
            </>
          )}
          {hasPermission(userPermissions, PERMISSIONS.ADD_PRODUCTS) && (
            <>
              <label className="flex items-center space-x-2 border border-green-700 text-green-700 px-4 py-2 rounded-lg hover:bg-green-50 transition-colors cursor-pointer">
                <Upload size={18} />
                <span>Import CSV</span>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>
              <button
                onClick={() => {
                  setSelectedCategory('');
                  setShowAddModal(true);
                }}
                className="flex items-center space-x-2 bg-burgundy-700 text-white px-6 py-3 rounded-lg hover:bg-burgundy-800 transition-colors"
              >
                <Plus size={20} />
                <span>Add New Product</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
          />
        </div>
      </div>

      {/* Filter Controls */}
      <div className="mb-6 flex flex-wrap gap-4">
        {/* Stock Filter */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-2">Stock Status</label>
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
          >
            <option value="all">All Products</option>
            <option value="in-stock">In Stock (≥20)</option>
            <option value="low-stock">Low Stock (1-19)</option>
            <option value="out-of-stock">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <Package size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-xl text-gray-600">No products found.</p>
            <p className="text-sm text-gray-500 mt-2">Click "Add New Product" to create your first product.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === filteredProducts.length && filteredProducts.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-burgundy-600 rounded focus:ring-burgundy-500"
                    />
                  </th>
                  <th
                    onClick={() => handleSort('name')}
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Product</span>
                      {getSortIcon('name')}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Description
                  </th>
                  <th
                    onClick={() => handleSort('price')}
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Price</span>
                      {getSortIcon('price')}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('stock')}
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Stock</span>
                      {getSortIcon('stock')}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(product.id)}
                        onChange={() => handleSelectItem(product.id)}
                        className="w-4 h-4 text-burgundy-600 rounded focus:ring-burgundy-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-12 w-12 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 relative">
                          {product.images && product.images.length > 0 ? (
                            <div className="relative">
                              <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                              {product.images.length > 1 && (
                                <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs px-1 rounded-bl">
                                  +{product.images.length - 1}
                                </div>
                              )}
                            </div>
                          ) : product.image ? (
                            <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-burgundy-100">
                              <Package className="text-burgundy-700" size={20} />
                            </div>
                          )}
                          {product.video && (
                            <div className="absolute bottom-0 right-0 bg-red-600 text-white p-1 rounded-tl">
                              <span className="text-xs">📹</span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-xs text-gray-500">
                            {product.subcategory && <span className="mr-2">{product.subcategory}</span>}
                            {product.category && <span className="mr-2">{product.category}</span>}
                            {product.images && <span>{product.images.length} images</span>}
                            {product.video && <span className="ml-1">• Video</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600 line-clamp-2 max-w-xs">{product.description}</p>
                    </td>
                    <td className="px-6 py-4">
                      {product.variations && product.variations.length > 0 ? (
                        <div className="space-y-1">
                          {product.variations.map((variant, index) => (
                            <div key={variant.id || index} className="text-xs">
                              <span className="font-medium text-gray-900">{variant.size || variant.color}</span>
                              <span className="text-gray-600"> - ₹{(variant.price || 0).toLocaleString('en-IN')}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm font-medium text-gray-900">
                          ₹{(product.price || 0).toLocaleString('en-IN')}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {product.variations && product.variations.length > 0 ? (
                        <div className="space-y-1">
                          {product.variations.map((variant, index) => (
                            <div key={variant.id || index} className="text-xs flex items-center justify-between">
                              <span className="text-gray-600">{variant.size || variant.color}:</span>
                              <span className={`font-medium ${
                                (variant.stock || 0) === 0 ? 'text-red-600' :
                                (variant.stock || 0) < 20 ? 'text-yellow-600' :
                                'text-green-600'
                              }`}>
                                {variant.stock || 0} units
                              </span>
                            </div>
                          ))}
                          <div className="text-xs pt-1 border-t border-gray-200">
                            <span className="font-semibold text-gray-900">Total: {product.totalStock || 0}</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-600">{product.stock || 0} units</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          getStockStatus(product.totalStock || product.stock) === 'Out of Stock'
                            ? 'bg-red-100 text-red-700'
                            : getStockStatus(product.totalStock || product.stock) === 'Low Stock'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {getStockStatus(product.totalStock || product.stock)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        {hasPermission(userPermissions, PERMISSIONS.EDIT_PRODUCTS) && (
                          <button
                            onClick={() => handleEditClick(product)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Edit product"
                          >
                            <Edit size={18} />
                          </button>
                        )}
                        {hasPermission(userPermissions, PERMISSIONS.DELETE_PRODUCTS) && (
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete product"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add New Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-serif font-bold text-gray-900">Add New Product</h2>
            </div>

            {!selectedCategory ? (
              // Category Selection
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Select Product Category</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory('fragrances');
                      setNewProduct({
                        ...newProduct,
                        category: 'fragrances',
                        subcategory: 'perfume'
                      });
                    }}
                    className="p-6 border-2 border-gray-300 rounded-lg hover:border-burgundy-700 hover:bg-burgundy-50 transition-colors"
                  >
                    <Package className="w-12 h-12 text-burgundy-700 mb-3" />
                    <h4 className="font-semibold text-gray-900">Fragrances</h4>
                    <p className="text-sm text-gray-600 mt-1">Perfumes, Attars, Deodorants</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory('cosmetics');
                      setNewProduct({
                        ...newProduct,
                        category: 'cosmetics',
                        subcategory: 'lipstick'
                      });
                    }}
                    className="p-6 border-2 border-gray-300 rounded-lg hover:border-burgundy-700 hover:bg-burgundy-50 transition-colors"
                  >
                    <Package className="w-12 h-12 text-burgundy-700 mb-3" />
                    <h4 className="font-semibold text-gray-900">Cosmetics</h4>
                    <p className="text-sm text-gray-600 mt-1">Lipsticks, Kajal, Mascara</p>
                  </button>
                </div>
                <div className="flex justify-end space-x-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
               // Product Form
               <form onSubmit={handleAddProduct} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     Product Name *
                   </label>
                   <input
                     type="text"
                     value={newProduct.name}
                     onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
                     required
                   />
                 </div>

                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹) *</label>
                   <input
                     type="number"
                     value={newProduct.price}
                     onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
                     placeholder="e.g., 12500"
                     required
                   />
                 </div>

                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     Subcategory *
                   </label>
                   <select
                     value={newProduct.subcategory}
                     onChange={(e) => setNewProduct({ ...newProduct, subcategory: e.target.value })}
                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
                     required
                   >
                     <option value="">Select subcategory</option>
                     {selectedCategory === 'fragrances' ? (
                       <>
                         <option value="perfume">Perfume</option>
                         <option value="attar">Attar</option>
                         <option value="deodorant">Deodorant</option>
                         <option value="body-spray">Body Spray</option>
                       </>
                     ) : (
                       <>
                         <option value="lipstick">Lipstick</option>
                         <option value="kajal">Kajal</option>
                         <option value="mascara">Mascara</option>
                         <option value="lip-balm">Lip Balm</option>
                       </>
                     )}
                   </select>
                 </div>

                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     Stock Quantity *
                   </label>
                   <input
                     type="number"
                     value={newProduct.stock}
                     onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
                     placeholder="e.g., 50"
                     required
                   />
                 </div>

                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     Product Images (up to 9 images)
                   </label>
                   <div className="space-y-3">
                     {newProduct.images.map((image, index) => (
                       <div key={index} className="flex items-center space-x-2">
                         <input
                           type="url"
                           value={image}
                           onChange={(e) => {
                             const updatedImages = [...newProduct.images];
                             updatedImages[index] = e.target.value;
                             setNewProduct({ ...newProduct, images: updatedImages });
                           }}
                           className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
                           placeholder={`Image ${index + 1} URL`}
                         />
                         {newProduct.images.length > 1 && (
                           <button
                             type="button"
                             onClick={() => {
                               const updatedImages = newProduct.images.filter((_, i) => i !== index);
                               setNewProduct({ ...newProduct, images: updatedImages });
                             }}
                             className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                             title="Remove image"
                           >
                             <Trash2 size={18} />
                           </button>
                         )}
                       </div>
                     ))}
                     {newProduct.images.length < 9 && (
                       <button
                         type="button"
                         onClick={() => setNewProduct({ ...newProduct, images: [...newProduct.images, ''] })}
                         className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-burgundy-700 hover:text-burgundy-700 transition-colors"
                       >
                         + Add Image
                       </button>
                     )}
                   </div>
                 </div>

                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     Product Video URL (optional)
                   </label>
                   <input
                     type="url"
                     value={newProduct.video || ''}
                     onChange={(e) => setNewProduct({ ...newProduct, video: e.target.value })}
                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
                     placeholder="https://..."
                   />
                 </div>

                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     {selectedCategory === 'fragrances' ? 'Size Variations' : 'Color Variations'}
                   </label>
                   <div className="space-y-2">
                     {newProduct.variations.map((variation, index) => (
                       <div key={index} className="flex items-center space-x-2">
                         <input
                           type="text"
                           value={variation.size || variation.color || ''}
                           onChange={(e) => {
                             const updatedVariations = [...newProduct.variations];
                             const fieldName = selectedCategory === 'fragrances' ? 'size' : 'color';
                             updatedVariations[index] = { 
                               ...variation, 
                               [fieldName]: e.target.value 
                             };
                             setNewProduct({ ...newProduct, variations: updatedVariations });
                           }}
                           className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
                           placeholder={selectedCategory === 'fragrances' ? "e.g., 30ml, 50ml, 100ml" : "e.g., Red, Pink, Nude"}
                         />
                         <input
                           type="number"
                           value={variation.price || ''}
                           onChange={(e) => {
                             const updatedVariations = [...newProduct.variations];
                             updatedVariations[index] = { ...variation, price: parseInt(e.target.value) || 0 };
                             setNewProduct({ ...newProduct, variations: updatedVariations });
                           }}
                           className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
                           placeholder="Price"
                         />
                         <input
                           type="number"
                           value={variation.stock || ''}
                           onChange={(e) => {
                             const updatedVariations = [...newProduct.variations];
                             updatedVariations[index] = { ...variation, stock: parseInt(e.target.value) || 0 };
                             setNewProduct({ ...newProduct, variations: updatedVariations });
                           }}
                           className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
                           placeholder="Stock"
                         />
                         {newProduct.variations.length > 1 && (
                           <button
                             type="button"
                             onClick={() => {
                               const updatedVariations = newProduct.variations.filter((_, i) => i !== index);
                               setNewProduct({ ...newProduct, variations: updatedVariations });
                             }}
                             className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                             title="Remove variation"
                           >
                             <Trash2 size={18} />
                           </button>
                         )}
                       </div>
                     ))}
                     <button
                       type="button"
                       onClick={() => setNewProduct({ 
                         ...newProduct, 
                         variations: [...newProduct.variations, selectedCategory === 'fragrances' ? { size: '', price: '', stock: '' } : { color: '', price: '', stock: '' }] 
                       })}
                       className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-burgundy-700 hover:text-burgundy-700 transition-colors"
                     >
                       + Add {selectedCategory === 'fragrances' ? 'Size Variation' : 'Color Variation'}
                     </button>
                   </div>
                 </div>
              </div>

               <div className="flex items-center space-x-4">
                 <input
                   type="checkbox"
                   id="hasOffer"
                   checked={newProduct.hasOffer}
                   onChange={(e) => setNewProduct({ ...newProduct, hasOffer: e.target.checked })}
                   className="h-4 w-4 text-burgundy-700 focus:ring-burgundy-700 border-gray-300 rounded"
                 />
                 <label htmlFor="hasOffer" className="block text-sm text-gray-700">
                   This product has a special offer
                 </label>
               </div>

               {newProduct.hasOffer && (
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     Offer Percentage (%)
                   </label>
                   <input
                     type="number"
                     value={newProduct.offerPercentage}
                     onChange={(e) => setNewProduct({ ...newProduct, offerPercentage: e.target.value })}
                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
                     placeholder="e.g., 20"
                     min="1"
                     max="100"
                     required={newProduct.hasOffer}
                   />
                 </div>
               )}

               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                 <textarea
                   value={newProduct.description}
                   onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                   rows="3"
                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
                   placeholder={selectedCategory === 'fragrances' ? "Describe the fragrance..." : "Describe the cosmetic product..."}
                   required
                 ></textarea>
               </div>

               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   {selectedCategory === 'fragrances' ? 'Scent Notes' : 'Product Features'} (comma-separated)
                 </label>
                 <input
                   type="text"
                   value={newProduct.notes}
                   onChange={(e) => setNewProduct({ ...newProduct, notes: e.target.value })}
                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
                   placeholder={selectedCategory === 'fragrances' ? "e.g., Bergamot, Iris, Sandalwood, Amber" : "e.g., Waterproof, Long-lasting, Natural ingredients"}
                 />
               </div>

               <div className="flex items-center">
                 <input
                   type="checkbox"
                   id="featured"
                   checked={newProduct.featured}
                   onChange={(e) => setNewProduct({ ...newProduct, featured: e.target.checked })}
                   className="h-4 w-4 text-burgundy-700 focus:ring-burgundy-700 border-gray-300 rounded"
                 />
                 <label htmlFor="featured" className="ml-2 block text-sm text-gray-700">
                   Mark as Featured Product
                 </label>
               </div>

              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedCategory('');
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Back to Categories
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-burgundy-700 text-white rounded-lg hover:bg-burgundy-800 transition-colors"
                >
                  Add Product
                </button>
              </div>
            </form>
            )}
          </motion.div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && editingProduct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-serif font-bold text-gray-900">Edit Product</h2>
            </div>

            <form onSubmit={handleUpdateProduct} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     Product Name *
                   </label>
                   <input
                     type="text"
                     value={editingProduct.name}
                     onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
                     required
                   />
                 </div>

                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹) *</label>
                   <input
                     type="number"
                     value={editingProduct.price}
                     onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
                     required
                   />
                 </div>

                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     Stock Quantity *
                   </label>
                   <input
                     type="number"
                     value={editingProduct.stock}
                     onChange={(e) => setEditingProduct({ ...editingProduct, stock: e.target.value })}
                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
                     required
                   />
                 </div>

                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     Subcategory *
                   </label>
                   <select
                     value={editingProduct.subcategory || 'perfume'}
                     onChange={(e) => setEditingProduct({ ...editingProduct, subcategory: e.target.value })}
                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
                     required
                   >
                     <option value="">Select subcategory</option>
                     {(editingProduct.category === 'fragrance' || editingProduct.category === 'fragrances') ? (
                       <>
                         <option value="perfume">Perfume</option>
                         <option value="attar">Attar</option>
                         <option value="deodorant">Deodorant</option>
                         <option value="body-spray">Body Spray</option>
                       </>
                     ) : (
                       <>
                         <option value="lipstick">Lipstick</option>
                         <option value="kajal">Kajal</option>
                         <option value="mascara">Mascara</option>
                         <option value="lip-balm">Lip Balm</option>
                       </>
                     )}
                   </select>
                 </div>

                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     Product Images (up to 9 images)
                   </label>
                   <div className="space-y-3">
                     {(editingProduct.images || [editingProduct.image].filter(Boolean)).map((image, index) => (
                       <div key={index} className="flex items-center space-x-2">
                         <input
                           type="url"
                           value={image}
                           onChange={(e) => {
                             const currentImages = editingProduct.images || [editingProduct.image].filter(Boolean);
                             const updatedImages = [...currentImages];
                             updatedImages[index] = e.target.value;
                             setEditingProduct({ ...editingProduct, images: updatedImages });
                           }}
                           className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
                           placeholder={`Image ${index + 1} URL`}
                         />
                         {(editingProduct.images || [editingProduct.image]).length > 1 && (
                           <button
                             type="button"
                             onClick={() => {
                               const currentImages = editingProduct.images || [editingProduct.image].filter(Boolean);
                               const updatedImages = currentImages.filter((_, i) => i !== index);
                               setEditingProduct({ ...editingProduct, images: updatedImages });
                             }}
                             className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                             title="Remove image"
                           >
                             <Trash2 size={18} />
                           </button>
                         )}
                       </div>
                     ))}
                     {(editingProduct.images || [editingProduct.image]).length < 9 && (
                       <button
                         type="button"
                         onClick={() => {
                           const currentImages = editingProduct.images || [editingProduct.image].filter(Boolean);
                           setEditingProduct({ ...editingProduct, images: [...currentImages, ''] });
                         }}
                         className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-burgundy-700 hover:text-burgundy-700 transition-colors"
                       >
                         + Add Image
                       </button>
                     )}
                   </div>
                 </div>

                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     Product Video URL (optional)
                   </label>
                   <input
                     type="url"
                     value={editingProduct.video || ''}
                     onChange={(e) => setEditingProduct({ ...editingProduct, video: e.target.value })}
                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
                     placeholder="https://..."
                   />
                 </div>

                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     {(editingProduct.category === 'fragrance' || editingProduct.category === 'fragrances') ? 'Size Variations' : 'Color Variations'}
                   </label>
                   <div className="space-y-2">
                     {(editingProduct.variations || []).map((variation, index) => (
                       <div key={index} className="flex items-center space-x-2">
                         <input
                           type="text"
                           value={variation.size || variation.color || ''}
                           onChange={(e) => {
                             const currentVariations = editingProduct.variations || [];
                             const updatedVariations = [...currentVariations];
                             const fieldName = (editingProduct.category === 'fragrance' || editingProduct.category === 'fragrances') ? 'size' : 'color';
                             updatedVariations[index] = { 
                               ...variation, 
                               [fieldName]: e.target.value 
                             };
                             setEditingProduct({ ...editingProduct, variations: updatedVariations });
                           }}
                           className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
                           placeholder={(editingProduct.category === 'fragrance' || editingProduct.category === 'fragrances') ? "e.g., 30ml, 50ml, 100ml" : "e.g., Red, Pink, Nude"}
                         />
                         <input
                           type="number"
                           value={variation.price || ''}
                           onChange={(e) => {
                             const currentVariations = editingProduct.variations || [];
                             const updatedVariations = [...currentVariations];
                             updatedVariations[index] = { ...variation, price: parseInt(e.target.value) || 0 };
                             setEditingProduct({ ...editingProduct, variations: updatedVariations });
                           }}
                           className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
                           placeholder="Price"
                         />
                         <input
                           type="number"
                           value={variation.stock || ''}
                           onChange={(e) => {
                             const currentVariations = editingProduct.variations || [];
                             const updatedVariations = [...currentVariations];
                             updatedVariations[index] = { ...variation, stock: parseInt(e.target.value) || 0 };
                             setEditingProduct({ ...editingProduct, variations: updatedVariations });
                           }}
                           className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
                           placeholder="Stock"
                         />
                         {(editingProduct.variations || []).length > 1 && (
                           <button
                             type="button"
                             onClick={() => {
                               const currentVariations = editingProduct.variations || [];
                               const updatedVariations = currentVariations.filter((_, i) => i !== index);
                               setEditingProduct({ ...editingProduct, variations: updatedVariations });
                             }}
                             className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                             title="Remove variation"
                           >
                             <Trash2 size={18} />
                           </button>
                         )}
                       </div>
                     ))}
                     <button
                       type="button"
                       onClick={() => {
                         const currentVariations = editingProduct.variations || [];
                         const fieldName = (editingProduct.category === 'fragrance' || editingProduct.category === 'fragrances') ? 'size' : 'color';
                         const newVariation = {};
                         newVariation[fieldName] = '';
                         newVariation.price = '';
                         newVariation.stock = '';
                         setEditingProduct({ 
                           ...editingProduct, 
                           variations: [...currentVariations, newVariation] 
                         });
                       }}
                       className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-burgundy-700 hover:text-burgundy-700 transition-colors"
                     >
                       + Add {(editingProduct.category === 'fragrance' || editingProduct.category === 'fragrances') ? 'Size Variation' : 'Color Variation'}
                     </button>
                   </div>
                 </div>
              </div>

               <div className="flex items-center space-x-4">
                 <input
                   type="checkbox"
                   id="editHasOffer"
                   checked={editingProduct.hasOffer}
                   onChange={(e) => setEditingProduct({ ...editingProduct, hasOffer: e.target.checked })}
                   className="h-4 w-4 text-burgundy-700 focus:ring-burgundy-700 border-gray-300 rounded"
                 />
                 <label htmlFor="editHasOffer" className="block text-sm text-gray-700">
                   This product has a special offer
                 </label>
               </div>

               {editingProduct.hasOffer && (
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     Offer Percentage (%)
                   </label>
                   <input
                     type="number"
                     value={editingProduct.offerPercentage}
                     onChange={(e) => setEditingProduct({ ...editingProduct, offerPercentage: e.target.value })}
                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
                     min="1"
                     max="100"
                     required={editingProduct.hasOffer}
                   />
                 </div>
               )}

               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                 <textarea
                   value={editingProduct.description}
                   onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                   rows="3"
                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
                   required
                 ></textarea>
               </div>

               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   {(editingProduct.category === 'fragrance' || editingProduct.category === 'fragrances') ? 'Scent Notes' : 'Product Features'} (comma-separated)
                 </label>
                 <input
                   type="text"
                   value={editingProduct.notes}
                   onChange={(e) => setEditingProduct({ ...editingProduct, notes: e.target.value })}
                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
                   placeholder={(editingProduct.category === 'fragrance' || editingProduct.category === 'fragrances') ? "e.g., Bergamot, Iris, Sandalwood, Amber" : "e.g., Waterproof, Long-lasting, Natural ingredients"}
                 />
               </div>

               <div className="flex items-center">
                 <input
                   type="checkbox"
                   id="editFeatured"
                   checked={editingProduct.featured}
                   onChange={(e) => setEditingProduct({ ...editingProduct, featured: e.target.checked })}
                   className="h-4 w-4 text-burgundy-700 focus:ring-burgundy-700 border-gray-300 rounded"
                 />
                 <label htmlFor="editFeatured" className="ml-2 block text-sm text-gray-700">
                   Mark as Featured Product
                 </label>
               </div>

               <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                 <button
                   type="button"
                   onClick={() => {
                     setShowEditModal(false);
                     setEditingProduct(null);
                   }}
                   className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                 >
                   Cancel
                 </button>
                 <button
                   type="submit"
                   className="px-6 py-2 bg-burgundy-700 text-white rounded-lg hover:bg-burgundy-800 transition-colors"
                 >
                   Update Product
                 </button>
               </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Products;
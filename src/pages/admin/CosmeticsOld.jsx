import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Palette, Search, Download, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { getProducts, addProduct, updateProduct, deleteProduct, exportToCSV, parseCSV } from '../../utils/adminStorage';
import {
  getCurrentUserPermissions,
  hasPermission,
  PERMISSIONS,
} from '../../utils/permissions';

const Cosmetics = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cosmetics, setCosmetics] = useState([]);
  const [editingCosmetic, setEditingCosmetic] = useState(null);
  const [userPermissions, setUserPermissions] = useState([]);
  const [sortField, setSortField] = useState('name'); // name, price, stock
  const [sortDirection, setSortDirection] = useState('asc'); // asc, desc
  const [stockFilter, setStockFilter] = useState('all'); // all, in-stock, low-stock, out-of-stock
  const [categoryFilter, setCategoryFilter] = useState('all'); // all, lipstick, kajal, etc.
  const [selectedItems, setSelectedItems] = useState([]); // For selective export

  const [newCosmetic, setNewCosmetic] = useState({
    name: '',
    price: '',
    stock: '',
    category: 'cosmetic',
    subcategory: 'lipstick',
    customCategory: '',
    description: '',
    shade: '',
    colorHex: '#F5D7D3',
    finish: '',
    images: [],
    video: null,
    variations: [],
    featured: false,
    hasOffer: false,
    offerPercentage: '',
  });



  // Load cosmetics from localStorage on mount
  useEffect(() => {
    loadCosmetics();
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    const { permissions } = await getCurrentUserPermissions();
    setUserPermissions(permissions || []);
  };

  const loadCosmetics = () => {
    const allProducts = getProducts();
    const cosmeticProducts = allProducts.filter(p => p.category === 'cosmetic');
    setCosmetics(cosmeticProducts);
  };



  const handleAddCosmetic = (e) => {
    e.preventDefault();
    const cosmetic = {
      name: newCosmetic.name,
      price: parseInt(newCosmetic.price),
      stock: parseInt(newCosmetic.stock),
      category: 'cosmetic',
      subcategory: newCosmetic.subcategory === 'custom' ? newCosmetic.customCategory : newCosmetic.subcategory,
      description: newCosmetic.description,
      shade: newCosmetic.shade,
      colorHex: newCosmetic.colorHex,
      finish: newCosmetic.finish,
      images: newCosmetic.images.length > 0 ? newCosmetic.images : ['https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500&h=500&fit=crop'],
      video: newCosmetic.video,
      variations: newCosmetic.variations,
      featured: newCosmetic.featured,
      hasOffer: newCosmetic.hasOffer,
      offerPercentage: newCosmetic.hasOffer ? parseInt(newCosmetic.offerPercentage) : 0,
    };

    addProduct(cosmetic);
    loadCosmetics();

    setNewCosmetic({
      name: '',
      price: '',
      stock: '',
      category: 'cosmetic',
      subcategory: 'lipstick',
      customCategory: '',
      description: '',
      shade: '',
      colorHex: '#F5D7D3',
      finish: '',
      images: [],
      video: null,
      variations: [],
      featured: false,
      hasOffer: false,
      offerPercentage: '',
    });
    setShowAddModal(false);
  };

  const handleDeleteCosmetic = (id) => {
    if (window.confirm('Are you sure you want to delete this cosmetic product?')) {
      deleteProduct(id);
      loadCosmetics();
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

  const handleEditClick = (cosmetic) => {
    const standardCategories = ['lipstick', 'kajal', 'foundation', 'highlighter', 'blush', 'eyeshadow', 'mascara'];
    const isCustomCategory = !standardCategories.includes(cosmetic.subcategory);

    setEditingCosmetic({
      ...cosmetic,
      imageUrl: cosmetic.image || '',
      offerPercentage: cosmetic.offerPercentage || '',
      subcategory: isCustomCategory ? 'custom' : cosmetic.subcategory,
      customCategory: isCustomCategory ? cosmetic.subcategory : '',
    });
    setShowEditModal(true);
  };

  const handleUpdateCosmetic = (e) => {
    e.preventDefault();
    const updates = {
      name: editingCosmetic.name,
      price: parseInt(editingCosmetic.price),
      stock: parseInt(editingCosmetic.stock),
      subcategory: editingCosmetic.subcategory === 'custom' ? editingCosmetic.customCategory : editingCosmetic.subcategory,
      description: editingCosmetic.description,
      shade: editingCosmetic.shade,
      colorHex: editingCosmetic.colorHex,
      finish: editingCosmetic.finish,
      image: editingCosmetic.imageUrl || editingCosmetic.image,
      featured: editingCosmetic.featured,
      hasOffer: editingCosmetic.hasOffer,
      offerPercentage: editingCosmetic.hasOffer ? parseInt(editingCosmetic.offerPercentage) : 0,
    };

    updateProduct(editingCosmetic.id, updates);
    loadCosmetics();
    setShowEditModal(false);
    setEditingCosmetic(null);
  };

  const handleExportTemplate = () => {
    const template = [
      {
        name: 'Sample Cosmetic Name',
        price: 3500,
        stock: 50,
        subcategory: 'lipstick',
        description: 'Description of the cosmetic product',
        shade: 'Nude Pink',
        finish: 'Matte',
        image: 'https://example.com/image.jpg',
        featured: false,
        hasOffer: false,
        offerPercentage: 0,
      }
    ];
    exportToCSV(template, 'cosmetics_template');
    alert('Template downloaded! Fill in the details and upload using the Import button.');
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(filteredCosmetics.map(c => c.id));
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

  const handleExportAll = () => {
    if (cosmetics.length === 0) {
      alert('No cosmetics to export');
      return;
    }
    const exportData = cosmetics.map(c => ({
      name: c.name,
      price: c.price,
      stock: c.stock,
      subcategory: c.subcategory,
      description: c.description,
      shade: c.shade,
      colorHex: c.colorHex,
      finish: c.finish,
      image: c.image,
      featured: c.featured,
      hasOffer: c.hasOffer || false,
      offerPercentage: c.offerPercentage || 0,
    }));
    exportToCSV(exportData, 'cosmetics');
    alert(`Exported ${cosmetics.length} cosmetics successfully!`);
  };

  const handleExportSelected = () => {
    if (selectedItems.length === 0) {
      alert('Please select at least one cosmetic to export');
      return;
    }
    const selectedCosmetics = cosmetics.filter(c => selectedItems.includes(c.id));
    const exportData = selectedCosmetics.map(c => ({
      name: c.name,
      price: c.price,
      stock: c.stock,
      subcategory: c.subcategory,
      description: c.description,
      shade: c.shade,
      colorHex: c.colorHex,
      finish: c.finish,
      image: c.image,
      featured: c.featured,
      hasOffer: c.hasOffer || false,
      offerPercentage: c.offerPercentage || 0,
    }));
    exportToCSV(exportData, 'cosmetics_selected');
    alert(`${selectedItems.length} cosmetic(s) exported successfully!`);
    setSelectedItems([]);
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvData = parseCSV(e.target.result);
        const newCosmetics = csvData.map(item => ({
          name: item.name,
          price: Number(item.price),
          stock: Number(item.stock),
          category: 'cosmetic',
          subcategory: item.subcategory || 'lipstick',
          description: item.description,
          shade: item.shade || '',
          finish: item.finish || '',
          image: item.image || 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500&h=500&fit=crop',
          featured: item.featured === true || item.featured === 'true',
          hasOffer: item.hasOffer === true || item.hasOffer === 'true',
          offerPercentage: Number(item.offerPercentage) || 0,
        }));

        newCosmetics.forEach(cosmetic => addProduct(cosmetic));
        loadCosmetics();
        alert(`Successfully imported ${newCosmetics.length} cosmetics!`);
        event.target.value = ''; // Reset file input
      } catch (error) {
        alert('Error importing CSV. Please check the file format.');
        console.error(error);
      }
    };
    reader.readAsText(file);
  };

  const filteredCosmetics = cosmetics
    .filter((c) => {
      // Search query filter
      const matchesSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.shade && c.shade.toLowerCase().includes(searchQuery.toLowerCase()));

      // Stock filter
      const stock = c.totalStock || c.stock || 0;
      const matchesStock = stockFilter === 'all' ? true :
        stockFilter === 'out-of-stock' ? stock === 0 :
        stockFilter === 'low-stock' ? stock > 0 && stock < 20 :
        stockFilter === 'in-stock' ? stock >= 20 : true;

      // Category filter
      const matchesCategory = categoryFilter === 'all' ? true :
        c.subcategory === categoryFilter;

      return matchesSearch && matchesStock && matchesCategory;
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

  const getStockStatus = (stock, category, subcategory) => {
    if (stock === 0) return 'Out of Stock';
    
    // Use different thresholds for kajal products
    if (category === 'cosmetic' && subcategory === 'kajal') {
      if (stock < 5) return 'Low Stock';
    } else {
      // Default threshold for other cosmetics
      if (stock < 10) return 'Low Stock';
    }
    
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

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900">Cosmetics</h1>
          <p className="text-gray-600 mt-1">{cosmetics.length} products total</p>
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
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center space-x-2 bg-burgundy-700 text-white px-6 py-3 rounded-lg hover:bg-burgundy-800 transition-colors"
              >
                <Plus size={20} />
                <span>Add New Cosmetic</span>
              </button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search cosmetics by name or shade..."
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

        {/* Category Filter */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            <option value="lipstick">Lipstick</option>
            <option value="kajal">Kajal</option>
            <option value="foundation">Foundation</option>
            <option value="highlighter">Highlighter</option>
            <option value="blush">Blush</option>
            <option value="eyeshadow">Eyeshadow</option>
            <option value="mascara">Mascara</option>
          </select>
        </div>
      </div>

      {/* Cosmetics Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredCosmetics.length === 0 ? (
          <div className="text-center py-16">
            <Palette size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-xl text-gray-600">No cosmetics found.</p>
            <p className="text-sm text-gray-500 mt-2">Click "Add New Cosmetic" to create your first product.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === filteredCosmetics.length && filteredCosmetics.length > 0}
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
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Shade/Finish
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
                {filteredCosmetics.map((cosmetic) => (
                  <tr key={cosmetic.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(cosmetic.id)}
                        onChange={() => handleSelectItem(cosmetic.id)}
                        className="w-4 h-4 text-burgundy-600 rounded focus:ring-burgundy-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-12 w-12 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                          {cosmetic.image ? (
                            <img src={cosmetic.image} alt={cosmetic.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-burgundy-100">
                              <Palette className="text-burgundy-700" size={20} />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{cosmetic.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 capitalize">{cosmetic.subcategory || cosmetic.category}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-1">
                        {cosmetic.shade && (
                          <div className="flex items-center space-x-2">
                            {cosmetic.colorHex && (
                              <div
                                className="w-4 h-4 rounded-full border border-gray-300 flex-shrink-0"
                                style={{ backgroundColor: cosmetic.colorHex }}
                              ></div>
                            )}
                            <span className="text-xs px-2 py-1 bg-cream-100 text-gray-700 rounded inline-block">
                              {cosmetic.shade}
                            </span>
                          </div>
                        )}
                        {cosmetic.finish && (
                          <span className="text-xs px-2 py-1 bg-burgundy-100 text-burgundy-800 rounded inline-block">
                            {cosmetic.finish}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {cosmetic.variations && cosmetic.variations.length > 0 ? (
                        <div className="text-xs">
                          <span className="font-medium text-gray-900">₹{cosmetic.price.toLocaleString('en-IN')}</span>
                          <span className="text-gray-600"> (all shades)</span>
                        </div>
                      ) : (
                        <span className="text-sm font-medium text-gray-900">
                          ₹{cosmetic.price.toLocaleString('en-IN')}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {cosmetic.variations && cosmetic.variations.length > 0 ? (
                        <div className="space-y-1 max-w-xs">
                          {cosmetic.variations.slice(0, 3).map((variant) => (
                            <div key={variant.id} className="text-xs flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                {variant.colorHex && (
                                  <div
                                    className="w-3 h-3 rounded-full border border-gray-300"
                                    style={{ backgroundColor: variant.colorHex }}
                                  ></div>
                                )}
                                <span className="text-gray-600">{variant.shade}:</span>
                              </div>
                              <span className={`font-medium ${
                                variant.stock === 0 ? 'text-red-600' :
                                variant.stock < 20 ? 'text-yellow-600' :
                                'text-green-600'
                              }`}>
                                {variant.stock}
                              </span>
                            </div>
                          ))}
                          {cosmetic.variations.length > 3 && (
                            <div className="text-xs text-gray-500 italic">
                              +{cosmetic.variations.length - 3} more shades
                            </div>
                          )}
                          <div className="text-xs pt-1 border-t border-gray-200">
                            <span className="font-semibold text-gray-900">Total: {cosmetic.totalStock || 0}</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-600">{cosmetic.stock || 0} units</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          getStockStatus(cosmetic.totalStock || cosmetic.stock, cosmetic.category, cosmetic.subcategory) === 'Out of Stock'
                            ? 'bg-red-100 text-red-700'
                            : getStockStatus(cosmetic.totalStock || cosmetic.stock, cosmetic.category, cosmetic.subcategory) === 'Low Stock'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {getStockStatus(cosmetic.totalStock || cosmetic.stock, cosmetic.category, cosmetic.subcategory)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        {hasPermission(userPermissions, PERMISSIONS.EDIT_PRODUCTS) && (
                          <button
                            onClick={() => handleEditClick(cosmetic)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Edit cosmetic"
                          >
                            <Edit size={18} />
                          </button>
                        )}
                        {hasPermission(userPermissions, PERMISSIONS.DELETE_PRODUCTS) && (
                          <button
                            onClick={() => handleDeleteCosmetic(cosmetic.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete cosmetic"
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

      {/* Add New Cosmetic Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-serif font-bold text-gray-900">Add New Cosmetic</h2>
            </div>

            <form onSubmit={handleAddCosmetic} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={newCosmetic.name}
                    onChange={(e) => setNewCosmetic({ ...newCosmetic, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
                    placeholder="e.g., Luxe Lipstick"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select
                    value={newCosmetic.subcategory}
                    onChange={(e) => setNewCosmetic({ ...newCosmetic, subcategory: e.target.value, customCategory: '' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
                    required
                  >
                    <option value="lipstick">Lipstick</option>
                    <option value="kajal">Kajal</option>
                    <option value="foundation">Foundation</option>
                    <option value="highlighter">Highlighter</option>
                    <option value="blush">Blush</option>
                    <option value="eyeshadow">Eyeshadow</option>
                    <option value="mascara">Mascara</option>
                    <option value="custom">Other (Custom)</option>
                  </select>
                </div>

                 {newCosmetic.subcategory === 'custom' && (
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                       Custom Category Name *
                     </label>
                     <input
                       type="text"
                       value={newCosmetic.customCategory}
                       onChange={(e) => setNewCosmetic({ ...newCosmetic, customCategory: e.target.value })}
                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
                       placeholder="e.g., Primer, Concealer, Bronzer"
                       required
                     />
                   </div>
                 )}

                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                   <textarea
                     value={newCosmetic.description}
                     onChange={(e) => setNewCosmetic({ ...newCosmetic, description: e.target.value })}
                     rows="3"
                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
                     placeholder="Describe product..."
                   ></textarea>
                 </div>
               </div>

               <div className="flex items-center">
                <input
                  type="checkbox"
                  id="featured"
                  checked={newCosmetic.featured}
                  onChange={(e) => setNewCosmetic({ ...newCosmetic, featured: e.target.checked })}
                  className="h-4 w-4 text-burgundy-700 focus:ring-burgundy-700 border-gray-300 rounded"
                />
                <label htmlFor="featured" className="ml-2 block text-sm text-gray-700">
                  Mark as Featured Product
                </label>
              </div>

              <div className="flex items-center space-x-4">
                <input
                  type="checkbox"
                  id="hasOffer"
                  checked={newCosmetic.hasOffer}
                  onChange={(e) => setNewCosmetic({ ...newCosmetic, hasOffer: e.target.checked })}
                  className="h-4 w-4 text-burgundy-700 focus:ring-burgundy-700 border-gray-300 rounded"
                />
                <label htmlFor="hasOffer" className="block text-sm text-gray-700">
                  This product has a special offer
                </label>
              </div>

              {newCosmetic.hasOffer && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Offer Percentage (%)
                  </label>
                  <input
                    type="number"
                    value={newCosmetic.offerPercentage}
                    onChange={(e) => setNewCosmetic({ ...newCosmetic, offerPercentage: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
                    placeholder="e.g., 20"
                    min="1"
                    max="100"
                    required={newCosmetic.hasOffer}
                  />
                </div>
              )}

              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-burgundy-700 text-white rounded-lg hover:bg-burgundy-800 transition-colors"
                >
                  Add Cosmetic
              </button>
               </div>
             </form>
          </motion.div>
        </div>
      )}

      {/* Edit Cosmetic Modal */}
      {showEditModal && editingCosmetic && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-serif font-bold text-gray-900">Edit Cosmetic</h2>
            </div>

            <form onSubmit={handleUpdateCosmetic} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">


                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select
                    value={editingCosmetic.subcategory}
                    onChange={(e) => setEditingCosmetic({ ...editingCosmetic, subcategory: e.target.value, customCategory: '' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
                    required
                  >
                    <option value="lipstick">Lipstick</option>
                    <option value="kajal">Kajal</option>
                    <option value="foundation">Foundation</option>
                    <option value="highlighter">Highlighter</option>
                    <option value="blush">Blush</option>
                    <option value="eyeshadow">Eyeshadow</option>
                    <option value="mascara">Mascara</option>
                    <option value="custom">Other (Custom)</option>
                  </select>
                </div>

                {editingCosmetic.subcategory === 'custom' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Custom Category Name *
                    </label>
                    <input
                      type="text"
                      value={editingCosmetic.customCategory}
                      onChange={(e) => setEditingCosmetic({ ...editingCosmetic, customCategory: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
                      placeholder="e.g., Primer, Concealer, Bronzer"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹) *</label>
                  <input
                    type="number"
                    value={editingCosmetic.price}
                    onChange={(e) => setEditingCosmetic({ ...editingCosmetic, price: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
                    required
                  />
                </div>

                  <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     Image URL or Upload Images (Max 9 files)
                   </label>
                   <input
                     type="file"
                     multiple
                     accept="image/*,video/*"
                     onChange={(e) => {
                       const files = Array.from(e.target.files).slice(0, 9);
                       const newImages = files.map(file => ({
                         url: URL.createObjectURL(file),
                         name: file.name,
                         type: file.type
                       }));
                       setNewCosmetic(prev => ({
                         ...prev,
                         images: newImages
                       }));
                     }}
                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
                   />
                   {newCosmetic.images.length > 0 && (
                     <div className="mt-2 grid grid-cols-3 gap-2">
                       {newCosmetic.images.map((img, index) => (
                         <div key={index} className="relative">
                           <img src={img.url} alt={`Preview ${index + 1}`} className="w-full h-20 object-cover rounded-md" />
                           <button
                             type="button"
                             onClick={() => setNewCosmetic(prev => ({
                               ...prev,
                               images: prev.images.filter((_, i) => i !== index)
                             }))}
                             className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 hover:opacity-100 transition-opacity"
                           >
                             <X size={12} />
                           </button>
                         </div>
                       ))}
                     </div>
                   )}
                 </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shade/Color
                  </label>
                  <input
                    type="text"
                    value={editingCosmetic.shade}
                    onChange={(e) => setEditingCosmetic({ ...editingCosmetic, shade: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent mb-2"
                  />
                  <div className="flex items-center space-x-3 mt-2">
                    <label className="text-sm font-medium text-gray-700">Color:</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={editingCosmetic.colorHex || '#F5D7D3'}
                        onChange={(e) => setEditingCosmetic({ ...editingCosmetic, colorHex: e.target.value })}
                        className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={editingCosmetic.colorHex || '#F5D7D3'}
                        onChange={(e) => setEditingCosmetic({ ...editingCosmetic, colorHex: e.target.value })}
                        placeholder="#FFFFFF"
                        className="w-28 px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                       <div
                         className="w-10 h-10 rounded border border-gray-300"
                         style={{ backgroundColor: editingCosmetic.colorHex || '#F5D7D3' }}
                       ></div>
                       <div
                         className="w-10 h-10 rounded border border-gray-300"
                         style={{ backgroundColor: editingCosmetic.colorHex || '#F5D7D3' }}
                       ></div>
                     </div>
                   </div>
                  </div>

                 <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Finish
                  </label>
                  <input
                    type="text"
                    value={editingCosmetic.finish}
                    onChange={(e) => setEditingCosmetic({ ...editingCosmetic, finish: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={editingCosmetic.imageUrl}
                    onChange={(e) => setEditingCosmetic({ ...editingCosmetic, imageUrl: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                   <textarea
                    value={editingCosmetic.description}
                    onChange={(e) => setEditingCosmetic({ ...editingCosmetic, description: e.target.value })}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
                    required
                 ></textarea>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="editFeatured"
                  checked={editingCosmetic.featured}
                  onChange={(e) => setEditingCosmetic({ ...editingCosmetic, featured: e.target.checked })}
                  className="h-4 w-4 text-burgundy-700 focus:ring-burgundy-700 border-gray-300 rounded"
                />
                <label htmlFor="editFeatured" className="ml-2 block text-sm text-gray-700">
                  Mark as Featured Product
                </label>
              </div>

              <div className="flex items-center space-x-4">
                <input
                  type="checkbox"
                  id="editHasOffer"
                  checked={editingCosmetic.hasOffer}
                  onChange={(e) => setEditingCosmetic({ ...editingCosmetic, hasOffer: e.target.checked })}
                  className="h-4 w-4 text-burgundy-700 focus:ring-burgundy-700 border-gray-300 rounded"
                />
                <label htmlFor="editHasOffer" className="block text-sm text-gray-700">
                  This product has a special offer
                </label>
              </div>

              {editingCosmetic.hasOffer && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Offer Percentage (%)
                  </label>
                  <input
                    type="number"
                    value={editingCosmetic.offerPercentage}
                    onChange={(e) => setEditingCosmetic({ ...editingCosmetic, offerPercentage: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
                    min="1"
                    max="100"
                    required={editingCosmetic.hasOffer}
                  />
                </div>
              )}

              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingCosmetic(null);
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-burgundy-700 text-white rounded-lg hover:bg-burgundy-800 transition-colors"
                >
                  Update Cosmetic
              </button>
               </div>
             </form>
          </motion.div>
         </div>
      )}
    </div>
  );
};

export default Cosmetics;
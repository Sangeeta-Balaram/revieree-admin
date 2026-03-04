import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Heart, ShoppingCart, Search } from 'lucide-react';
import { getProductsByCategory } from '../utils/storage';
import { addToCart, addToWishlist, isInWishlist } from '../utils/cart';
import VintageOrnament from '../components/VintageOrnament';

const ProductsPage = () => {
  const { category } = useParams();
  const products = useState(() => {
    const categoryType = category === 'fragrances' ? 'fragrance' : 'cosmetic';
    return getProductsByCategory(categoryType);
  })[0];
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [wishlistItems, setWishlistItems] = useState(() => {
    const categoryType = category === 'fragrances' ? 'fragrance' : 'cosmetic';
    const fetchedProducts = getProductsByCategory(categoryType);
    
    // Load wishlist status for all products
    const wishlistSet = new Set();
    fetchedProducts.forEach(product => {
      if (isInWishlist(product.id)) {
        wishlistSet.add(product.id);
      }
    });
    return wishlistSet;
  });

  const handleAddToCart = (product, variation = null) => {
    const productToAdd = variation ? { ...product, selectedVariation: variation, price: variation.price } : product;
    addToCart(productToAdd);
    alert(`${product.name}${variation ? ` (${variation.size || variation.color})` : ''} added to cart!`);
  };

  const handleToggleWishlist = (product) => {
    if (wishlistItems.has(product.id)) {
      // Already in wishlist - would need to remove (you can implement removeFromWishlist)
      alert(`${product.name} is already in your wishlist!`);
    } else {
      addToWishlist(product);
      setWishlistItems(new Set([...wishlistItems, product.id]));
      alert(`${product.name} added to wishlist!`);
    }
  };

  const filteredProducts = products
    .filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

  const pageTitle = category === 'fragrances' ? 'Fragrances' : 'Cosmetics';
  const pageDescription = category === 'fragrances'
    ? 'Discover our exquisite collection of luxury fragrances'
    : 'Explore our range of premium cosmetics';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Header */}
      <section className="section-padding bg-gradient-to-br from-cream-50 to-burgundy-50 relative overflow-hidden">
        {/* Boho elements */}
        <div className="absolute top-10 right-10 text-cream-400 opacity-65 hidden md:block">
          <VintageOrnament type="sunburst" className="w-28 h-28" />
        </div>
        <div className="absolute bottom-8 left-16 text-cream-400 opacity-65 hidden md:block">
          <VintageOrnament type="leafBranch" className="w-20 h-28" />
        </div>
        <div className="absolute top-1/2 right-24 text-cream-400 opacity-65 hidden lg:block">
          <VintageOrnament type="arch" className="w-24 h-16" />
        </div>

        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-gray-900 mb-4">
              {pageTitle}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {pageDescription}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters & Search */}
      <section className="section-padding bg-white border-b">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-burgundy-700 focus:outline-none transition-colors"
              />
            </div>

            {/* Sort */}
            <div className="flex items-center space-x-4">
              <label className="text-gray-700 font-medium">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-burgundy-700 focus:outline-none transition-colors"
              >
                <option value="featured">Featured</option>
                <option value="name">Name</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          <div className="mt-4 text-gray-600">
            Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-xl text-gray-600">No products found.</p>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            >
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  variants={itemVariants}
                  whileHover={{ y: -8 }}
                  className="group"
                >
                  <div className="relative overflow-hidden rounded-lg shadow-md hover:shadow-2xl transition-shadow duration-300">
                    {/* Image Gallery */}
                    <div className="relative h-80">
                      {product.images && product.images.length > 0 ? (
                        <div className="relative h-full">
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                          {product.images.length > 1 && (
                            <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                              +{product.images.length - 1}
                            </div>
                          )}
                        </div>
                      ) : (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      )}
                      {product.video && (
                        <div className="absolute bottom-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
                          📹 Video
                        </div>
                      )}
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-4">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleToggleWishlist(product)}
                        className={`p-3 rounded-full transition-colors ${
                          wishlistItems.has(product.id)
                            ? 'bg-burgundy-700 text-white'
                            : 'bg-white hover:bg-burgundy-700 hover:text-white'
                        }`}
                      >
                        <Heart size={20} fill={wishlistItems.has(product.id) ? 'currentColor' : 'none'} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleAddToCart(product)}
                        className="p-3 bg-white rounded-full hover:bg-burgundy-700 hover:text-white transition-colors"
                      >
                        <ShoppingCart size={20} />
                      </motion.button>
                    </div>

                    {/* Featured Badge */}
                    {product.featured && (
                      <div className="absolute top-4 left-4 px-3 py-1 bg-burgundy-700 text-white text-xs font-semibold rounded-full">
                        Featured
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="mt-4">
                    <h3 className="font-semibold text-lg text-gray-900 mb-1 group-hover:text-burgundy-700 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {product.description}
                    </p>

                    {/* Product Details */}
                    {category === 'fragrances' && product.notes && (
                      <div className="mb-2">
                        <p className="text-xs text-gray-500">
                          Notes: {product.notes.join(', ')}
                        </p>
                      </div>
                    )}

                    {category === 'cosmetics' && (
                      <div className="mb-2 flex items-center space-x-2">
                        {product.shade && (
                          <span className="text-xs px-2 py-1 bg-cream-100 text-gray-700 rounded">
                            {product.shade}
                          </span>
                        )}
                        {product.finish && (
                          <span className="text-xs px-2 py-1 bg-burgundy-100 text-burgundy-800 rounded">
                            {product.finish}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Variations Display */}
                    {product.variations && product.variations.length > 0 && (
                      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">Select {category === 'fragrances' ? 'Size' : 'Color'}:</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {product.variations.map((variation, index) => (
                            <button
                              key={index}
                              onClick={() => handleAddToCart(product, variation)}
                              className="p-3 border-2 border-gray-200 rounded-lg hover:border-burgundy-700 hover:bg-burgundy-50 transition-colors text-left"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-900">
                                  {category === 'fragrances' ? variation.size : variation.color}
                                </span>
                                <span className="text-burgundy-700 font-bold">
                                  ₹{(variation.price || 0).toLocaleString('en-IN')}
                                </span>
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {variation.stock} in stock
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-burgundy-700">
                        {category === 'fragrances' ? '₹' : '₹'}
                        {(product.price || 0).toLocaleString('en-IN')}
                      </span>
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="px-4 py-2 bg-burgundy-700 text-white text-sm rounded hover:bg-burgundy-800 transition-colors"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ProductsPage;
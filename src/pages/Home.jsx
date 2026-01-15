import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Gift, Newspaper } from 'lucide-react';
import AIProductFinder from '../components/AIProductFinder';
import VintageOrnament from '../components/VintageOrnament';
import { getFeaturedProducts } from '../utils/storage';
import oldMoneyImg from '../assets/images/perfumes/old-money.jpeg';
import gangstaImg from '../assets/images/perfumes/gangsta.jpeg';

const Home = () => {
  const [showAIFinder, setShowAIFinder] = useState(false);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterMessage, setNewsletterMessage] = useState('');

  useEffect(() => {
    setFeaturedProducts(getFeaturedProducts());
  }, []);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    setNewsletterMessage('Thank you for subscribing!');
    setNewsletterEmail('');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-cream-50">
        {/* Background */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-cream-100/50 via-transparent to-burgundy-50/30" />

          {/* Boho decorative elements */}
          <div className="absolute top-20 right-16 text-cream-400 opacity-65 animate-float hidden md:block">
            <VintageOrnament type="vase" className="w-20 h-28" />
          </div>

          <div className="absolute bottom-32 left-12 text-cream-400 opacity-65 hidden md:block">
            <VintageOrnament type="leafBranch" className="w-24 h-32" />
          </div>

          <div className="absolute top-1/3 left-24 text-cream-400 opacity-65 hidden lg:block">
            <VintageOrnament type="moon" className="w-24 h-24" />
          </div>

          <div className="absolute top-1/4 right-32 text-cream-400 opacity-65 hidden lg:block">
            <VintageOrnament type="sun" className="w-24 h-24" />
          </div>

          <div className="absolute bottom-1/4 right-20 text-cream-400 opacity-65 hidden md:block">
            <VintageOrnament type="rainbow" className="w-28 h-20" />
          </div>

          <div className="absolute top-2/3 left-16 text-cream-400 opacity-65 hidden lg:block">
            <VintageOrnament type="dots" className="w-20 h-20" />
          </div>

          <div className="absolute bottom-1/2 right-1/4 text-cream-400 opacity-65 hidden xl:block">
            <VintageOrnament type="stars" className="w-20 h-20" />
          </div>
        </div>

        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-block mb-6"
            >
              <span className="px-4 py-2 bg-burgundy-100 text-burgundy-800 rounded-full text-sm font-medium">
                Luxury Redefined
              </span>
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-serif font-bold text-gray-900 mb-6">
              Discover Your
              <span className="block text-burgundy-700 mt-2">Signature Elegance</span>
            </h1>

            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
              Curated fragrances and cosmetics that tell your unique story.
              Experience luxury crafted with passion and sophistication.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => setShowAIFinder(true)}
                className="btn-primary flex items-center space-x-2 group"
              >
                <Sparkles size={20} />
                <span>Find My Perfect Product</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>

              <Link to="/products/fragrances" className="btn-secondary">
                Shop Collection
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-burgundy-700 rounded-full flex items-start justify-center p-2">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-1.5 h-1.5 bg-burgundy-700 rounded-full"
            />
          </div>
        </motion.div>
      </section>

      {/* Featured Products */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
          >
            <motion.div variants={itemVariants} className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">
                Featured Collection
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Handpicked selections that embody timeless elegance and modern sophistication
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  variants={itemVariants}
                  whileHover={{ y: -10 }}
                  className="group"
                >
                  <div className="relative overflow-hidden rounded-lg shadow-lg">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                      <p className="text-sm mb-4">{product.description}</p>
                      <Link
                        to={`/products/${product.category === 'fragrance' ? 'fragrances' : 'cosmetics'}`}
                        className="inline-flex items-center space-x-2 text-sm font-medium"
                      >
                        <span>View Details</span>
                        <ArrowRight size={16} />
                      </Link>
                    </div>
                  </div>
                  <div className="mt-4">
                    <h3 className="font-semibold text-lg text-gray-900">{product.name}</h3>
                    <p className="text-burgundy-700 font-bold text-xl">₹{(product.price || 0).toLocaleString('en-IN')}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div variants={itemVariants} className="text-center mt-12">
              <Link to="/products/fragrances" className="btn-primary">
                Explore All Products
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="section-padding bg-cream-50">
        <div className="container-custom">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            <motion.div variants={itemVariants}>
              <Link to="/products/fragrances" className="group block">
                <div className="relative h-96 rounded-lg overflow-hidden shadow-xl">
                  <img
                    src={oldMoneyImg}
                    alt="Fragrances"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-burgundy-900/80 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                    <h3 className="text-3xl font-serif font-bold mb-2">Fragrances</h3>
                    <p className="mb-4">Discover your signature scent</p>
                    <span className="inline-flex items-center space-x-2 font-medium group-hover:translate-x-2 transition-transform">
                      <span>Explore Collection</span>
                      <ArrowRight size={20} />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Link to="/products/cosmetics" className="group block">
                <div className="relative h-96 rounded-lg overflow-hidden shadow-xl">
                  <img
                    src="https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&h=600&fit=crop"
                    alt="Cosmetics"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-burgundy-900/80 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                    <h3 className="text-3xl font-serif font-bold mb-2">Cosmetics</h3>
                    <p className="mb-4">Find your perfect shade</p>
                    <span className="inline-flex items-center space-x-2 font-medium group-hover:translate-x-2 transition-transform">
                      <span>Explore Collection</span>
                      <ArrowRight size={20} />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="section-padding bg-white relative overflow-hidden">
        <div className="absolute top-20 right-24 text-cream-400 opacity-65 hidden md:block">
          <VintageOrnament type="hand" className="w-24 h-24" />
        </div>
        <div className="absolute bottom-16 left-20 text-cream-400 opacity-65 hidden md:block">
          <VintageOrnament type="crystal" className="w-20 h-24" />
        </div>

        <div className="container-custom relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="max-w-4xl mx-auto text-center"
          >
            <motion.div variants={itemVariants}>
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6">
                Our Story
              </h2>
              <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                Revieree was born from a simple belief: that luxury should be an experience, not just a product.
                We curate the finest fragrances and cosmetics to help you discover your signature elegance.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                From the bold confidence of "Gangsta" to the timeless sophistication of "Old Money,"
                every scent is crafted to evoke emotions and create memories. We believe that true luxury
                lies in the details—the quality of ingredients, the artistry of composition, and the
                experience of wearing something that feels uniquely yours.
              </p>
              <Link to="/about" className="btn-primary">
                Read Full Story
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Sections */}
      <section className="section-padding bg-cream-50">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-br from-burgundy-700 to-burgundy-900 text-white rounded-2xl p-8 md:p-12"
            >
              <Gift size={48} className="mb-6" />
              <h3 className="text-3xl font-serif font-bold mb-4">
                Luxury Gift Sets
              </h3>
              <p className="mb-6 opacity-90">
                Curated gift collections for every special occasion. Elegantly packaged, beautifully presented.
              </p>
              <Link to="/gifting" className="inline-flex items-center space-x-2 font-medium hover:translate-x-2 transition-transform">
                <span>Explore Gifts</span>
                <ArrowRight size={20} />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-cream-100 rounded-2xl p-8 md:p-12"
            >
              <Newspaper size={48} className="text-burgundy-700 mb-6" />
              <h3 className="text-3xl font-serif font-bold mb-4 text-gray-900">
                Latest Stories
              </h3>
              <p className="mb-6 text-gray-600">
                Tips, trends, and insights from the world of luxury beauty and fragrances.
              </p>
              <Link to="/blogs" className="inline-flex items-center space-x-2 font-medium text-burgundy-700 hover:translate-x-2 transition-transform">
                <span>Read Our Blog</span>
                <ArrowRight size={20} />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Email Subscription Section */}
      <section className="section-padding bg-gradient-to-br from-burgundy-700 to-burgundy-900 relative overflow-hidden">
        <div className="absolute top-10 right-10 text-white opacity-10 hidden md:block">
          <VintageOrnament type="heart" className="w-32 h-32" />
        </div>
        <div className="absolute bottom-10 left-10 text-white opacity-10 hidden md:block">
          <VintageOrnament type="moon" className="w-32 h-32" />
        </div>

        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">
              Stay in the Know
            </h2>
            <p className="text-white/90 text-lg mb-8">
              Subscribe to receive exclusive offers, new product launches, and beauty tips delivered straight to your inbox.
            </p>

            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="flex-1 px-6 py-4 rounded-lg focus:ring-2 focus:ring-white focus:outline-none"
                required
              />
              <button
                type="submit"
                className="px-8 py-4 bg-white text-burgundy-700 rounded-lg font-semibold hover:bg-cream-50 transition-colors whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>

            {newsletterMessage && (
              <p className="text-white text-sm mt-4 font-medium">
                {newsletterMessage}
              </p>
            )}

            <p className="text-white/70 text-sm mt-4">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </motion.div>
        </div>
      </section>

      {/* AI Product Finder Modal */}
      <AIProductFinder isOpen={showAIFinder} onClose={() => setShowAIFinder(false)} />
    </div>
  );
};

export default Home;
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, User, ArrowRight, Search } from 'lucide-react';
import { getBlogs } from '../utils/storage';
import VintageOrnament from '../components/VintageOrnament';

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    // Only show published blogs on the website
    const allBlogs = getBlogs();
    const publishedBlogs = allBlogs.filter(blog => blog.status === 'Published');
    setBlogs(publishedBlogs);
  }, []);

  const categories = ['all', ...new Set(blogs.map(blog => blog.category))];

  const filteredBlogs = blogs
    .filter(blog =>
      (selectedCategory === 'all' || blog.category === selectedCategory) &&
      (blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
       blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => new Date(b.date) - new Date(a.date));

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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Hero Section */}
      <section className="section-padding bg-gradient-to-br from-cream-50 to-burgundy-50 relative overflow-hidden">
        {/* Boho decorative elements */}
        <div className="absolute top-12 right-16 text-cream-400 opacity-65 hidden md:block">
          <VintageOrnament type="cloud" className="w-28 h-16" />
        </div>
        <div className="absolute bottom-12 left-12 text-cream-400 opacity-65 hidden md:block">
          <VintageOrnament type="leafBranch" className="w-20 h-28" />
        </div>
        <div className="absolute top-1/2 left-1/4 text-cream-400 opacity-65 hidden lg:block">
          <VintageOrnament type="dots" className="w-20 h-20" />
        </div>

        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-gray-900 mb-4">
              News & Insights
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover beauty tips, fragrance guides, and the latest from Revieree
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search & Filter */}
      <section className="section-padding bg-white border-b">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-burgundy-700 focus:outline-none transition-colors"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center space-x-2 overflow-x-auto">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
                    selectedCategory === category
                      ? 'bg-burgundy-700 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          {filteredBlogs.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-xl text-gray-600">No articles found.</p>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Featured Post (First Post) */}
              {filteredBlogs.length > 0 && (
                <motion.div variants={itemVariants} className="mb-12">
                  <Link to={`/blogs/${filteredBlogs[0].id}`} className="group">
                    <div className="grid md:grid-cols-2 gap-8 bg-cream-50 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300">
                      <div className="relative h-96 md:h-auto overflow-hidden">
                        <img
                          src={filteredBlogs[0].image}
                          alt={filteredBlogs[0].title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute top-4 left-4 px-3 py-1 bg-burgundy-700 text-white text-sm font-semibold rounded-full">
                          Featured
                        </div>
                      </div>

                      <div className="p-8 flex flex-col justify-center">
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                          <span className="flex items-center space-x-1">
                            <Calendar size={16} />
                            <span>{formatDate(filteredBlogs[0].date)}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <User size={16} />
                            <span>{filteredBlogs[0].author}</span>
                          </span>
                        </div>

                        <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4 group-hover:text-burgundy-700 transition-colors">
                          {filteredBlogs[0].title}
                        </h2>

                        <p className="text-gray-600 mb-6 text-lg">
                          {filteredBlogs[0].excerpt}
                        </p>

                        <div className="inline-flex items-center space-x-2 text-burgundy-700 font-medium group-hover:translate-x-2 transition-transform">
                          <span>Read More</span>
                          <ArrowRight size={20} />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )}

              {/* Rest of Posts */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredBlogs.slice(1).map((blog) => (
                  <motion.div
                    key={blog.id}
                    variants={itemVariants}
                    whileHover={{ y: -8 }}
                  >
                    <Link to={`/blogs/${blog.id}`} className="group block">
                      <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
                        <div className="relative h-56 overflow-hidden">
                          <img
                            src={blog.image}
                            alt={blog.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-sm text-burgundy-700 text-xs font-medium rounded-full">
                            {blog.category}
                          </div>
                        </div>

                        <div className="p-6">
                          <div className="flex items-center space-x-3 text-xs text-gray-500 mb-3">
                            <span className="flex items-center space-x-1">
                              <Calendar size={14} />
                              <span>{formatDate(blog.date)}</span>
                            </span>
                            <span>•</span>
                            <span>{blog.author}</span>
                          </div>

                          <h3 className="text-xl font-serif font-bold text-gray-900 mb-2 group-hover:text-burgundy-700 transition-colors line-clamp-2">
                            {blog.title}
                          </h3>

                          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                            {blog.excerpt}
                          </p>

                          <div className="flex items-center space-x-2 text-burgundy-700 text-sm font-medium group-hover:translate-x-2 transition-transform">
                            <span>Read Article</span>
                            <ArrowRight size={16} />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="section-padding bg-gradient-to-br from-burgundy-700 to-burgundy-900 text-white">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
              Stay Inspired
            </h2>
            <p className="text-lg opacity-90 mb-8">
              Subscribe to our newsletter for beauty tips, exclusive offers, and the latest news
            </p>

            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button className="px-8 py-3 bg-white text-burgundy-700 font-semibold rounded-lg hover:bg-cream-50 transition-colors">
                Subscribe
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Blogs;
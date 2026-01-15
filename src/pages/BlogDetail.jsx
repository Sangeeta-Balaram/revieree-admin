import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, User, ArrowLeft, Share2, Heart } from 'lucide-react';
import { getBlogById, getBlogs } from '../utils/storage';

const BlogDetail = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);

  useEffect(() => {
    const fetchedBlog = getBlogById(id);

    // Only show published blogs on the website
    if (fetchedBlog && fetchedBlog.status === 'Published') {
      setBlog(fetchedBlog);

      const allBlogs = getBlogs();
      const related = allBlogs
        .filter(b => b.id !== parseInt(id) && b.category === fetchedBlog.category && b.status === 'Published')
        .slice(0, 3);
      setRelatedBlogs(related);
    } else {
      setBlog(null);
    }
  }, [id]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!blog) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">
            Article not found
          </h2>
          <Link to="/blogs" className="text-burgundy-700 hover:underline">
            Back to all articles
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Back Button */}
      <div className="container-custom py-6">
        <Link
          to="/blogs"
          className="inline-flex items-center space-x-2 text-burgundy-700 hover:text-burgundy-800 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Articles</span>
        </Link>
      </div>

      {/* Hero Image */}
      <section className="container-custom mb-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative h-96 md:h-[500px] rounded-2xl overflow-hidden shadow-2xl"
        >
          <img
            src={blog.image}
            alt={blog.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 text-white">
            <span className="inline-block px-3 py-1 bg-burgundy-700 text-sm font-semibold rounded-full mb-4">
              {blog.category}
            </span>
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
              {blog.title}
            </h1>
            <div className="flex items-center space-x-6 text-sm">
              <span className="flex items-center space-x-2">
                <Calendar size={16} />
                <span>{formatDate(blog.date)}</span>
              </span>
              <span className="flex items-center space-x-2">
                <User size={16} />
                <span>{blog.author}</span>
              </span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Article Content */}
      <section className="container-custom">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Share & Like */}
            <div className="flex items-center justify-between mb-8 pb-8 border-b">
              <div className="flex items-center space-x-4">
                <button className="flex items-center space-x-2 px-4 py-2 bg-burgundy-100 text-burgundy-700 rounded-lg hover:bg-burgundy-200 transition-colors">
                  <Heart size={18} />
                  <span className="text-sm font-medium">Like</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                  <Share2 size={18} />
                  <span className="text-sm font-medium">Share</span>
                </button>
              </div>
              <span className="text-sm text-gray-500">5 min read</span>
            </div>

            {/* Article Text */}
            <div className="prose prose-lg max-w-none">
              <p className="text-xl text-gray-700 leading-relaxed mb-6">
                {blog.excerpt}
              </p>

              <div className="text-gray-700 leading-relaxed space-y-6">
                <p>{blog.content}</p>

                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
                  tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
                  quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
                  consequat.
                </p>

                <h2 className="text-2xl font-serif font-bold text-gray-900 mt-8 mb-4">
                  Understanding the Basics
                </h2>

                <p>
                  Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore
                  eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident,
                  sunt in culpa qui officia deserunt mollit anim id est laborum.
                </p>

                <blockquote className="border-l-4 border-burgundy-700 pl-6 my-8 italic text-gray-600">
                  "Luxury is in each detail, in every scent that tells a story, in every shade
                  that enhances your natural beauty."
                </blockquote>

                <h2 className="text-2xl font-serif font-bold text-gray-900 mt-8 mb-4">
                  Expert Tips & Techniques
                </h2>

                <p>
                  Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium
                  doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore
                  veritatis et quasi architecto beatae vitae dicta sunt explicabo.
                </p>

                <ul className="list-disc list-inside space-y-2 my-6">
                  <li>Choose fragrances that complement your natural scent</li>
                  <li>Apply perfume to pulse points for longer lasting effect</li>
                  <li>Layer different products for a unique signature scent</li>
                  <li>Store fragrances in cool, dark places to preserve quality</li>
                </ul>

                <p>
                  Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit,
                  sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
                  Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur,
                  adipisci velit.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Related Articles */}
      {relatedBlogs.length > 0 && (
        <section className="section-padding bg-cream-50 mt-16">
          <div className="container-custom">
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-8">
              Related Articles
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedBlogs.map((relatedBlog) => (
                <motion.div
                  key={relatedBlog.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -8 }}
                >
                  <Link to={`/blogs/${relatedBlog.id}`} className="group block">
                    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={relatedBlog.image}
                          alt={relatedBlog.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>

                      <div className="p-6">
                        <h3 className="text-lg font-serif font-bold text-gray-900 mb-2 group-hover:text-burgundy-700 transition-colors line-clamp-2">
                          {relatedBlog.title}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {relatedBlog.excerpt}
                        </p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default BlogDetail;
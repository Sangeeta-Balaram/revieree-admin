import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, FileText, Eye, Calendar, Download, Upload } from 'lucide-react';
import { getBlogs, addBlog, deleteBlog, updateBlog, exportToCSV, parseCSV } from '../../utils/adminStorage';

const Blogs = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [blogs, setBlogs] = useState([]);
  const [editingBlog, setEditingBlog] = useState(null);

  const [newBlog, setNewBlog] = useState({
    title: '',
    excerpt: '',
    content: '',
    author: 'Revieree Team',
    category: '',
    tags: '',
    image: '',
    status: 'Draft',
  });

  // Load blogs from localStorage on mount
  useEffect(() => {
    loadBlogs();
  }, []);

  const loadBlogs = () => {
    const allBlogs = getBlogs();
    setBlogs(allBlogs);
  };

  const handleAddBlog = (e) => {
    e.preventDefault();
    const blog = {
      title: newBlog.title,
      excerpt: newBlog.excerpt,
      content: newBlog.content,
      author: newBlog.author,
      category: newBlog.category,
      image: newBlog.image || 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&h=600&fit=crop',
      date: new Date().toISOString().split('T')[0],
      status: newBlog.status,
      views: 0,
    };

    addBlog(blog);
    loadBlogs();

    setNewBlog({
      title: '',
      excerpt: '',
      content: '',
      author: 'Revieree Team',
      category: '',
      tags: '',
      image: '',
      status: 'Draft',
    });
    setShowAddModal(false);
  };

  const handleDeleteBlog = (id) => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      deleteBlog(id);
      loadBlogs();
    }
  };

  const togglePublishStatus = (id, currentStatus) => {
    const newStatus = currentStatus === 'Published' ? 'Draft' : 'Published';
    updateBlog(id, { status: newStatus });
    loadBlogs();
  };

  const handleEditClick = (blog) => {
    setEditingBlog({
      ...blog
    });
    setShowEditModal(true);
  };

  const handleUpdateBlog = (e) => {
    e.preventDefault();
    const updates = {
      title: editingBlog.title,
      excerpt: editingBlog.excerpt,
      content: editingBlog.content,
      author: editingBlog.author,
      category: editingBlog.category,
      image: editingBlog.image,
      status: editingBlog.status,
    };

    updateBlog(editingBlog.id, updates);
    loadBlogs();
    setShowEditModal(false);
    setEditingBlog(null);
  };

  const handleExportTemplate = () => {
    const template = [
      {
        title: 'Sample Blog Post Title',
        excerpt: 'Brief summary of the blog post',
        content: 'Full content of the blog post goes here...',
        author: 'Revieree Team',
        category: 'Fragrances',
        image: 'https://example.com/image.jpg',
        status: 'Draft',
        views: 0,
      }
    ];
    exportToCSV(template, 'blogs_template');
    alert('Template downloaded! Fill in the details and upload using the Import button.');
  };

  const handleExportAll = () => {
    if (blogs.length === 0) {
      alert('No blog posts to export');
      return;
    }
    const exportData = blogs.map(b => ({
      title: b.title,
      excerpt: b.excerpt,
      content: b.content,
      author: b.author,
      category: b.category,
      image: b.image,
      status: b.status,
      views: b.views || 0,
    }));
    exportToCSV(exportData, 'blogs');
    alert(`Exported ${blogs.length} blog posts successfully!`);
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvData = parseCSV(e.target.result);
        const newBlogs = csvData.map(item => ({
          title: item.title,
          excerpt: item.excerpt,
          content: item.content,
          author: item.author || 'Revieree Team',
          category: item.category,
          image: item.image || 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&h=600&fit=crop',
          date: new Date().toISOString().split('T')[0],
          status: item.status || 'Draft',
          views: Number(item.views) || 0,
        }));

        newBlogs.forEach(blog => addBlog(blog));
        loadBlogs();
        alert(`Successfully imported ${newBlogs.length} blog posts!`);
        event.target.value = ''; // Reset file input
      } catch (error) {
        alert('Error importing CSV. Please check the file format.');
        console.error(error);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900">Blog Posts</h1>
          <p className="text-gray-600 mt-1">{blogs.length} posts total</p>
        </div>
        <div className="flex space-x-3">
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
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 bg-burgundy-700 text-white px-6 py-3 rounded-lg hover:bg-burgundy-800 transition-colors"
          >
            <Plus size={20} />
            <span>Create New Post</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Posts</p>
              <p className="text-3xl font-bold text-gray-900">{blogs.length}</p>
            </div>
            <FileText className="text-burgundy-700" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Published</p>
              <p className="text-3xl font-bold text-green-600">
                {blogs.filter((b) => b.status === 'Published').length}
              </p>
            </div>
            <Eye className="text-green-600" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Drafts</p>
              <p className="text-3xl font-bold text-yellow-600">
                {blogs.filter((b) => b.status === 'Draft').length}
              </p>
            </div>
            <FileText className="text-yellow-600" size={32} />
          </div>
        </div>
      </div>

      {/* Blogs Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {blogs.length === 0 ? (
          <div className="text-center py-16">
            <FileText size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-xl text-gray-600">No blog posts yet.</p>
            <p className="text-sm text-gray-500 mt-2">Click "Create New Post" to publish your first article.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Author
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Views
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
                {blogs.map((blog) => (
                  <tr key={blog.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 bg-burgundy-100 rounded-full flex items-center justify-center">
                          <FileText className="text-burgundy-700" size={20} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{blog.title}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{blog.author}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar size={16} className="mr-2" />
                        {blog.date}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Eye size={16} className="mr-2" />
                        {blog.views || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => togglePublishStatus(blog.id, blog.status)}
                        className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer ${
                          blog.status === 'Published'
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                        }`}
                      >
                        {blog.status}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleEditClick(blog)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteBlog(blog.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add New Blog Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-serif font-bold text-gray-900">Create New Blog Post</h2>
            </div>

            <form onSubmit={handleAddBlog} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Blog Title *</label>
                <input
                  type="text"
                  value={newBlog.title}
                  onChange={(e) => setNewBlog({ ...newBlog, title: e.target.value })}
                  placeholder="Enter an engaging title..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select
                    value={newBlog.category}
                    onChange={(e) => setNewBlog({ ...newBlog, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
                    required
                  >
                    <option value="">Select category</option>
                    <option value="Fragrances">Fragrances</option>
                    <option value="Cosmetics">Cosmetics</option>
                    <option value="Lifestyle">Lifestyle</option>
                    <option value="Tips & Tricks">Tips & Tricks</option>
                    <option value="Trends">Trends</option>
                    <option value="Beauty Guide">Beauty Guide</option>
                    <option value="Collections">Collections</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Featured Image URL
                  </label>
                  <input
                    type="url"
                    value={newBlog.image}
                    onChange={(e) => setNewBlog({ ...newBlog, image: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Excerpt (Summary) *
                </label>
                <textarea
                  value={newBlog.excerpt}
                  onChange={(e) => setNewBlog({ ...newBlog, excerpt: e.target.value })}
                  rows="2"
                  placeholder="Brief summary of your blog post..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
                  required
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content *</label>
                <textarea
                  value={newBlog.content}
                  onChange={(e) => setNewBlog({ ...newBlog, content: e.target.value })}
                  rows="12"
                  placeholder="Write your blog content here..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent text-sm"
                  required
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={newBlog.tags}
                  onChange={(e) => setNewBlog({ ...newBlog, tags: e.target.value })}
                  placeholder="perfume, luxury, fragrance"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <div className="flex space-x-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      value="Draft"
                      checked={newBlog.status === 'Draft'}
                      onChange={(e) => setNewBlog({ ...newBlog, status: e.target.value })}
                      className="h-4 w-4 text-burgundy-700 focus:ring-burgundy-700 border-gray-300 mr-2"
                    />
                    <span>Save as Draft</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      value="Published"
                      checked={newBlog.status === 'Published'}
                      onChange={(e) => setNewBlog({ ...newBlog, status: e.target.value })}
                      className="h-4 w-4 text-burgundy-700 focus:ring-burgundy-700 border-gray-300 mr-2"
                    />
                    <span>Publish Immediately</span>
                  </label>
                </div>
              </div>

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
                  {newBlog.status === 'Published' ? 'Publish Post' : 'Save Draft'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit Blog Modal */}
      {showEditModal && editingBlog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-serif font-bold text-gray-900">Edit Blog Post</h2>
            </div>

            <form onSubmit={handleUpdateBlog} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Blog Title *
                  </label>
                  <input
                    type="text"
                    value={editingBlog.title}
                    onChange={(e) => setEditingBlog({ ...editingBlog, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Author *</label>
                  <input
                    type="text"
                    value={editingBlog.author}
                    onChange={(e) => setEditingBlog({ ...editingBlog, author: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <input
                    type="text"
                    value={editingBlog.category}
                    onChange={(e) => setEditingBlog({ ...editingBlog, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
                    placeholder="e.g., Fragrance Tips, Beauty"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={editingBlog.image}
                    onChange={(e) => setEditingBlog({ ...editingBlog, image: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Excerpt *</label>
                <textarea
                  value={editingBlog.excerpt}
                  onChange={(e) => setEditingBlog({ ...editingBlog, excerpt: e.target.value })}
                  rows="2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
                  placeholder="Brief summary of the blog post..."
                  required
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content *</label>
                <textarea
                  value={editingBlog.content}
                  onChange={(e) => setEditingBlog({ ...editingBlog, content: e.target.value })}
                  rows="10"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
                  placeholder="Write your blog content here..."
                  required
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={editingBlog.status}
                  onChange={(e) => setEditingBlog({ ...editingBlog, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
                >
                  <option value="Draft">Draft</option>
                  <option value="Published">Published</option>
                </select>
              </div>

              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingBlog(null);
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-burgundy-700 text-white rounded-lg hover:bg-burgundy-800 transition-colors"
                >
                  Update Blog Post
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Blogs;
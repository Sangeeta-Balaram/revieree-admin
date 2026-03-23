// Admin Storage - Manages products, blogs, and all website content
// Data is stored in localStorage and synced to Supabase for website access

import { supabase } from '../lib/supabase';

const STORAGE_KEYS = {
    PRODUCTS: 'revieree_products', // Same key as storage.js
    BLOGS: 'revieree_blogs', // Same key as storage.js
    STATS: 'revieree_admin_stats',
    SETTINGS: 'revieree_admin_settings',
    USERS: 'revieree_admin_users',
    ROLES: 'revieree_admin_roles',
    NEWSLETTER_SUBSCRIBERS: 'revieree_newsletter_subscribers',
  };

// Convert admin product format to Supabase website format
const toWebsiteProduct = (product) => {
    let category = product.category;
    if (category === 'fragrances') category = 'fragrance';
    if (category === 'cosmetics') category = 'cosmetic';
    
    return {
        name: product.name,
        category: category,
        price: product.price,
        description: product.description || '',
        image: product.image || (product.images && product.images[0]) || '',
        notes: product.notes || [],
        shade: product.subcategory === 'lipstick' || product.subcategory === 'kajal' ? product.shade : null,
        finish: product.subcategory === 'lipstick' || product.subcategory === 'mascara' ? product.finish : null,
        featured: product.featured || false,
    };
};

// Convert admin blog format to Supabase website format
const toWebsiteBlog = (blog) => ({
    title: blog.title,
    excerpt: blog.excerpt || '',
    content: blog.content || '',
    image: blog.image || '',
    category: blog.category || '',
    author: blog.author || 'Revieree Team',
    date: blog.date || new Date().toISOString().split('T')[0],
});

// Sync product to Supabase
const syncProductToSupabase = async (product, operation = 'upsert') => {
    try {
        const websiteProduct = toWebsiteProduct(product);
        if (operation === 'delete') {
            if (product.supabaseId) {
                await supabase.from('products').delete().eq('id', product.supabaseId);
            }
        } else if (product.supabaseId) {
            const { error } = await supabase
                .from('products')
                .update({ ...websiteProduct, updated_at: new Date().toISOString() })
                .eq('id', product.supabaseId);
            if (error) throw error;
        } else {
            const { data, error } = await supabase
                .from('products')
                .insert(websiteProduct)
                .select('id')
                .single();
            if (error) throw error;
            return data?.id;
        }
    } catch (error) {
        console.error('Supabase sync error (product):', error);
        throw error;
    }
};

// Sync blog to Supabase
const syncBlogToSupabase = async (blog, operation = 'upsert') => {
    try {
        const websiteBlog = toWebsiteBlog(blog);
        if (operation === 'delete') {
            if (blog.supabaseId) {
                await supabase.from('blogs').delete().eq('id', blog.supabaseId);
            }
        } else if (blog.supabaseId) {
            const { error } = await supabase
                .from('blogs')
                .update({ ...websiteBlog, updated_at: new Date().toISOString() })
                .eq('id', blog.supabaseId);
            if (error) throw error;
        } else {
            const { data, error } = await supabase
                .from('blogs')
                .insert(websiteBlog)
                .select('id')
                .single();
            if (error) throw error;
            return data?.id;
        }
    } catch (error) {
        console.error('Supabase sync error (blog):', error);
        throw error;
    }
};
  
  // ======================
  // PRODUCTS MANAGEMENT
  // ======================
  
  export const getProducts = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting products from localStorage:', error);
      return [];
    }
  };
  
  export const saveProducts = (products) => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  };
  
  export const addProduct = async (product) => {
    const products = getProducts();
    const newProduct = {
      ...product,
      id: Date.now(), // Generate unique ID
      createdAt: new Date().toISOString(),
      // Ensure backward compatibility
      image: product.images && product.images.length > 0 ? product.images[0] : product.image || '',
      images: product.images || [],
      video: product.video || null,
      variations: product.variations || [],
    };
    products.push(newProduct);
    saveProducts(products);
    
    // Sync to Supabase
    const supabaseId = await syncProductToSupabase(newProduct);
    if (supabaseId) {
      newProduct.supabaseId = supabaseId;
      saveProducts(products);
    }
    
    return newProduct;
  };
  
  export const updateProduct = async (id, updates) => {
    const products = getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
      const updatedProduct = { ...products[index], ...updates };
      // Ensure backward compatibility for images
      if (updatedProduct.images && updatedProduct.images.length > 0) {
        updatedProduct.image = updatedProduct.images[0];
      }
      products[index] = updatedProduct;
      saveProducts(products);
      
      // Sync to Supabase
      await syncProductToSupabase(updatedProduct);
      
      return products[index];
    }
    return null;
  };
  
  export const deleteProduct = async (id) => {
    const products = getProducts();
    const product = products.find(p => p.id === id);
    if (product) {
      await syncProductToSupabase(product, 'delete');
    }
    const filtered = products.filter(p => p.id !== id);
    saveProducts(filtered);
    return filtered;
  };
  
  export const getProductsByCategory = (category) => {
    return getProducts().filter(p => p.category === category);
  };
  
  export const getFeaturedProducts = () => {
    return getProducts().filter(p => p.featured);
  };
  
  // ======================
  // BLOGS MANAGEMENT
  // ======================
  
  export const getBlogs = () => {
    const stored = localStorage.getItem(STORAGE_KEYS.BLOGS);
    return stored ? JSON.parse(stored) : [];
  };
  
  export const saveBlogs = (blogs) => {
    localStorage.setItem(STORAGE_KEYS.BLOGS, JSON.stringify(blogs));
  };
  
  export const addBlog = async (blog) => {
    const blogs = getBlogs();
    const newBlog = {
      ...blog,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      views: 0,
    };
    blogs.push(newBlog);
    saveBlogs(blogs);
    
    // Sync to Supabase
    const supabaseId = await syncBlogToSupabase(newBlog);
    if (supabaseId) {
      newBlog.supabaseId = supabaseId;
      saveBlogs(blogs);
    }
    
    return newBlog;
  };
  
  export const updateBlog = async (id, updates) => {
    const blogs = getBlogs();
    const index = blogs.findIndex(b => b.id === id);
    if (index !== -1) {
      blogs[index] = { ...blogs[index], ...updates };
      saveBlogs(blogs);
      
      // Sync to Supabase
      await syncBlogToSupabase(blogs[index]);
      
      return blogs[index];
    }
    return null;
  };
  
  export const deleteBlog = async (id) => {
    const blogs = getBlogs();
    const blog = blogs.find(b => b.id === id);
    if (blog) {
      await syncBlogToSupabase(blog, 'delete');
    }
    const filtered = blogs.filter(b => b.id !== id);
    saveBlogs(filtered);
    return filtered;
  };
  
  export const getBlogById = (id) => {
    return getBlogs().find(b => b.id === parseInt(id));
  };
  
  // ======================
  // STATS MANAGEMENT
  // ======================
  
  export const getStats = () => {
    const stored = localStorage.getItem(STORAGE_KEYS.STATS);
    if (stored) return JSON.parse(stored);
  
    // Default stats
    return {
      totalCustomers: 0,
      totalSales: 0,
      revenue: 0,
      totalOrders: 0,
      reviews: 0,
    };
  };
  
  export const updateStats = (stats) => {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
  };
  
  // ======================
  // UTILITY FUNCTIONS
  // ======================
  
  export const clearAllData = () => {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  };
  
  export const exportData = () => {
    return {
      products: getProducts(),
      blogs: getBlogs(),
      stats: getStats(),
      exportedAt: new Date().toISOString(),
    };
  };
  
  export const importData = (data) => {
    if (data.products) saveProducts(data.products);
    if (data.blogs) saveBlogs(data.blogs);
    if (data.stats) updateStats(data.stats);
  };
  
  // ======================
  // SETTINGS MANAGEMENT
  // ======================
  
  export const getSettings = () => {
    const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (stored) return JSON.parse(stored);
  
    // Default settings
    return {
      siteName: 'Revieree',
      siteEmail: 'therevieree.co@gmail.com',
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      maintenanceMode: false,
      sidebarCollapsed: false,
    };
  };
  
  export const updateSettings = (settings) => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    return settings;
  };
  
  // ======================
  // USERS MANAGEMENT
  // ======================
  
  export const getUsers = () => {
    const stored = localStorage.getItem(STORAGE_KEYS.USERS);
    if (stored) return JSON.parse(stored);
  
    // Default admin user
    return [
      {
        id: 1,
        name: 'Admin User',
        email: 'therevieree.co@gmail.com',
        role: 'Super Admin',
        status: 'Active',
        lastLogin: new Date().toISOString().split('T')[0],
      },
    ];
  };
  
  export const saveUsers = (users) => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  };
  
  export const addUser = (user) => {
    const users = getUsers();
    const newUser = {
      ...user,
      id: Date.now(),
      status: 'Active',
      lastLogin: 'Never',
    };
    users.push(newUser);
    saveUsers(users);
    return newUser;
  };
  
  export const updateUser = (id, updates) => {
    const users = getUsers();
    const index = users.findIndex(u => u.id === id);
    if (index !== -1) {
      users[index] = { ...users[index], ...updates };
      saveUsers(users);
      return users[index];
    }
    return null;
  };
  
  export const deleteUser = (id) => {
    const users = getUsers();
    const filtered = users.filter(u => u.id !== id);
    saveUsers(filtered);
    return filtered;
  };
  
  // ======================
  // ROLES MANAGEMENT
  // ======================
  
  export const getRoles = () => {
    const stored = localStorage.getItem(STORAGE_KEYS.ROLES);
    if (stored) return JSON.parse(stored);
  
    // Default roles
    return [
      {
        id: 1,
        name: 'Super Admin',
        description: 'Full access to all features and settings',
        permissions: ['All Permissions'],
      },
      {
        id: 2,
        name: 'Inventory Manager',
        description: 'Manage products, stock, and inventory',
        permissions: ['View Products', 'Add Products', 'Edit Products', 'Manage Stock', 'Delete Products'],
      },
      {
        id: 3,
        name: 'Content Manager',
        description: 'Manage blogs and website content',
        permissions: ['View Blogs', 'Create Blogs', 'Edit Blogs', 'Publish Blogs', 'Delete Blogs'],
      },
      {
        id: 4,
        name: 'Marketing Manager',
        description: 'Manage newsletters and marketing campaigns',
        permissions: ['View Subscribers', 'Send Newsletters', 'View Analytics', 'Export Data'],
      },
    ];
  };
  
  export const saveRoles = (roles) => {
    localStorage.setItem(STORAGE_KEYS.ROLES, JSON.stringify(roles));
  };
  
  export const addRole = (role) => {
    const roles = getRoles();
    const newRole = {
      ...role,
      id: Date.now(),
    };
    roles.push(newRole);
    saveRoles(roles);
    return newRole;
  };
  
  export const updateRole = (id, updates) => {
    const roles = getRoles();
    const index = roles.findIndex(r => r.id === id);
    if (index !== -1) {
      roles[index] = { ...roles[index], ...updates };
      saveRoles(roles);
      return roles[index];
    }
    return null;
  };
  
  export const deleteRole = (id) => {
    const roles = getRoles();
    const filtered = roles.filter(r => r.id !== id);
    saveRoles(filtered);
    return filtered;
  };
  
  // ======================
  // CSV EXPORT/IMPORT
  // ======================
  
  export const exportToCSV = (data, filename) => {
    if (!data || data.length === 0) return;
  
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const value = row[header];
        // Handle arrays and objects
        if (Array.isArray(value)) return `"${value.join(';')}"`;
        if (typeof value === 'object' && value !== null) return `"${JSON.stringify(value)}"`;
        // Escape quotes and wrap in quotes if contains comma
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(','))
    ].join('\n');
  
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };
  
  export const parseCSV = (csvText) => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];
  
    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];
  
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      const obj = {};
      headers.forEach((header, index) => {
        let value = values[index] || '';
  
        // Try to parse JSON objects
        if (value.startsWith('{') || value.startsWith('[')) {
          try {
            value = JSON.parse(value);
          } catch (e) {}
        }
  
        // Parse arrays (semicolon separated)
        if (typeof value === 'string' && value.includes(';')) {
          value = value.split(';');
        }
  
        // Parse numbers
        if (!isNaN(value) && value !== '') {
          value = Number(value);
        }
  
        obj[header] = value;
      });
      data.push(obj);
    }
  
    return data;
  };
  
  // ======================
  // NEWSLETTER SUBSCRIBERS
  // ======================
  
  export const getNewsletterSubscribers = () => {
    const stored = localStorage.getItem(STORAGE_KEYS.NEWSLETTER_SUBSCRIBERS);
    return stored ? JSON.parse(stored) : [];
  };
  
  export const saveNewsletterSubscribers = (subscribers) => {
    localStorage.setItem(STORAGE_KEYS.NEWSLETTER_SUBSCRIBERS, JSON.stringify(subscribers));
  };
  
  export const addNewsletterSubscriber = (email) => {
    const subscribers = getNewsletterSubscribers();
    const exists = subscribers.find(s => s.email === email);
  
    if (!exists) {
      const newSubscriber = {
        id: Date.now(),
        email,
        subscribed_at: new Date().toISOString(),
      };
      subscribers.push(newSubscriber);
      saveNewsletterSubscribers(subscribers);
      return newSubscriber;
    }
    return null;
  };
  
  export const deleteNewsletterSubscriber = (id) => {
    const subscribers = getNewsletterSubscribers();
    const filtered = subscribers.filter(s => s.id !== id);
    saveNewsletterSubscribers(filtered);
    return filtered;
  };

  // ======================
  // MIGRATION: localStorage to Supabase
  // ======================

  export const migrateToSupabase = async () => {
    const results = { products: { success: 0, failed: 0, errors: [] }, blogs: { success: 0, failed: 0, errors: [] } };
    
    // Migrate products
    const products = getProducts();
    for (const product of products) {
      if (!product.supabaseId) {
        try {
          const supabaseId = await syncProductToSupabase(product);
          if (supabaseId) {
            product.supabaseId = supabaseId;
            results.products.success++;
          } else {
            results.products.failed++;
          }
        } catch (error) {
          results.products.failed++;
          results.products.errors.push(`Product "${product.name}": ${error.message}`);
        }
      }
    }
    saveProducts(products);
    
    // Migrate blogs
    const blogs = getBlogs();
    for (const blog of blogs) {
      if (!blog.supabaseId) {
        try {
          const supabaseId = await syncBlogToSupabase(blog);
          if (supabaseId) {
            blog.supabaseId = supabaseId;
            results.blogs.success++;
          } else {
            results.blogs.failed++;
          }
        } catch (error) {
          results.blogs.failed++;
          results.blogs.errors.push(`Blog "${blog.title}": ${error.message}`);
        }
      }
    }
    saveBlogs(blogs);
    
    return results;
  };

  export const syncFromSupabase = async () => {
    try {
      const { data: products, error: pError } = await supabase.from('products').select('*');
      const { data: blogs, error: bError } = await supabase.from('blogs').select('*');
      
      if (pError) throw pError;
      if (bError) throw bError;
      
      return { products: products || [], blogs: blogs || [] };
    } catch (error) {
      console.error('Error syncing from Supabase:', error);
      return { products: [], blogs: [] };
    }
  };
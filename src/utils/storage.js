// Storage utility for products and blogs
// Import perfume images
import oldMoneyImg from '../assets/images/perfumes/old-money.jpeg';
import toxicImg from '../assets/images/perfumes/toxic.jpeg';
import gangstaImg from '../assets/images/perfumes/gangsta.jpeg';
import loveHateImg from '../assets/images/perfumes/love-hate.jpeg';
import hotMessImg from '../assets/images/perfumes/hot-mess.jpg';
import intoxicatingImg from '../assets/images/perfumes/intoxicating.jpeg';

const STORAGE_KEYS = {
  PRODUCTS: 'revieree_products',
  BLOGS: 'revieree_blogs',
  VERSION: 'revieree_version',
};

const CURRENT_VERSION = '3.0'; // Using direct imports now, not localStorage for images

// Initial sample data
const initialProducts = [
  // Fragrances
  {
    id: 1,
    name: 'Old Money',
    category: 'fragrance',
    price: 12500, // Base price (50ml)
    description: 'Refined woody floral amber with powdery sophistication - timeless elegance in a bottle',
    image: oldMoneyImg,
    notes: ['Bergamot', 'Iris', 'Sandalwood', 'Amber'],
    olfactoryFamily: 'Woody Floral Amber',
    texture: 'Powdery, refined, sophisticated',
    algorithmTags: ['elegant', 'formal', 'timeless', 'sophisticated', 'powdery'],
    featured: true,
    variations: [
      { id: 'v1', size: '30ml', price: 7500, stock: 45 },
      { id: 'v2', size: '50ml', price: 12500, stock: 30 },
      { id: 'v3', size: '100ml', price: 23000, stock: 15 },
    ],
    totalStock: 90,
  },
  {
    id: 2,
    name: 'Toxic',
    category: 'fragrance',
    price: 11500, // Base price (50ml)
    description: 'Fresh spicy woody with vibrant energy - dangerously captivating and bold',
    image: toxicImg,
    notes: ['Ginger', 'Nutmeg', 'Vetiver', 'Cedarwood'],
    olfactoryFamily: 'Fresh Spicy Woody',
    texture: 'Vibrant, sharp, energetic',
    algorithmTags: ['bold', 'energetic', 'spicy', 'daring', 'fresh'],
    featured: true,
    variations: [
      { id: 'v1', size: '30ml', price: 6500, stock: 50 },
      { id: 'v2', size: '50ml', price: 11500, stock: 35 },
      { id: 'v3', size: '100ml', price: 21500, stock: 20 },
    ],
    totalStock: 105,
  },
  {
    id: 3,
    name: 'Gangsta',
    category: 'fragrance',
    price: 12500, // Base price (50ml)
    description: 'Spicy floral musk with sensual depth - powerful and unapologetically bold',
    image: gangstaImg,
    notes: ['Pink Pepper', 'Damask Rose', 'White Musk', 'Cashmeran'],
    olfactoryFamily: 'Spicy Floral Musk',
    texture: 'Sensual, deep, commanding',
    algorithmTags: ['bold', 'sensual', 'powerful', 'spicy', 'confident'],
    featured: false,
    variations: [
      { id: 'v1', size: '30ml', price: 7500, stock: 40 },
      { id: 'v2', size: '50ml', price: 12500, stock: 28 },
      { id: 'v3', size: '100ml', price: 23000, stock: 12 },
    ],
    totalStock: 80,
  },
  {
    id: 4,
    name: 'Love-Hate',
    category: 'fragrance',
    price: 11500, // Base price (50ml)
    description: 'Spicy clean aldehydic with metallic brilliance - complex and unforgettable contradiction',
    image: loveHateImg,
    notes: ['Aldehydes', 'Cardamom', 'Iso E Super', 'White Florals'],
    olfactoryFamily: 'Spicy Clean/Aldehydic',
    texture: 'Metallic, clean, complex',
    algorithmTags: ['complex', 'modern', 'clean', 'contradictory', 'unique'],
    featured: false,
    variations: [
      { id: 'v1', size: '30ml', price: 6500, stock: 55 },
      { id: 'v2', size: '50ml', price: 11500, stock: 42 },
      { id: 'v3', size: '100ml', price: 21500, stock: 18 },
    ],
    totalStock: 115,
  },
  {
    id: 5,
    name: 'Hot Mess',
    category: 'fragrance',
    price: 10500, // Base price (50ml)
    description: 'Clean floral musk with airy softness - effortlessly captivating and beautifully chaotic',
    image: hotMessImg,
    notes: ['Bergamot', 'Iris', 'White Musk', 'Cotton'],
    olfactoryFamily: 'Clean Floral Musk',
    texture: 'Airy, soft, clean',
    algorithmTags: ['fresh', 'clean', 'soft', 'versatile', 'light'],
    featured: false,
    variations: [
      { id: 'v1', size: '30ml', price: 6000, stock: 60 },
      { id: 'v2', size: '50ml', price: 10500, stock: 45 },
      { id: 'v3', size: '100ml', price: 19500, stock: 25 },
    ],
    totalStock: 130,
  },
  {
    id: 6,
    name: 'Intoxicating',
    category: 'fragrance',
    price: 13500, // Base price (50ml)
    description: 'Fruity floral with gourmand warmth - addictively sweet and irresistibly captivating',
    image: intoxicatingImg,
    notes: ['Blackcurrant', 'Peony', 'Vanilla', 'Praline'],
    olfactoryFamily: 'Fruity Floral',
    texture: 'Sweet, lush, warm',
    algorithmTags: ['sweet', 'romantic', 'addictive', 'gourmand', 'youthful'],
    featured: false,
    variations: [
      { id: 'v1', size: '30ml', price: 8000, stock: 38 },
      { id: 'v2', size: '50ml', price: 13500, stock: 25 },
      { id: 'v3', size: '100ml', price: 25000, stock: 10 },
    ],
    totalStock: 73,
  },

  // Lipsticks
  {
    id: 7,
    name: 'Luxe Lipstick',
    category: 'cosmetic',
    subcategory: 'lipstick',
    price: 3500, // Base price (same for all shades)
    description: 'Luxurious long-lasting lipstick in multiple stunning shades',
    image: 'https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?w=500&h=500&fit=crop',
    featured: true,
    variations: [
      { id: 'v1', shade: 'Nude Pink', colorHex: '#F5D7D3', finish: 'Satin', description: 'Soft and natural, the perfect everyday shade', stock: 42 },
      { id: 'v2', shade: 'Pink', colorHex: '#FFB6C1', finish: 'Glossy', description: 'Classic pink that brightens any look', stock: 55 },
      { id: 'v3', shade: 'Rustic Peach', colorHex: '#FFDAB9', finish: 'Matte', description: 'Warm peachy tones for a sun-kissed glow', stock: 38 },
      { id: 'v4', shade: 'Mauve', colorHex: '#E0B0FF', finish: 'Satin', description: 'Sophisticated dusty rose for elegant occasions', stock: 48 },
      { id: 'v5', shade: 'Red', colorHex: '#DC143C', finish: 'Matte', description: 'Bold classic red for confidence and power', stock: 65 },
      { id: 'v6', shade: 'Brown', colorHex: '#8B4513', finish: 'Matte', description: 'Rich chocolate brown for a modern edge', stock: 40 },
      { id: 'v7', shade: 'Lilac', colorHex: '#C8A2C8', finish: 'Glossy', description: 'Soft purple hues for a whimsical touch', stock: 35 },
      { id: 'v8', shade: 'Maroon', colorHex: '#800000', finish: 'Matte', description: 'Deep wine tones for dramatic elegance', stock: 50 },
      { id: 'v9', shade: 'Dark Maroon', colorHex: '#520000', finish: 'Matte', description: 'Intense burgundy for sultry sophistication', stock: 45 },
    ],
    totalStock: 418,
  },

  // Kajal
  {
    id: 8,
    name: 'Premium Kajal',
    category: 'cosmetic',
    subcategory: 'kajal',
    price: 2400, // Base price (same for all shades)
    description: 'Long-lasting premium kajal for beautifully defined eyes',
    image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=500&h=500&fit=crop',
    featured: true,
    variations: [
      { id: 'v1', shade: 'Black', colorHex: '#000000', finish: 'Creamy', description: 'Intense black for classic definition', stock: 75 },
      { id: 'v2', shade: 'Blue', colorHex: '#0000FF', finish: 'Creamy', description: 'Vibrant blue for a pop of color and drama', stock: 42 },
      { id: 'v3', shade: 'Green', colorHex: '#228B22', finish: 'Creamy', description: 'Emerald green for a mysterious allure', stock: 38 },
      { id: 'v4', shade: 'Golden', colorHex: '#FFD700', finish: 'Shimmer', description: 'Shimmering gold for luminous eyes', stock: 50 },
    ],
    totalStock: 205,
  },
];

const initialBlogs = [
  {
    id: 1,
    title: 'The Art of Fragrance Layering',
    excerpt: 'Discover how to create your unique scent by layering different fragrances',
    content: 'Fragrance layering is an art form that allows you to create a truly personalized scent...',
    image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&h=600&fit=crop',
    date: '2024-01-15',
    author: 'Revieree Team',
    category: 'Tips & Tricks',
  },
  {
    id: 2,
    title: 'Finding Your Perfect Lipstick Shade',
    excerpt: 'A comprehensive guide to choosing lipstick colors that complement your skin tone',
    content: 'Choosing the right lipstick shade can transform your entire look...',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&h=600&fit=crop',
    date: '2024-01-10',
    author: 'Revieree Team',
    category: 'Beauty Guide',
  },
  {
    id: 3,
    title: 'Winter Scent Collection 2024',
    excerpt: 'Explore our curated selection of warm, cozy fragrances for the winter season',
    content: 'As the temperature drops, our fragrance preferences shift towards warmer, spicier notes...',
    image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&h=600&fit=crop',
    date: '2024-01-05',
    author: 'Revieree Team',
    category: 'Collections',
  },
];

// Initialize storage with sample data if empty
export const initializeStorage = () => {
  const storedVersion = localStorage.getItem(STORAGE_KEYS.VERSION);

  // Force update if version changed or doesn't exist
  if (storedVersion !== CURRENT_VERSION) {
    console.log('🔄 Updating product data to version', CURRENT_VERSION);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(initialProducts));
    localStorage.setItem(STORAGE_KEYS.BLOGS, JSON.stringify(initialBlogs));
    localStorage.setItem(STORAGE_KEYS.VERSION, CURRENT_VERSION);
  }
};

// Products CRUD operations
export const getProducts = () => {
  // ALWAYS return fresh data with proper image imports
  // Don't rely on localStorage for initial products as it breaks image imports
  return initialProducts;
};

export const getProductById = (id) => {
  // Return product with proper image import
  return initialProducts.find(p => p.id === parseInt(id));
};

export const getProductsByCategory = (category) => {
  // Return products by category with proper image imports
  return initialProducts.filter(p => p.category === category);
};

export const getFeaturedProducts = () => {
  // Return featured products with proper image imports
  return initialProducts.filter(p => p.featured);
};

export const addProduct = (product) => {
  const products = getProducts();
  const newProduct = {
    ...product,
    id: Math.max(...products.map(p => p.id), 0) + 1,
  };
  products.push(newProduct);
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  return newProduct;
};

export const updateProduct = (id, updatedProduct) => {
  const products = getProducts();
  const index = products.findIndex(p => p.id === parseInt(id));
  if (index !== -1) {
    products[index] = { ...products[index], ...updatedProduct };
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    return products[index];
  }
  return null;
};

export const deleteProduct = (id) => {
  const products = getProducts();
  const filtered = products.filter(p => p.id !== parseInt(id));
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(filtered));
  return true;
};

// Blogs CRUD operations
export const getBlogs = () => {
  const blogs = localStorage.getItem(STORAGE_KEYS.BLOGS);
  return blogs ? JSON.parse(blogs) : [];
};

export const getBlogById = (id) => {
  const blogs = getBlogs();
  return blogs.find(b => b.id === parseInt(id));
};

export const addBlog = (blog) => {
  const blogs = getBlogs();
  const newBlog = {
    ...blog,
    id: Math.max(...blogs.map(b => b.id), 0) + 1,
    date: new Date().toISOString().split('T')[0],
  };
  blogs.push(newBlog);
  localStorage.setItem(STORAGE_KEYS.BLOGS, JSON.stringify(blogs));
  return newBlog;
};

export const updateBlog = (id, updatedBlog) => {
  const blogs = getBlogs();
  const index = blogs.findIndex(b => b.id === parseInt(id));
  if (index !== -1) {
    blogs[index] = { ...blogs[index], ...updatedBlog };
    localStorage.setItem(STORAGE_KEYS.BLOGS, JSON.stringify(blogs));
    return blogs[index];
  }
  return null;
};

export const deleteBlog = (id) => {
  const blogs = getBlogs();
  const filtered = blogs.filter(b => b.id !== parseInt(id));
  localStorage.setItem(STORAGE_KEYS.BLOGS, JSON.stringify(filtered));
  return true;
};
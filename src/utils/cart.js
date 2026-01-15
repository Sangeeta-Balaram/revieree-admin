// Cart Management System using localStorage

const CART_STORAGE_KEY = 'revieree_cart';
const WISHLIST_STORAGE_KEY = 'revieree_wishlist';

// ======================
// CART FUNCTIONS
// ======================

export const getCart = () => {
  const stored = localStorage.getItem(CART_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const addToCart = (product) => {
  const cart = getCart();
  const existingItem = cart.find(item => item.id === product.id);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  return cart;
};

export const removeFromCart = (productId) => {
  const cart = getCart();
  const filtered = cart.filter(item => item.id !== productId);
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(filtered));
  return filtered;
};

export const updateCartQuantity = (productId, quantity) => {
  const cart = getCart();
  const item = cart.find(item => item.id === productId);

  if (item) {
    if (quantity <= 0) {
      return removeFromCart(productId);
    }
    item.quantity = quantity;
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }

  return cart;
};

export const clearCart = () => {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify([]));
  return [];
};

export const getCartTotal = () => {
  const cart = getCart();
  return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
};

export const getCartItemCount = () => {
  const cart = getCart();
  return cart.reduce((count, item) => count + item.quantity, 0);
};

// ======================
// WISHLIST FUNCTIONS
// ======================

export const getWishlist = () => {
  const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const addToWishlist = (product) => {
  const wishlist = getWishlist();
  const exists = wishlist.find(item => item.id === product.id);

  if (!exists) {
    wishlist.push(product);
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
  }

  return wishlist;
};

export const removeFromWishlist = (productId) => {
  const wishlist = getWishlist();
  const filtered = wishlist.filter(item => item.id !== productId);
  localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(filtered));
  return filtered;
};

export const isInWishlist = (productId) => {
  const wishlist = getWishlist();
  return wishlist.some(item => item.id === productId);
};

export const clearWishlist = () => {
  localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify([]));
  return [];
};

export const moveToCart = (productId) => {
  const wishlist = getWishlist();
  const product = wishlist.find(item => item.id === productId);

  if (product) {
    addToCart(product);
    removeFromWishlist(productId);
  }

  return { cart: getCart(), wishlist: getWishlist() };
};
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingBag, Heart, User, LogOut, Settings } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/images/logo.png';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);



  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/admin/products' },
    { name: 'Gifting', path: '/gifting' },
    { name: 'Our Story', path: '/about' },
    { name: 'News & Blogs', path: '/blogs' },
  ];

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-md py-4'
          : 'bg-transparent py-6'
      }`}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="relative z-10">
            <motion.img
              src={logo}
              alt="Revieree"
              className="h-12 md:h-14 w-12 md:w-14 rounded-full object-cover"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <div key={link.name} className="relative group">
                <Link
                  to={link.path}
                  className={`text-gray-800 hover:text-burgundy-700 transition-colors font-medium ${
                    location.pathname === link.path ? 'text-burgundy-700' : ''
                  }`}
                >
                  {link.name}
                </Link>

                {link.dropdown && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white shadow-lg rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                    {link.dropdown.map((item) => (
                      <Link
                        key={item.name}
                        to={item.path}
                        className="block px-4 py-3 text-gray-700 hover:bg-burgundy-50 hover:text-burgundy-700 transition-colors"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right Icons - Wishlist, Cart, Profile */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Wishlist */}
            <Link to="/wishlist" className="relative p-2 hover:text-burgundy-700 transition-colors">
              <Heart size={22} />
              <span className="absolute -top-1 -right-1 bg-burgundy-700 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                0
              </span>
            </Link>

            {/* Cart */}
            <Link to="/cart" className="relative p-2 hover:text-burgundy-700 transition-colors">
              <ShoppingBag size={22} />
              <span className="absolute -top-1 -right-1 bg-burgundy-700 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                0
              </span>
            </Link>

            {/* Profile / Login */}
            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center space-x-2 p-2 hover:text-burgundy-700 transition-colors"
                >
                  <User size={22} />
                </button>

                {/* Profile Dropdown */}
                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md overflow-hidden z-50"
                    >
                      <Link
                        to="/profile"
                        className="flex items-center space-x-2 px-4 py-3 hover:bg-burgundy-50 hover:text-burgundy-700 transition-colors"
                        onClick={() => setProfileOpen(false)}
                      >
                        <User size={18} />
                        <span>My Profile</span>
                      </Link>
                      <Link
                        to="/orders"
                        className="flex items-center space-x-2 px-4 py-3 hover:bg-burgundy-50 hover:text-burgundy-700 transition-colors"
                        onClick={() => setProfileOpen(false)}
                      >
                        <ShoppingBag size={18} />
                        <span>My Orders</span>
                      </Link>
                      <Link
                        to="/settings"
                        className="flex items-center space-x-2 px-4 py-3 hover:bg-burgundy-50 hover:text-burgundy-700 transition-colors"
                        onClick={() => setProfileOpen(false)}
                      >
                        <Settings size={18} />
                        <span>Settings</span>
                      </Link>
                      <button
                        onClick={() => {
                          setIsLoggedIn(false);
                          setProfileOpen(false);
                        }}
                        className="flex items-center space-x-2 px-4 py-3 w-full hover:bg-burgundy-50 hover:text-burgundy-700 transition-colors border-t"
                      >
                        <LogOut size={18} />
                        <span>Logout</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-gray-800 hover:text-burgundy-700 transition-colors font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-6 py-2 bg-burgundy-700 text-white rounded-md hover:bg-burgundy-800 transition-colors font-medium"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden relative z-10 p-2"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden"
            >
              <div className="pt-4 pb-6 space-y-4">
                {navLinks.map((link) => (
                  <div key={link.name}>
                    <Link
                      to={link.path}
                      className={`block py-2 text-gray-800 hover:text-burgundy-700 transition-colors font-medium ${
                        location.pathname === link.path ? 'text-burgundy-700' : ''
                      }`}
                    >
                      {link.name}
                    </Link>
                    {link.dropdown && (
                      <div className="pl-4 space-y-2 mt-2">
                        {link.dropdown.map((item) => (
                          <Link
                            key={item.name}
                            to={item.path}
                            className="block py-1 text-sm text-gray-600 hover:text-burgundy-700"
                          >
                            {item.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                <div className="pt-4 border-t space-y-3">
                  <Link
                    to="/wishlist"
                    className="flex items-center space-x-2 py-2 text-gray-800 hover:text-burgundy-700 transition-colors font-medium"
                  >
                    <Heart size={20} />
                    <span>Wishlist</span>
                  </Link>
                  <Link
                    to="/cart"
                    className="flex items-center space-x-2 py-2 text-gray-800 hover:text-burgundy-700 transition-colors font-medium"
                  >
                    <ShoppingBag size={20} />
                    <span>Cart</span>
                  </Link>
                  {!isLoggedIn && (
                    <>
                      <Link
                        to="/login"
                        className="block w-full text-left py-2 text-gray-800 hover:text-burgundy-700 transition-colors font-medium"
                      >
                        Login
                      </Link>
                      <Link
                        to="/signup"
                        className="block w-full py-2 bg-burgundy-700 text-white rounded-md hover:bg-burgundy-800 transition-colors font-medium text-center"
                      >
                        Sign Up
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navigation;
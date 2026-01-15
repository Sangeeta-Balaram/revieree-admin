import { Link } from 'react-router-dom';
import { Instagram, Youtube, Mail, MapPin, Phone } from 'lucide-react';
import VintageOrnament from './VintageOrnament';
import logo from '../assets/images/logo.png';

const Footer = () => {
  return (
    <footer className="bg-burgundy-900 text-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-10 right-20 text-white opacity-5 hidden md:block">
        <VintageOrnament type="heart" className="w-32 h-32" />
      </div>

      <div className="container-custom py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* About Section */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <img src={logo} alt="Revieree" className="h-12 w-12 rounded-full object-cover" />
              <h3 className="text-xl font-serif font-bold">Revieree</h3>
            </div>
            <p className="text-white/80 text-sm mb-4">
              Discover luxury fragrances and premium cosmetics. Experience elegance with our curated collection.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://instagram.com/revieree"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white/10 rounded-full hover:bg-white hover:text-burgundy-900 transition-all"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://youtube.com/@revieree"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white/10 rounded-full hover:bg-white hover:text-burgundy-900 transition-all"
              >
                <Youtube size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-white/80 hover:text-white transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products/fragrances" className="text-white/80 hover:text-white transition-colors text-sm">
                  Fragrances
                </Link>
              </li>
              <li>
                <Link to="/products/cosmetics" className="text-white/80 hover:text-white transition-colors text-sm">
                  Cosmetics
                </Link>
              </li>
              <li>
                <Link to="/blogs" className="text-white/80 hover:text-white transition-colors text-sm">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-white/80 hover:text-white transition-colors text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-white/80 hover:text-white transition-colors text-sm">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/shipping" className="text-white/80 hover:text-white transition-colors text-sm">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link to="/returns" className="text-white/80 hover:text-white transition-colors text-sm">
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-white/80 hover:text-white transition-colors text-sm">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-white/80 hover:text-white transition-colors text-sm">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-white/80 hover:text-white transition-colors text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/gifting" className="text-white/80 hover:text-white transition-colors text-sm">
                  Gift Sets
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Get in Touch</h4>
            <ul className="space-y-3">
              <li className="flex items-start space-x-2 text-sm">
                <Mail size={16} className="mt-1 flex-shrink-0 text-white/80" />
                <a href="mailto:hello@revieree.com" className="text-white/80 hover:text-white transition-colors">
                  hello@revieree.com
                </a>
              </li>
              <li className="flex items-start space-x-2 text-sm">
                <Phone size={16} className="mt-1 flex-shrink-0 text-white/80" />
                <span className="text-white/80">+91 98765 43210</span>
              </li>
              <li className="flex items-start space-x-2 text-sm">
                <MapPin size={16} className="mt-1 flex-shrink-0 text-white/80" />
                <span className="text-white/80">
                  Mumbai, Maharashtra<br />India
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/20">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-white/70 text-sm text-center md:text-left">
              &copy; {new Date().getFullYear()} Revieree. All rights reserved. Crafted with elegance.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/terms" className="text-white/70 hover:text-white text-xs transition-colors">
                Terms
              </Link>
              <Link to="/privacy" className="text-white/70 hover:text-white text-xs transition-colors">
                Privacy
              </Link>
              <Link to="/cookies" className="text-white/70 hover:text-white text-xs transition-colors">
                Cookies
              </Link>
              <Link to="/sitemap" className="text-white/70 hover:text-white text-xs transition-colors">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
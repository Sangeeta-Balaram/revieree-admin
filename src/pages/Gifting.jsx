import { Gift, Heart, Sparkles, Package } from 'lucide-react';
import VintageOrnament from '../components/VintageOrnament';

const Gifting = () => {
  const giftSets = [
    {
      id: 1,
      name: 'Luxe Romance Set',
      description: 'A curated collection of our signature rose fragrances and matching lip colors',
      price: 299.99,
      image: 'https://images.unsplash.com/photo-1549480017-d76466a4b7e8?w=600&h=600&fit=crop',
      items: ['Velvet Rose Perfume 50ml', 'Rose Petal Gloss', 'Scented Body Lotion'],
      occasion: 'Romantic',
    },
    {
      id: 2,
      name: 'Evening Elegance',
      description: 'Sophisticated oud fragrances paired with deep burgundy cosmetics',
      price: 349.99,
      image: 'https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=600&h=600&fit=crop',
      items: ['Midnight Oud Perfume 50ml', 'Crimson Luxe Lipstick', 'Gold Shimmer Palette'],
      occasion: 'Special Occasion',
    },
    {
      id: 3,
      name: 'Fresh Start Collection',
      description: 'Light, refreshing scents with natural nude cosmetics for everyday elegance',
      price: 249.99,
      image: 'https://images.unsplash.com/photo-1631730486572-226d1f595b68?w=600&h=600&fit=crop',
      items: ['Garden Bloom Perfume 30ml', 'Nude Elegance Lipstick', 'Facial Mist'],
      occasion: 'Everyday',
    },
    {
      id: 4,
      name: 'Ultimate Luxury Set',
      description: 'Our complete collection in an elegant presentation box',
      price: 599.99,
      image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&h=600&fit=crop',
      items: ['3 Premium Perfumes', '5 Luxury Lipsticks', 'Complete Skincare Set'],
      occasion: 'Premium',
      featured: true,
    },
  ];

  const occasions = [
    {
      icon: Heart,
      name: 'Valentine\'s Day',
      description: 'Romantic gifts for your loved one',
      color: 'from-red-500 to-pink-500',
    },
    {
      icon: Sparkles,
      name: 'Birthday',
      description: 'Make their special day memorable',
      color: 'from-purple-500 to-indigo-500',
    },
    {
      icon: Gift,
      name: 'Anniversary',
      description: 'Celebrate your moments together',
      color: 'from-burgundy-600 to-burgundy-800',
    },
    {
      icon: Package,
      name: 'Holiday Season',
      description: 'Festive gifts for everyone',
      color: 'from-green-600 to-emerald-700',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
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
      {/* Hero Section */}
      <section className="section-padding bg-gradient-to-br from-burgundy-700 via-burgundy-800 to-burgundy-900 text-white relative overflow-hidden">
        {/* Boho decorative elements */}
        <div className="absolute top-12 right-20 text-white opacity-35 hidden md:block">
          <VintageOrnament type="heart" className="w-24 h-24" />
        </div>
        <div className="absolute bottom-16 left-16 text-white opacity-35 hidden md:block">
          <VintageOrnament type="stars" className="w-20 h-20" />
        </div>
        <div className="absolute top-1/2 left-24 text-white opacity-35 hidden lg:block">
          <VintageOrnament type="rainbow" className="w-28 h-20" />
        </div>

        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <Gift size={64} className="mx-auto mb-6" />
            <h1 className="text-5xl md:text-6xl font-serif font-bold mb-4">
              Luxury Gift Sets
            </h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Curated collections beautifully presented for every special occasion
            </p>
          </motion.div>
        </div>
      </section>

      {/* Occasions */}
      <section className="section-padding bg-white relative overflow-hidden">
        {/* Boho decorative elements */}
        <div className="absolute top-12 right-16 text-cream-400 opacity-65 hidden md:block">
          <VintageOrnament type="mandala" className="w-24 h-24" />
        </div>
        <div className="absolute bottom-12 left-12 text-cream-400 opacity-65 hidden md:block">
          <VintageOrnament type="crystal" className="w-20 h-24" />
        </div>

        <div className="container-custom relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            <motion.div variants={itemVariants} className="text-center mb-12">
              <h2 className="text-4xl font-serif font-bold text-gray-900 mb-4">
                Shop by Occasion
              </h2>
              <p className="text-gray-600 text-lg">
                Find the perfect gift for every moment
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {occasions.map((occasion, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="cursor-pointer"
                >
                  <div className={`bg-gradient-to-br ${occasion.color} text-white p-8 rounded-xl shadow-lg`}>
                    <occasion.icon size={40} className="mb-4" />
                    <h3 className="text-xl font-semibold mb-2">{occasion.name}</h3>
                    <p className="text-sm opacity-90">{occasion.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Gift Sets */}
      <section className="section-padding bg-cream-50 relative overflow-hidden">
        {/* Boho decorative elements */}
        <div className="absolute top-20 left-20 text-cream-400 opacity-65 hidden md:block">
          <VintageOrnament type="vase" className="w-20 h-28" />
        </div>
        <div className="absolute bottom-24 right-16 text-cream-400 opacity-65 hidden md:block">
          <VintageOrnament type="palmLeaf" className="w-20 h-28" />
        </div>
        <div className="absolute top-1/2 right-32 text-cream-400 opacity-65 hidden lg:block">
          <VintageOrnament type="hand" className="w-24 h-28" />
        </div>

        <div className="container-custom relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            <motion.div variants={itemVariants} className="text-center mb-12">
              <h2 className="text-4xl font-serif font-bold text-gray-900 mb-4">
                Featured Gift Collections
              </h2>
              <p className="text-gray-600 text-lg">
                Elegantly packaged, thoughtfully curated
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {giftSets.map((set) => (
                <motion.div
                  key={set.id}
                  variants={itemVariants}
                  whileHover={{ y: -10 }}
                  className="group"
                >
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300">
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={set.image}
                        alt={set.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      {set.featured && (
                        <div className="absolute top-4 right-4 px-4 py-2 bg-burgundy-700 text-white text-sm font-semibold rounded-full">
                          Best Seller
                        </div>
                      )}
                      <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-sm text-burgundy-700 text-xs font-medium rounded-full">
                        {set.occasion}
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="text-2xl font-serif font-bold text-gray-900 mb-2">
                        {set.name}
                      </h3>
                      <p className="text-gray-600 mb-4">{set.description}</p>

                      <div className="mb-4">
                        <p className="text-sm font-semibold text-gray-700 mb-2">
                          Includes:
                        </p>
                        <ul className="space-y-1">
                          {set.items.map((item, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-center">
                              <span className="w-1.5 h-1.5 bg-burgundy-700 rounded-full mr-2" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div>
                          <span className="text-3xl font-bold text-burgundy-700">
                            ${set.price}
                          </span>
                          <p className="text-xs text-gray-500">Free gift wrapping</p>
                        </div>
                        <button className="btn-primary">
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Custom Gifting CTA */}
      <section className="section-padding bg-white relative overflow-hidden">
        {/* Boho decorative elements */}
        <div className="absolute top-16 right-24 text-cream-400 opacity-65 hidden md:block">
          <VintageOrnament type="sunburst" className="w-24 h-24" />
        </div>
        <div className="absolute bottom-16 left-20 text-cream-400 opacity-65 hidden md:block">
          <VintageOrnament type="moon" className="w-24 h-24" />
        </div>

        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-r from-burgundy-700 to-burgundy-900 text-white rounded-2xl p-12 text-center relative overflow-hidden"
          >
            {/* Elements inside the dark background can use white */}
            <div className="absolute top-8 right-12 text-white opacity-10 hidden md:block">
              <VintageOrnament type="heart" className="w-16 h-16" />
            </div>
            <div className="absolute bottom-8 left-12 text-white opacity-10 hidden md:block">
              <VintageOrnament type="dots" className="w-16 h-16" />
            </div>
            <Sparkles size={48} className="mx-auto mb-6" />
            <h2 className="text-4xl font-serif font-bold mb-4">
              Create Your Custom Gift Set
            </h2>
            <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
              Can't find the perfect combination? Let us help you create a personalized
              gift set tailored to your recipient's preferences.
            </p>
            <button className="px-10 py-4 bg-white text-burgundy-700 font-semibold rounded-lg hover:bg-cream-50 transition-colors">
              Contact Our Gifting Specialist
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Gifting;
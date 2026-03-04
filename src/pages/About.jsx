
import { Heart, Sparkles, Award, Users } from 'lucide-react';
import VintageOrnament from '../components/VintageOrnament';

const About = () => {
  const values = [
    {
      icon: Heart,
      title: 'Passion & Craftsmanship',
      description: 'Every product is crafted with meticulous attention to detail and a deep passion for excellence.',
    },
    {
      icon: Sparkles,
      title: 'Luxury Redefined',
      description: 'We believe luxury is not just about price—it\'s about quality, experience, and feeling.',
    },
    {
      icon: Award,
      title: 'Premium Quality',
      description: 'Only the finest ingredients and materials make it into our collections.',
    },
    {
      icon: Users,
      title: 'Customer First',
      description: 'Your satisfaction and elegance are at the heart of everything we create.',
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
      <section className="section-padding bg-gradient-to-br from-cream-50 to-burgundy-50 relative overflow-hidden">
        {/* Boho decorative elements */}
        <div className="absolute top-12 right-16 text-cream-400 opacity-65 hidden md:block">
          <VintageOrnament type="heart" className="w-28 h-28" />
        </div>
        <div className="absolute bottom-12 left-12 text-cream-400 opacity-65 hidden md:block">
          <VintageOrnament type="vase" className="w-20 h-28" />
        </div>
        <div className="absolute top-1/2 left-1/4 text-cream-400 opacity-65 hidden lg:block">
          <VintageOrnament type="moon" className="w-24 h-24" />
        </div>

        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-gray-900 mb-6">
              Our Story
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Revieree was born from a simple belief: that luxury should be an experience,
              not just a product. We curate the finest fragrances and cosmetics to help you
              discover your signature elegance.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="section-padding bg-white relative overflow-hidden">
        {/* Boho elements */}
        <div className="absolute top-20 right-24 text-cream-400 opacity-65 hidden md:block">
          <VintageOrnament type="sunburst" className="w-24 h-24" />
        </div>
        <div className="absolute bottom-16 left-20 text-cream-400 opacity-65 hidden md:block">
          <VintageOrnament type="palmLeaf" className="w-20 h-28" />
        </div>

        <div className="container-custom relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
          >
            <motion.div variants={itemVariants}>
              <h2 className="text-4xl font-serif font-bold text-gray-900 mb-6">
                A Journey of Elegance
              </h2>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Founded with a vision to redefine luxury beauty, Revieree combines timeless
                elegance with modern sophistication. Each fragrance and cosmetic in our collection
                is carefully selected to tell a story—your story.
              </p>
              <p className="text-gray-600 mb-4 leading-relaxed">
                From the bold confidence of "Gangsta" to the timeless sophistication of "Old Money,"
                every scent is crafted to evoke emotions and create memories. Our cosmetics complement
                this journey, offering shades and finishes that enhance your natural beauty.
              </p>
              <p className="text-gray-600 leading-relaxed">
                We believe that true luxury lies in the details—the quality of ingredients, the artistry
                of composition, and the experience of wearing something that feels uniquely yours.
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="relative">
              <div className="bg-burgundy-50 rounded-2xl p-8 shadow-lg">
                <img
                  src="https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&h=600&fit=crop"
                  alt="Luxury perfume collection"
                  className="w-full h-80 object-cover rounded-lg shadow-md"
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="section-padding bg-cream-50 relative overflow-hidden">
        {/* Boho elements */}
        <div className="absolute top-16 left-16 text-cream-400 opacity-65 hidden md:block">
          <VintageOrnament type="mandala" className="w-24 h-24" />
        </div>
        <div className="absolute bottom-20 right-20 text-cream-400 opacity-65 hidden md:block">
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
                Our Values
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                The principles that guide everything we create
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ y: -8 }}
                  className="bg-white p-8 rounded-xl shadow-lg text-center"
                >
                  <value.icon size={40} className="mx-auto mb-4 text-burgundy-700" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {value.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-r from-burgundy-700 to-burgundy-900 text-white rounded-2xl p-12 text-center"
          >
            <h2 className="text-4xl font-serif font-bold mb-4">
              Discover Your Signature Scent
            </h2>
            <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
              Explore our curated collection and find the perfect fragrance or cosmetic
              that tells your unique story.
            </p>
            <a
              href="/products/fragrances"
              className="inline-block px-10 py-4 bg-white text-burgundy-700 font-semibold rounded-lg hover:bg-cream-50 transition-colors"
            >
              Shop Collection
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;
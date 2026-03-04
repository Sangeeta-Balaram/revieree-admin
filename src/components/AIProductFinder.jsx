import { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, ArrowLeft, X } from 'lucide-react';
import { getProducts } from '../utils/storage';
import { Link } from 'react-router-dom';

const AIProductFinder = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(0);
  const [productType, setProductType] = useState('');
  const [answers, setAnswers] = useState({});
  const [recommendation, setRecommendation] = useState(null);

  const fragranceQuestions = [
    {
      question: "What's your preferred scent profile?",
      options: [
        { label: 'Elegant & Sophisticated', value: 'elegant', tags: ['elegant', 'timeless', 'sophisticated', 'powdery'] },
        { label: 'Bold & Rebellious', value: 'bold', tags: ['rebellious', 'edgy', 'smoky', 'intense'] },
        { label: 'Passionate & Sensual', value: 'passionate', tags: ['passionate', 'sensual', 'romantic', 'seductive'] },
        { label: 'Fresh & Intoxicating', value: 'fresh', tags: ['fresh', 'vibrant', 'energetic', 'citrus'] },
      ],
    },
    {
      question: 'What mood do you want to express?',
      options: [
        { label: 'Timeless Elegance', value: 'timeless', tags: ['elegant', 'formal', 'sophisticated'] },
        { label: 'Confident & Powerful', value: 'powerful', tags: ['rebellious', 'bold', 'confident'] },
        { label: 'Romantic & Passionate', value: 'romantic', tags: ['passionate', 'romantic', 'seductive'] },
        { label: 'Fresh & Energetic', value: 'energetic', tags: ['fresh', 'vibrant', 'citrus'] },
      ],
    },
  ];

  const cosmeticQuestions = [
    {
      question: 'What finish do you prefer?',
      options: [
        { label: 'Matte & Bold', value: 'matte' },
        { label: 'Glossy & Shiny', value: 'glossy' },
        { label: 'Satin & Natural', value: 'satin' },
      ],
    },
    {
      question: 'What shade tone are you looking for?',
      options: [
        { label: 'Nude & Natural', value: 'nude' },
        { label: 'Pink & Rosy', value: 'pink' },
        { label: 'Red & Burgundy', value: 'red' },
      ],
    },
  ];

  const handleStart = (type) => {
    setProductType(type);
    setStep(1);
  };

  const handleAnswer = (questionIndex, answer) => {
    setAnswers({ ...answers, [questionIndex]: answer });

    const questions = productType === 'fragrance' ? fragranceQuestions : cosmeticQuestions;

    if (questionIndex === questions.length - 1) {
      // Generate recommendation
      findRecommendation();
    } else {
      setStep(step + 1);
    }
  };

  const findRecommendation = () => {
    const products = getProducts();
    const category = productType === 'fragrance' ? 'fragrance' : 'cosmetic';
    const categoryProducts = products.filter(p => p.category === category);

    // Simple recommendation logic based on answers
    let recommended = categoryProducts[0];

    if (productType === 'cosmetic') {
      const finishPref = answers[0]?.value;
      const shadePref = answers[1]?.value;

      recommended = categoryProducts.find(p =>
        (p.finish?.toLowerCase().includes(finishPref) ||
         p.shade?.toLowerCase().includes(shadePref))
      ) || categoryProducts[0];
    } else {
      // For fragrances, use algorithmTags to find best match
      const userTags = [...(answers[0]?.tags || []), ...(answers[1]?.tags || [])];

      // Find product with most matching tags
      let bestMatch = categoryProducts[0];
      let maxMatches = 0;

      categoryProducts.forEach(product => {
        if (product.algorithmTags) {
          const matches = product.algorithmTags.filter(tag =>
            userTags.some(userTag => userTag.toLowerCase() === tag.toLowerCase())
          ).length;

          if (matches > maxMatches) {
            maxMatches = matches;
            bestMatch = product;
          }
        }
      });

      recommended = bestMatch;
    }

    setRecommendation(recommended);
    setStep(step + 1);
  };

  const reset = () => {
    setStep(0);
    setProductType('');
    setAnswers({});
    setRecommendation(null);
  };

  const currentQuestions = productType === 'fragrance' ? fragranceQuestions : cosmeticQuestions;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <Sparkles className="text-burgundy-700" size={28} />
                  <h2 className="text-3xl font-serif font-bold text-burgundy-800">
                    Find Your Perfect Match
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Content */}
              <AnimatePresence mode="wait">
                {step === 0 && (
                  <motion.div
                    key="selection"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <p className="text-gray-600 mb-8 text-lg">
                      Let our AI help you discover products perfectly suited to your preferences.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button
                        onClick={() => handleStart('fragrance')}
                        className="p-8 border-2 border-gray-200 rounded-lg hover:border-burgundy-700 hover:bg-burgundy-50 transition-all group"
                      >
                        <div className="text-4xl mb-4">🌸</div>
                        <h3 className="text-xl font-semibold mb-2 group-hover:text-burgundy-700">
                          Find My Fragrance
                        </h3>
                        <p className="text-gray-600 text-sm">
                          Discover your signature scent
                        </p>
                      </button>
                      <button
                        onClick={() => handleStart('cosmetic')}
                        className="p-8 border-2 border-gray-200 rounded-lg hover:border-burgundy-700 hover:bg-burgundy-50 transition-all group"
                      >
                        <div className="text-4xl mb-4">💄</div>
                        <h3 className="text-xl font-semibold mb-2 group-hover:text-burgundy-700">
                          Find My Shade
                        </h3>
                        <p className="text-gray-600 text-sm">
                          Perfect lipstick for you
                        </p>
                      </button>
                    </div>
                  </motion.div>
                )}

                {step > 0 && step <= currentQuestions.length && (
                  <motion.div
                    key={`question-${step}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <div className="mb-6">
                      <span className="text-sm text-burgundy-700 font-medium">
                        Question {step} of {currentQuestions.length}
                      </span>
                      <div className="h-2 bg-gray-200 rounded-full mt-2">
                        <div
                          className="h-full bg-burgundy-700 rounded-full transition-all duration-300"
                          style={{ width: `${(step / currentQuestions.length) * 100}%` }}
                        />
                      </div>
                    </div>

                    <h3 className="text-2xl font-semibold mb-6">
                      {currentQuestions[step - 1].question}
                    </h3>

                    <div className="space-y-3">
                      {currentQuestions[step - 1].options.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleAnswer(step - 1, option)}
                          className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-burgundy-700 hover:bg-burgundy-50 transition-all text-left group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium group-hover:text-burgundy-700">
                              {option.label}
                            </span>
                            <ArrowRight className="text-gray-400 group-hover:text-burgundy-700" size={20} />
                          </div>
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setStep(step - 1)}
                      className="mt-6 flex items-center space-x-2 text-gray-600 hover:text-burgundy-700"
                    >
                      <ArrowLeft size={20} />
                      <span>Back</span>
                    </button>
                  </motion.div>
                )}

                {recommendation && step > currentQuestions.length && (
                  <motion.div
                    key="recommendation"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <div className="text-center mb-6">
                      <div className="text-5xl mb-4">✨</div>
                      <h3 className="text-2xl font-semibold mb-2">
                        We found your perfect match!
                      </h3>
                      <p className="text-gray-600">
                        Based on your preferences, we recommend:
                      </p>
                    </div>

                    <div className="bg-cream-50 rounded-lg p-6 mb-6">
                      <div className="flex flex-col md:flex-row gap-6">
                        <img
                          src={recommendation.image}
                          alt={recommendation.name}
                          className="w-full md:w-48 h-48 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="text-2xl font-serif font-bold mb-2">
                            {recommendation.name}
                          </h4>
                          <p className="text-gray-600 mb-4">
                            {recommendation.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold text-burgundy-700">
                              ${recommendation.price}
                            </span>
                            <Link
                              to={`/products/${recommendation.category === 'fragrance' ? 'fragrances' : 'cosmetics'}`}
                              className="btn-primary"
                              onClick={onClose}
                            >
                              View Product
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={reset}
                      className="w-full btn-secondary"
                    >
                      Start Over
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AIProductFinder;
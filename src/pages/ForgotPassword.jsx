import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import VintageOrnament from '../components/VintageOrnament';
import { getUserByEmail, resetPassword } from '../utils/auth';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: Reset Password, 3: Success
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [userFound, setUserFound] = useState(null);

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    // Check if user exists
    const user = getUserByEmail(email);
    if (!user) {
      setError('No account found with this email address');
      return;
    }

    setUserFound(user);
    setStep(2);
  };

  const handlePasswordReset = (e) => {
    e.preventDefault();
    setError('');

    // Validate passwords
    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Reset password
    const result = resetPassword(email, newPassword);

    if (result.success) {
      setStep(3);
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gradient-to-br from-cream-50 to-burgundy-50 relative overflow-y-auto">
      {/* Boho decorative elements */}
      <div className="absolute top-20 right-20 text-cream-400 opacity-65 hidden md:block">
        <VintageOrnament type="heart" className="w-24 h-24" />
      </div>
      <div className="absolute bottom-20 left-20 text-cream-400 opacity-65 hidden md:block">
        <VintageOrnament type="moon" className="w-24 h-24" />
      </div>
      <div className="absolute top-1/2 left-1/4 text-cream-400 opacity-65 hidden lg:block">
        <VintageOrnament type="palmLeaf" className="w-20 h-28" />
      </div>

      <div className="container-custom relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md mx-auto"
        >
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10">
            {/* Back to Login */}
            <Link
              to="/login"
              className="inline-flex items-center space-x-2 text-burgundy-600 hover:text-burgundy-700 mb-6"
            >
              <ArrowLeft size={20} />
              <span>Back to Login</span>
            </Link>

            {step === 1 && (
              <>
                <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2 text-center">
                  Forgot Password?
                </h1>
                <p className="text-gray-600 text-center mb-8">
                  Enter your email address to reset your password
                </p>

                {error && (
                  <div className="bg-red-50 text-red-700 p-3 rounded-md mb-6 text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleEmailSubmit} className="space-y-6">
                  {/* Email Field */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-burgundy-500"
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full bg-burgundy-600 text-white py-3 rounded-lg font-medium hover:bg-burgundy-700 transition-colors"
                  >
                    Continue
                  </button>
                </form>
              </>
            )}

            {step === 2 && (
              <>
                <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2 text-center">
                  Reset Password
                </h1>
                <p className="text-gray-600 text-center mb-2">
                  Hello, {userFound?.name || 'User'}!
                </p>
                <p className="text-sm text-gray-500 text-center mb-8">
                  Enter your new password for {email}
                </p>

                {error && (
                  <div className="bg-red-50 text-red-700 p-3 rounded-md mb-6 text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handlePasswordReset} className="space-y-6">
                  {/* New Password */}
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        id="newPassword"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-burgundy-500"
                        placeholder="Enter new password"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-burgundy-500"
                        placeholder="Confirm new password"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full bg-burgundy-600 text-white py-3 rounded-lg font-medium hover:bg-burgundy-700 transition-colors"
                  >
                    Reset Password
                  </button>

                  {/* Back Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setNewPassword('');
                      setConfirmPassword('');
                      setError('');
                    }}
                    className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                </form>
              </>
            )}

            {step === 3 && (
              <>
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <svg
                      className="w-8 h-8 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>

                  <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">
                    Password Reset!
                  </h1>
                  <p className="text-gray-600 mb-8">
                    Your password has been successfully reset. You can now login with your new password.
                  </p>

                  <Link
                    to="/login"
                    className="inline-block w-full bg-burgundy-600 text-white py-3 rounded-lg font-medium hover:bg-burgundy-700 transition-colors"
                  >
                    Go to Login
                  </Link>
                </div>
              </>
            )}

            {/* Sign Up Link (only on step 1) */}
            {step === 1 && (
              <div className="mt-6 text-center text-sm">
                <span className="text-gray-600">Don't have an account? </span>
                <Link to="/signup" className="text-burgundy-600 hover:text-burgundy-700 font-medium">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPassword;
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { getUsersSupabase, resetPasswordSupabase } from '../../utils/supabaseAuth';
import { notifyPasswordReset } from '../../utils/notifications';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

const AdminForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Enter email, 2: Super admin reset, 3: Success
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [userType, setUserType] = useState(''); // 'superadmin' or 'admin'
  const [foundUser, setFoundUser] = useState(null);

  const SUPER_ADMIN_EMAILS = ['therevieree.co@gmail.com'];

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    try {
      // First check if it's a super admin email (most reliable check)
      const isSuperAdmin = SUPER_ADMIN_EMAILS.includes(email.toLowerCase());

      if (isSuperAdmin) {
        // Super admin - allow direct password reset
        setUserType('superadmin');
        setFoundUser({ email: email, name: 'Super Admin' });
        setStep(2); // Go to reset password step for super admin
        return;
      }

      // For non-super admin, try to get user info but don't fail if not found
      const adminUsers = await getUsersSupabase();
      const user = adminUsers.find(u => u.email.toLowerCase() === email.toLowerCase());

      // Use found user info or defaults
      const userName = user?.name || 'Admin User';
      setFoundUser(user || { email: email, name: userName });

      // For regular admin, create a password reset request
      setUserType('admin');

      const newRequest = {
        email: email,
        name: userName,
        requested_at: new Date().toISOString(),
        status: 'pending'
      };

      // Save to Supabase if configured, otherwise localStorage
      if (isSupabaseConfigured()) {
        console.log('Saving password reset request to Supabase:', newRequest);
        const { data, error } = await supabase
          .from('password_reset_requests')
          .insert([newRequest])
          .select()
          .single();

        if (error) {
          console.error('Error saving password reset request to Supabase:', error);
          setError('Failed to submit request. Please try again.');
          return;
        }
        console.log('Password reset request saved to Supabase:', data);
      } else {
        // Fallback to localStorage
        console.log('Saving password reset request to localStorage');
        const requests = JSON.parse(localStorage.getItem('passwordResetRequests') || '[]');
        newRequest.id = Date.now().toString();
        newRequest.requestedAt = newRequest.requested_at;
        requests.push(newRequest);
        localStorage.setItem('passwordResetRequests', JSON.stringify(requests));
      }

      // Send notification to super admin
      await notifyPasswordReset(email, userName);

      // Show success message for regular admin
      setStep(3);
    } catch (error) {
      console.error('Error in handleEmailSubmit:', error);
      setError('An error occurred. Please try again.');
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError('');

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

    // Update password for super admin using resetPasswordSupabase
    try {
      const result = await resetPasswordSupabase(email, newPassword);

      if (result.success) {
        console.log('Password updated successfully for:', email);
        setStep(3);
      } else {
        setError(result.error || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      setError('Failed to reset password. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-burgundy-50 to-cream-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8"
      >
        {/* Back to Login Button */}
        <button
          onClick={() => navigate('/admin/login')}
          className="flex items-center space-x-2 text-burgundy-600 hover:text-burgundy-700 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Login</span>
        </button>

        {step === 1 && (
          <>
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-burgundy-100 rounded-full mb-4">
                <Lock className="text-burgundy-700" size={32} />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password?</h1>
              <p className="text-gray-600">Enter your email address to reset your password</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
                    placeholder="admin@example.com"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-burgundy-700 text-white py-3 rounded-lg font-medium hover:bg-burgundy-800 transition-colors"
              >
                Continue
              </button>
            </form>
          </>
        )}

        {step === 2 && userType === 'superadmin' && (
          <>
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-burgundy-100 rounded-full mb-4">
                <Lock className="text-burgundy-700" size={32} />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h1>
              <p className="text-gray-600 mb-1">Super Admin</p>
              <p className="text-sm text-gray-500">Enter your new password for {email}</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handlePasswordReset} className="space-y-6">
              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
                    placeholder="Enter new password"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
                    placeholder="Confirm new password"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-burgundy-700 text-white py-3 rounded-lg font-medium hover:bg-burgundy-800 transition-colors"
                >
                  Reset Password
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setNewPassword('');
                    setConfirmPassword('');
                    setError('');
                  }}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
              </div>
            </form>
          </>
        )}

        {step === 3 && (
          <>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircle className="text-green-600" size={32} />
              </div>

              {userType === 'superadmin' ? (
                <>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Password Reset!</h1>
                  <p className="text-gray-600 mb-8">
                    Your password has been successfully reset. You can now login with your new password.
                  </p>
                </>
              ) : (
                <>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Request Submitted!</h1>
                  <p className="text-gray-600 mb-8">
                    A notification has been sent to the Super Admin. You will receive a new password soon.
                  </p>
                </>
              )}

              <button
                onClick={() => navigate('/admin/login')}
                className="w-full bg-burgundy-700 text-white py-3 rounded-lg font-medium hover:bg-burgundy-800 transition-colors"
              >
                Back to Login
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default AdminForgotPassword;
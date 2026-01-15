// Session Management Utilities
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
const STORAGE_KEYS = {
  LAST_ACTIVITY: 'adminLastActivity',
  SESSION_ID: 'adminSessionId',
  LOGGED_IN: 'adminLoggedIn',
  EMAIL: 'adminEmail',
  PASSWORDS: 'adminPasswords', // Store user passwords
};

// Initialize default admin password
export const initializePasswords = () => {
  const existingPasswords = JSON.parse(localStorage.getItem(STORAGE_KEYS.PASSWORDS) || '{}');

  // Migrate existing passwords to lowercase keys
  const migratedPasswords = {};
  Object.keys(existingPasswords).forEach(email => {
    const lowercaseEmail = email.toLowerCase();
    migratedPasswords[lowercaseEmail] = existingPasswords[email];
  });

  // Only set defaults if no passwords exist at all
  if (Object.keys(migratedPasswords).length === 0) {
    migratedPasswords['therevieree.co@gmail.com'] = 'admin123';
  }

  // Save migrated passwords
  localStorage.setItem(STORAGE_KEYS.PASSWORDS, JSON.stringify(migratedPasswords));
  console.log('Passwords initialized/migrated:', Object.keys(migratedPasswords));
};

// Verify user credentials
export const verifyCredentials = (email, password) => {
  const passwords = JSON.parse(localStorage.getItem(STORAGE_KEYS.PASSWORDS) || '{}');
  const emailKey = email.toLowerCase();
  console.log('Verifying credentials for:', emailKey);
  console.log('Available emails:', Object.keys(passwords));
  console.log('Password match:', passwords[emailKey] === password);
  return passwords[emailKey] === password;
};

// Change password
export const changePassword = (email, currentPassword, newPassword) => {
  const passwords = JSON.parse(localStorage.getItem(STORAGE_KEYS.PASSWORDS) || '{}');
  const emailKey = email.toLowerCase();

  // Verify current password
  if (passwords[emailKey] !== currentPassword) {
    return { success: false, error: 'Current password is incorrect' };
  }

  // Validate new password
  if (newPassword.length < 6) {
    return { success: false, error: 'New password must be at least 6 characters' };
  }

  // Update password
  passwords[emailKey] = newPassword;
  localStorage.setItem(STORAGE_KEYS.PASSWORDS, JSON.stringify(passwords));

  return { success: true };
};

// Update last activity timestamp
export const updateActivity = async () => {
  localStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, Date.now().toString());

  // Update active sessions for user management
  const email = localStorage.getItem(STORAGE_KEYS.EMAIL);
  if (email) {
    updateActiveSession(email);

    // Update in Supabase for cross-device tracking
    try {
      const { isSupabaseConfigured } = await import('../lib/supabase');
      if (isSupabaseConfigured()) {
        const { supabase } = await import('../lib/supabase');
        
        // Get current user info to update by ID rather than email for better performance
        const currentUserInfo = localStorage.getItem('adminUserInfo');
        let userId = null;
        
        if (currentUserInfo) {
          try {
            const userInfo = JSON.parse(currentUserInfo);
            userId = userInfo.id;
          } catch (e) {
            // Fallback to email lookup
          }
        }
        
        const updateData = { last_activity: new Date().toISOString() };
        
        if (userId) {
          await supabase
            .from('admin_users')
            .update(updateData)
            .eq('id', userId);
        } else {
          // Fallback to email lookup
          await supabase
            .from('admin_users')
            .update(updateData)
            .eq('email', email);
        }
        
        console.debug('Activity updated in Supabase for:', email);
      }
    } catch (error) {
      console.error('Supabase activity update failed:', error);
    }
  }
};

// Track active sessions for all users
const ACTIVE_SESSIONS_KEY = 'active_admin_sessions';
const ACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes

export const updateActiveSession = (email) => {
  const activeSessions = JSON.parse(localStorage.getItem(ACTIVE_SESSIONS_KEY) || '{}');
  activeSessions[email] = {
    lastActivity: Date.now(),
    sessionId: localStorage.getItem(STORAGE_KEYS.SESSION_ID)
  };
  localStorage.setItem(ACTIVE_SESSIONS_KEY, JSON.stringify(activeSessions));
};

export const isUserActive = (email) => {
  cleanupInactiveSessions(); // Clean up first
  const activeSessions = JSON.parse(localStorage.getItem(ACTIVE_SESSIONS_KEY) || '{}');
  const userSession = activeSessions[email];

  if (!userSession) return false;

  const timeSinceActivity = Date.now() - userSession.lastActivity;
  return timeSinceActivity < ACTIVITY_TIMEOUT;
};

export const removeActiveSession = (email) => {
  const activeSessions = JSON.parse(localStorage.getItem(ACTIVE_SESSIONS_KEY) || '{}');
  delete activeSessions[email];
  localStorage.setItem(ACTIVE_SESSIONS_KEY, JSON.stringify(activeSessions));
};

export const cleanupInactiveSessions = () => {
  const activeSessions = JSON.parse(localStorage.getItem(ACTIVE_SESSIONS_KEY) || '{}');
  const now = Date.now();

  Object.keys(activeSessions).forEach(email => {
    const timeSinceActivity = now - activeSessions[email].lastActivity;
    if (timeSinceActivity >= ACTIVITY_TIMEOUT) {
      delete activeSessions[email];
    }
  });

  localStorage.setItem(ACTIVE_SESSIONS_KEY, JSON.stringify(activeSessions));
};

// Check if session is still valid
export const isSessionValid = () => {
  const lastActivity = localStorage.getItem(STORAGE_KEYS.LAST_ACTIVITY);
  if (!lastActivity) return false;

  const elapsed = Date.now() - parseInt(lastActivity);
  return elapsed < SESSION_TIMEOUT;
};

// Get remaining session time in minutes
export const getRemainingTime = () => {
  const lastActivity = localStorage.getItem(STORAGE_KEYS.LAST_ACTIVITY);
  if (!lastActivity) return 0;

  const elapsed = Date.now() - parseInt(lastActivity);
  const remaining = SESSION_TIMEOUT - elapsed;
  return Math.max(0, Math.ceil(remaining / 60000)); // Convert to minutes
};

// Generate unique session ID
const generateSessionId = () => {
  return Date.now() + '-' + Math.random().toString(36).substr(2, 9);
};

// Setup real-time user activity tracking
export const setupRealtimeActivityTracking = (onUserStatusChange) => {
  const setupRealtime = async () => {
    try {
      const { isSupabaseConfigured } = await import('../lib/supabase');
      if (isSupabaseConfigured()) {
        const { supabase } = await import('../lib/supabase');
        
        const channel = supabase
          .channel('admin_users_activity')
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'admin_users'
            },
            (payload) => {
              console.debug('User activity updated:', payload);
              if (onUserStatusChange) {
                onUserStatusChange(payload.new);
              }
            }
          )
          .subscribe();

        return channel;
      }
    } catch (error) {
      console.error('Failed to setup realtime activity tracking:', error);
    }
    return null;
  };

  return setupRealtime();
};

// Login user with session management
export const loginUser = async (email, password) => {
  // Try Supabase authentication first
  try {
    const { isSupabaseConfigured } = await import('../lib/supabase');
    if (isSupabaseConfigured()) {
      const { loginUserSupabase } = await import('./supabaseAuth');
      const result = await loginUserSupabase(email, password);
      
      if (result.success) {
        const sessionId = generateSessionId();
        localStorage.setItem(STORAGE_KEYS.SESSION_ID, sessionId);
        
        // Notify other tabs about new session
        localStorage.setItem('adminSessionChange', sessionId);
        
        return result;
      }
    }
  } catch (error) {
    console.error('Supabase login failed, falling back to localStorage:', error);
  }

  // Fallback to localStorage authentication
  if (!verifyCredentials(email, password)) {
    return { success: false, error: 'Invalid email or password' };
  }

  const sessionId = generateSessionId();

  localStorage.setItem(STORAGE_KEYS.LOGGED_IN, 'true');
  localStorage.setItem(STORAGE_KEYS.EMAIL, email);
  localStorage.setItem(STORAGE_KEYS.SESSION_ID, sessionId);
  await updateActivity();

  // Notify other tabs about new session (will force logout others)
  localStorage.setItem('adminSessionChange', sessionId);

  return { success: true };
};

// Logout user
export const logoutUser = () => {
  const email = localStorage.getItem(STORAGE_KEYS.EMAIL);
  if (email) {
    removeActiveSession(email);
  }

  localStorage.removeItem(STORAGE_KEYS.LOGGED_IN);
  localStorage.removeItem(STORAGE_KEYS.EMAIL);
  localStorage.removeItem(STORAGE_KEYS.SESSION_ID);
  localStorage.removeItem(STORAGE_KEYS.LAST_ACTIVITY);
};

// Check for multi-access (another tab logged in)
export const checkMultiAccess = (currentSessionId) => {
  const storedSessionId = localStorage.getItem(STORAGE_KEYS.SESSION_ID);
  return currentSessionId !== storedSessionId;
};

// Listen for session changes across tabs
export const setupSessionListener = (onSessionInvalidated) => {
  const currentSessionId = localStorage.getItem(STORAGE_KEYS.SESSION_ID);

  const handleStorageChange = (e) => {
    // Check if another tab created a new session
    if (e.key === 'adminSessionChange') {
      const newSessionId = e.newValue;
      if (newSessionId !== currentSessionId) {
        onSessionInvalidated('Another session detected. You have been logged out.');
      }
    }
  };

  window.addEventListener('storage', handleStorageChange);

  return () => window.removeEventListener('storage', handleStorageChange);
};
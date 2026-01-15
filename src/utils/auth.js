// Local Authentication System using localStorage
// Simple auth for development - stores users in browser localStorage

const AUTH_STORAGE_KEY = 'revieree_users';
const SESSION_STORAGE_KEY = 'revieree_session';

// Get all users from localStorage
const getUsers = () => {
  const stored = localStorage.getItem(AUTH_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

// Save users to localStorage
const saveUsers = (users) => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(users));
};

// Get current session
export const getCurrentUser = () => {
  const session = localStorage.getItem(SESSION_STORAGE_KEY);
  return session ? JSON.parse(session) : null;
};

// Check if user is logged in
export const isAuthenticated = () => {
  return getCurrentUser() !== null;
};

// Sign up new user
export const signUp = (email, password, name) => {
  const users = getUsers();

  // Check if user already exists
  if (users.find(u => u.email === email)) {
    return { success: false, error: 'User with this email already exists' };
  }

  const newUser = {
    id: Date.now(),
    email,
    password, // In production, this should be hashed
    name,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsers(users);

  return { success: true, user: { id: newUser.id, email: newUser.email, name: newUser.name } };
};

// Sign in user
export const signIn = (email, password) => {
  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    return { success: false, error: 'Invalid email or password' };
  }

  const session = {
    id: user.id,
    email: user.email,
    name: user.name,
  };

  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));

  return { success: true, user: session };
};

// Sign out user
export const signOut = () => {
  localStorage.removeItem(SESSION_STORAGE_KEY);
  return { success: true };
};

// Google Sign In (Mock - for demonstration)
export const signInWithGoogle = () => {
  // In production, this would integrate with Google OAuth
  // For now, create a demo Google user
  const demoUser = {
    id: Date.now(),
    email: 'demo@google.com',
    name: 'Demo User',
  };

  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(demoUser));

  return { success: true, user: demoUser };
};

// Update user profile
export const updateProfile = (userId, updates) => {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.id === userId);

  if (userIndex === -1) {
    return { success: false, error: 'User not found' };
  }

  // Update user data
  users[userIndex] = { ...users[userIndex], ...updates };
  saveUsers(users);

  // Update session if name or email changed
  const currentSession = getCurrentUser();
  if (currentSession && currentSession.id === userId) {
    const updatedSession = {
      ...currentSession,
      email: updates.email || currentSession.email,
      name: updates.name || currentSession.name,
    };
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updatedSession));
  }

  return { success: true, user: users[userIndex] };
};

// Change password
export const changePassword = (userId, currentPassword, newPassword) => {
  const users = getUsers();
  const user = users.find(u => u.id === userId);

  if (!user) {
    return { success: false, error: 'User not found' };
  }

  if (user.password !== currentPassword) {
    return { success: false, error: 'Current password is incorrect' };
  }

  const userIndex = users.findIndex(u => u.id === userId);
  users[userIndex].password = newPassword; // In production, this should be hashed
  saveUsers(users);

  return { success: true };
};

// Reset password (forgot password)
export const resetPassword = (email, newPassword) => {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.email === email);

  if (userIndex === -1) {
    return { success: false, error: 'No user found with this email' };
  }

  users[userIndex].password = newPassword; // In production, this should be hashed
  saveUsers(users);

  return { success: true };
};

// Get user by email (for forgot password)
export const getUserByEmail = (email) => {
  const users = getUsers();
  const user = users.find(u => u.email === email);
  return user ? { id: user.id, email: user.email, name: user.name } : null;
};
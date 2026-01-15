// Supabase Authentication and User Management
// This replaces localStorage with real database storage
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// ======================
// AUTHENTICATION
// ======================

/**
 * Login user with Supabase
 * Falls back to localStorage if Supabase not configured
 */
export const loginUserSupabase = async (email, password) => {
  if (!isSupabaseConfigured()) {
    // Fallback to localStorage (existing behavior)
    const { loginUser } = await import('./sessionManager');
    return loginUser(email, password);
  }

  try {
    // Check if user exists in database
    const { data: users, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !users) {
      return { success: false, error: 'Invalid email or password' };
    }

    // In production, use proper password hashing (bcrypt)
    // For now, direct comparison (matches SQL schema)
    if (users.password_hash !== password) {
      return { success: false, error: 'Invalid email or password' };
    }

    // Update last login and last activity
    const now = new Date().toISOString();
    await supabase
      .from('admin_users')
      .update({
        last_login: now,
        last_activity: now
      })
      .eq('id', users.id);

    // Store session info in localStorage (for session management)
    const sessionId = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('adminLoggedIn', 'true');
    localStorage.setItem('adminEmail', email);
    localStorage.setItem('adminSessionId', sessionId);
    localStorage.setItem('adminLastActivity', Date.now().toString());

    return { success: true, user: users };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Login failed. Please try again.' };
  }
};

/**
 * Change password in Supabase
 */
export const changePasswordSupabase = async (email, currentPassword, newPassword) => {
  if (!isSupabaseConfigured()) {
    // Fallback to localStorage
    const { changePassword } = await import('./sessionManager');
    return changePassword(email, currentPassword, newPassword);
  }

  try {
    // Verify current password
    const { data: user, error } = await supabase
      .from('admin_users')
      .select('password_hash')
      .eq('email', email)
      .single();

    if (error || !user) {
      return { success: false, error: 'User not found' };
    }

    if (user.password_hash !== currentPassword) {
      return { success: false, error: 'Current password is incorrect' };
    }

    // Validate new password
    if (newPassword.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters' };
    }

    // Update password
    const { error: updateError } = await supabase
      .from('admin_users')
      .update({ password_hash: newPassword })
      .eq('email', email);

    if (updateError) {
      return { success: false, error: 'Failed to update password' };
    }

    return { success: true };
  } catch (error) {
    console.error('Change password error:', error);
    return { success: false, error: 'Failed to change password' };
  }
};

/**
 * Reset password in Supabase (without current password verification)
 * Used for super admin password resets
 */
export const resetPasswordSupabase = async (email, newPassword) => {
  if (!isSupabaseConfigured()) {
    // Fallback to localStorage
    const passwords = JSON.parse(localStorage.getItem('adminPasswords') || '{}');
    const emailKey = email.toLowerCase();
    passwords[emailKey] = newPassword;
    localStorage.setItem('adminPasswords', JSON.stringify(passwords));
    return { success: true };
  }

  try {
    // Validate new password
    if (newPassword.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters' };
    }

    // Update password in database
    const { error: updateError } = await supabase
      .from('admin_users')
      .update({ password_hash: newPassword })
      .eq('email', email);

    if (updateError) {
      console.error('Reset password error:', updateError);
      return { success: false, error: 'Failed to reset password' };
    }

    return { success: true };
  } catch (error) {
    console.error('Reset password error:', error);
    return { success: false, error: 'Failed to reset password' };
  }
};

// ======================
// USER MANAGEMENT
// ======================

/**
 * Get all admin users from Supabase
 */
export const getUsersSupabase = async () => {
  if (!isSupabaseConfigured()) {
    // Fallback to localStorage
    const { getUsers } = await import('./adminStorage');
    return getUsers();
  }

  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('id, email, name, role, last_login, last_activity, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get users error:', error);
      return [];
    }

    // Check activity based on last_activity timestamp from database
    const ACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes
    const now = Date.now();

    // Transform to match existing format
    return data.map(user => {
      // Check if user has recent activity (within last 5 minutes)
      const lastActivityTime = user.last_activity ? new Date(user.last_activity).getTime() : 0;
      const isActive = lastActivityTime > 0 && (now - lastActivityTime) < ACTIVITY_TIMEOUT;

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role || 'Unknown',
        status: isActive ? 'Active' : 'Inactive',
        lastLogin: user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never',
        createdAt: user.created_at
      };
    });
  } catch (error) {
    console.error('Get users error:', error);
    return [];
  }
};

/**
 * Add new user to Supabase
 */
export const addUserSupabase = async (user) => {
  if (!isSupabaseConfigured()) {
    // Fallback to localStorage
    const { addUser } = await import('./adminStorage');
    const result = addUser(user);

    // Also add to login credentials
    const passwords = JSON.parse(localStorage.getItem('adminPasswords') || '{}');
    passwords[user.email] = user.password;
    localStorage.setItem('adminPasswords', JSON.stringify(passwords));

    return result;
  }

  try {
    // Insert new user
    const { data, error } = await supabase
      .from('admin_users')
      .insert([
        {
          email: user.email,
          name: user.name,
          password_hash: user.password, // In production, use bcrypt
          role: user.role
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Add user error:', error);
      return { success: false, error: 'Failed to add user' };
    }

    return { success: true, user: data };
  } catch (error) {
    console.error('Add user error:', error);
    return { success: false, error: 'Failed to add user' };
  }
};

/**
 * Update user in Supabase
 */
export const updateUserSupabase = async (id, updates) => {
  if (!isSupabaseConfigured()) {
    // Fallback to localStorage
    const { updateUser } = await import('./adminStorage');
    return updateUser(id, updates);
  }

  try {
    // Prepare update object
    const updateData = {};
    if (updates.name) updateData.name = updates.name;
    if (updates.email) updateData.email = updates.email;
    if (updates.role) updateData.role = updates.role;

    // Update user
    const { data, error } = await supabase
      .from('admin_users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update user error:', error);
      return { success: false, error: 'Failed to update user' };
    }

    return { success: true, user: data };
  } catch (error) {
    console.error('Update user error:', error);
    return { success: false, error: 'Failed to update user' };
  }
};

/**
 * Delete user from Supabase
 */
export const deleteUserSupabase = async (id) => {
  if (!isSupabaseConfigured()) {
    // Fallback to localStorage
    const { deleteUser, getUsers } = await import('./adminStorage');

    // Find user to get email
    const users = getUsers();
    const userToDelete = users.find(u => u.id === id);

    // Delete from users list
    deleteUser(id);

    // Remove from login credentials
    if (userToDelete) {
      const passwords = JSON.parse(localStorage.getItem('adminPasswords') || '{}');
      delete passwords[userToDelete.email];
      localStorage.setItem('adminPasswords', JSON.stringify(passwords));
    }

    return { success: true };
  }

  try {
    const { error } = await supabase
      .from('admin_users')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete user error:', error);
      return { success: false, error: 'Failed to delete user' };
    }

    return { success: true };
  } catch (error) {
    console.error('Delete user error:', error);
    return { success: false, error: 'Failed to delete user' };
  }
};

/**
 * Get all roles from Supabase
 */
export const getRolesSupabase = async () => {
  if (!isSupabaseConfigured()) {
    // Fallback to localStorage
    const { getRoles } = await import('./adminStorage');
    return getRoles();
  }

  try {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .order('name');

    if (error) {
      console.error('Get roles error:', error);
      return [];
    }

    // Transform to match existing format
    return data.map(role => ({
      id: role.id,
      name: role.name,
      description: role.description,
      permissions: role.permissions || []
    }));
  } catch (error) {
    console.error('Get roles error:', error);
    return [];
  }
};

/**
 * Update role in Supabase
 */
export const updateRoleSupabase = async (id, updates) => {
  if (!isSupabaseConfigured()) {
    // Fallback to localStorage
    const { updateRole } = await import('./adminStorage');
    const updatedRole = updateRole(id, updates);
    return { success: true, role: updatedRole };
  }

  try {
    // Prepare update object
    const updateData = {};
    if (updates.name) updateData.name = updates.name;
    if (updates.description) updateData.description = updates.description;
    if (updates.permissions) updateData.permissions = updates.permissions;

    // Update role
    const { data, error } = await supabase
      .from('roles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update role error:', error);
      return { success: false, error: 'Failed to update role' };
    }

    return { success: true, role: data };
  } catch (error) {
    console.error('Update role error:', error);
    return { success: false, error: 'Failed to update role' };
  }
};

/**
 * Add new role to Supabase
 */
export const addRoleSupabase = async (role) => {
  if (!isSupabaseConfigured()) {
    // Fallback to localStorage
    const { addRole } = await import('./adminStorage');
    const newRole = addRole(role);
    return { success: true, role: newRole };
  }

  try {
    // Insert new role
    const { data, error } = await supabase
      .from('roles')
      .insert([
        {
          name: role.name,
          description: role.description,
          permissions: role.permissions || []
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Add role error:', error);
      return { success: false, error: 'Failed to add role' };
    }

    return { success: true, role: data };
  } catch (error) {
    console.error('Add role error:', error);
    return { success: false, error: 'Failed to add role' };
  }
};

/**
 * Delete role from Supabase
 */
export const deleteRoleSupabase = async (id) => {
  if (!isSupabaseConfigured()) {
    // Fallback to localStorage
    const { deleteRole } = await import('./adminStorage');
    deleteRole(id);
    return { success: true };
  }

  try {
    const { error } = await supabase
      .from('roles')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete role error:', error);
      return { success: false, error: 'Failed to delete role' };
    }

    return { success: true };
  } catch (error) {
    console.error('Delete role error:', error);
    return { success: false, error: 'Failed to delete role' };
  }
};

/**
 * Initialize default passwords (only for localStorage fallback)
 */
export const initializePasswordsSupabase = async () => {
  if (!isSupabaseConfigured()) {
    // Use localStorage initialization
    const { initializePasswords } = await import('./sessionManager');
    initializePasswords();
  }
  // If Supabase is configured, passwords are in the database
};
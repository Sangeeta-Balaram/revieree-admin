// Role-Based Access Control (RBAC) Utilities
import { supabase, isSupabaseConfigured } from '../lib/supabase';

/**
 * Get current user's role and permissions
 */
export const getCurrentUserPermissions = async () => {
  const adminEmail = localStorage.getItem('adminEmail');

  if (!adminEmail) {
    return { role: null, permissions: [] };
  }

  if (!isSupabaseConfigured()) {
    // Fallback for localStorage - everyone is Super Admin
    return {
      role: 'Super Admin',
      permissions: ['*'], // All permissions
      isSuperAdmin: true
    };
  }

  try {
    // Get user
    const { data: user, error: userError } = await supabase
      .from('admin_users')
      .select('role')
      .eq('email', adminEmail)
      .single();

    if (userError || !user) {
      console.error('Error fetching user:', userError);
      return { role: null, permissions: [] };
    }

    // Get role permissions
    const { data: roleData, error: roleError } = await supabase
      .from('roles')
      .select('name, permissions')
      .eq('name', user.role)
      .single();

    if (roleError || !roleData) {
      console.error('Error fetching role permissions:', roleError);
      // User exists but role not found - return basic info
      return {
        role: user.role || 'Unknown',
        permissions: [],
        isSuperAdmin: false
      };
    }

    return {
      role: roleData.name,
      permissions: roleData.permissions || [],
      isSuperAdmin: roleData.name === 'Super Admin'
    };
  } catch (error) {
    console.error('Error getting permissions:', error);
    return { role: null, permissions: [] };
  }
};

/**
 * Check if user has a specific permission
 */
export const hasPermission = (userPermissions, requiredPermission) => {
  if (!userPermissions || !Array.isArray(userPermissions)) {
    return false;
  }

  // Super Admin has all permissions
  if (userPermissions.includes('*')) {
    return true;
  }

  // Check if user has the specific permission
  return userPermissions.includes(requiredPermission);
};

/**
 * Check if user has any of the required permissions
 */
export const hasAnyPermission = (userPermissions, requiredPermissions) => {
  if (!userPermissions || !Array.isArray(userPermissions)) {
    return false;
  }

  // Super Admin has all permissions
  if (userPermissions.includes('*')) {
    return true;
  }

  // Check if user has any of the required permissions
  return requiredPermissions.some(permission =>
    userPermissions.includes(permission)
  );
};

/**
 * Check if user has all required permissions
 */
export const hasAllPermissions = (userPermissions, requiredPermissions) => {
  if (!userPermissions || !Array.isArray(userPermissions)) {
    return false;
  }

  // Super Admin has all permissions
  if (userPermissions.includes('*')) {
    return true;
  }

  // Check if user has all required permissions
  return requiredPermissions.every(permission =>
    userPermissions.includes(permission)
  );
};

/**
 * Filter menu items based on user permissions
 */
export const filterMenuByPermissions = (menuItems, userPermissions) => {
  if (!userPermissions || !Array.isArray(userPermissions)) {
    return [];
  }

  // Super Admin sees everything
  if (userPermissions.includes('*')) {
    return menuItems;
  }

  return menuItems.filter(item => {
    if (!item.requiredPermission) {
      return true; // No permission required, show to everyone
    }

    if (Array.isArray(item.requiredPermission)) {
      // Multiple permissions - user needs at least one
      return hasAnyPermission(userPermissions, item.requiredPermission);
    }

    // Single permission
    return hasPermission(userPermissions, item.requiredPermission);
  });
};

/**
 * Permission definitions for each section
 */
export const PERMISSIONS = {
  // Dashboard
  VIEW_ANALYTICS: 'View Analytics',
  EXPORT_DATA: 'Export Data',

  // Products
  VIEW_PRODUCTS: 'View Products',
  ADD_PRODUCTS: 'Add Products',
  EDIT_PRODUCTS: 'Edit Products',
  DELETE_PRODUCTS: 'Delete Products',
  MANAGE_STOCK: 'Manage Stock',

  // Blogs
  VIEW_BLOGS: 'View Blogs',
  CREATE_BLOGS: 'Create Blogs',
  EDIT_BLOGS: 'Edit Blogs',
  PUBLISH_BLOGS: 'Publish Blogs',
  DELETE_BLOGS: 'Delete Blogs',

  // Newsletter
  VIEW_SUBSCRIBERS: 'View Subscribers',
  SEND_NEWSLETTERS: 'Send Newsletters',

  // Users
  VIEW_USERS: 'View Users',
  ADD_USERS: 'Add Users',
  EDIT_USERS: 'Edit Users',
  DELETE_USERS: 'Delete Users',

  // Roles
  MANAGE_ROLES: 'Manage Roles',

  // Settings
  VIEW_SETTINGS: 'View Settings',
  EDIT_SETTINGS: 'Edit Settings',
};
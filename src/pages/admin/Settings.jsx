import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Shield, User, Key, Save, Lock, Eye, EyeOff } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import {
  getSettings,
  updateSettings,
} from '../../utils/adminStorage';
import {
  getUsersSupabase,
  addUserSupabase,
  updateUserSupabase,
  deleteUserSupabase,
  getRolesSupabase,
  changePasswordSupabase,
  resetPasswordSupabase,
  addRoleSupabase,
  updateRoleSupabase,
  deleteRoleSupabase,
} from '../../utils/supabaseAuth';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { setupRealtimeActivityTracking } from '../../utils/sessionManager';

const Settings = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('users');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [users, setUsers] = useState([]);

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: '',
    password: '',
  });

  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    permissions: [],
  });

  const [generalSettings, setGeneralSettings] = useState({});
  const [roles, setRoles] = useState([]);
  const [passwordResetRequests, setPasswordResetRequests] = useState([]);

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

  // Password reset modal state
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
  const [selectedResetRequest, setSelectedResetRequest] = useState(null);
  const [resetPasswordData, setResetPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [resetPasswordMessage, setResetPasswordMessage] = useState({ type: '', text: '' });

  // Helper function to reload password reset requests
  const reloadPasswordResetRequests = async () => {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('password_reset_requests')
        .select('*')
        .order('requested_at', { ascending: false});

      if (!error && data) {
        setPasswordResetRequests(data);
      }
    } else {
      const requests = JSON.parse(localStorage.getItem('passwordResetRequests') || '[]');
      setPasswordResetRequests(requests);
    }
  };

  // Set active tab from navigation state
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, []);

  // Load data from storage on mount
  useEffect(() => {
    const loadData = async () => {
      const usersData = await getUsersSupabase();
      const rolesData = await getRolesSupabase();
      setUsers(usersData);
      setRoles(rolesData);
      setGeneralSettings(getSettings());

      // Setup real-time user activity tracking
      if (isSupabaseConfigured()) {
        const setupTracking = async () => {
          const cleanup = await setupRealtimeActivityTracking((updatedUser) => {
            // Update the user in the users list when activity changes
            setUsers(prevUsers => 
              prevUsers.map(user => {
                if (user.id === updatedUser.id) {
                  // Check if user has recent activity (within last 5 minutes)
                  const ACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes
                  const now = Date.now();
                  const lastActivityTime = updatedUser.last_activity ? new Date(updatedUser.last_activity).getTime() : 0;
                  const isActive = lastActivityTime > 0 && (now - lastActivityTime) < ACTIVITY_TIMEOUT;

                  return {
                    ...user,
                    status: isActive ? 'Active' : 'Inactive',
                    lastLogin: updatedUser.last_login ? new Date(updatedUser.last_login).toLocaleDateString() : user.lastLogin
                  };
                }
                return user;
              })
            );
          });

          return cleanup;
        };

        const cleanupPromise = setupTracking();

        // Cleanup subscription on unmount
        return () => {
          cleanupPromise.then((channel) => {
            if (channel && supabase) {
              supabase.removeChannel(channel);
            }
          }).catch(console.error);
        };
      }

      // Load password reset requests from Supabase
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase
          .from('password_reset_requests')
          .select('*')
          .order('requested_at', { ascending: false });

        if (!error && data) {
          setPasswordResetRequests(data);
        } else {
          console.error('Error loading password reset requests:', error);
          setPasswordResetRequests([]);
        }
      } else {
        // Fallback to localStorage
        const requests = JSON.parse(localStorage.getItem('passwordResetRequests') || '[]');
        setPasswordResetRequests(requests);
      }
    };
    loadData();
  }, []);

  const handleAddUser = async (e) => {
    e.preventDefault();
    const user = {
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      password: newUser.password,
    };

    const result = await addUserSupabase(user);

    if (result.success) {
      // Reload users
      const usersData = await getUsersSupabase();
      setUsers(usersData);

      alert(
        `User added successfully!\n\n` +
        `Email: ${newUser.email}\n` +
        `Password: ${newUser.password}\n\n` +
        `The user can now login at:\n${window.location.origin}/admin/login`
      );

      setNewUser({ name: '', email: '', role: '', password: '' });
      setShowAddUserModal(false);
    } else {
      alert(`Failed to add user: ${result.error}`);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser({ ...user });
    setShowEditUserModal(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();

    const result = await updateUserSupabase(editingUser.id, {
      name: editingUser.name,
      email: editingUser.email,
      role: editingUser.role,
    });

    if (result.success) {
      // Reload users
      const usersData = await getUsersSupabase();
      setUsers(usersData);

      setShowEditUserModal(false);
      setEditingUser(null);
    } else {
      alert(`Failed to update user: ${result.error}`);
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to remove this user?')) {
      const result = await deleteUserSupabase(id);

      if (result.success) {
        // Reload users
        const usersData = await getUsersSupabase();
        setUsers(usersData);
      } else {
        alert(`Failed to delete user: ${result.error}`);
      }
    }
  };

  const handleSaveGeneralSettings = (e) => {
    e.preventDefault();
    updateSettings(generalSettings);
    alert('General settings saved successfully!');
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage({ type: '', text: '' });

    // Validation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New password and confirm password do not match' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'New password must be at least 6 characters long' });
      return;
    }

    const adminEmail = localStorage.getItem('adminEmail');
    const result = await changePasswordSupabase(adminEmail, passwordData.currentPassword, passwordData.newPassword);

    if (result.success) {
      setPasswordMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      setPasswordMessage({ type: 'error', text: result.error });
    }
  };

  // Available permissions list
  const availablePermissions = [
    'View Products',
    'Add Products',
    'Edit Products',
    'Delete Products',
    'Manage Stock',
    'View Blogs',
    'Create Blogs',
    'Edit Blogs',
    'Publish Blogs',
    'Delete Blogs',
    'View Subscribers',
    'Send Newsletters',
    'View Analytics',
    'Export Data',
    'View Users',
    'Add Users',
    'Edit Users',
    'Delete Users',
    'Manage Roles',
    'View Settings',
    'Edit Settings',
  ];

  const handleAddRole = async (e) => {
    e.preventDefault();
    const result = await addRoleSupabase(newRole);

    if (result.success) {
      // Reload roles from Supabase
      const rolesData = await getRolesSupabase();
      setRoles(rolesData);

      setNewRole({
        name: '',
        description: '',
        permissions: [],
      });
      setShowAddRoleModal(false);
    } else {
      alert(`Failed to add role: ${result.error}`);
    }
  };

  const handleDeleteRole = async (id) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      const result = await deleteRoleSupabase(id);

      if (result.success) {
        // Reload roles from Supabase
        const rolesData = await getRolesSupabase();
        setRoles(rolesData);
      } else {
        alert(`Failed to delete role: ${result.error}`);
      }
    }
  };

  const handleTogglePermission = async (roleId, permission) => {
    const role = roles.find(r => r.id === roleId);
    if (!role) return;

    const hasPermission = role.permissions.includes(permission);
    const updatedPermissions = hasPermission
      ? role.permissions.filter(p => p !== permission)
      : [...role.permissions, permission];

    const result = await updateRoleSupabase(roleId, { permissions: updatedPermissions });

    if (result.success) {
      // Reload roles from Supabase
      const rolesData = await getRolesSupabase();
      setRoles(rolesData);
    } else {
      alert(`Failed to update permissions: ${result.error}`);
    }
  };

  const handleEditRole = (role) => {
    setEditingRole({ ...role });
  };

  const handleCancelEditRole = () => {
    setEditingRole(null);
  };

  const handleSaveRole = async (roleId) => {
    if (editingRole) {
      const result = await updateRoleSupabase(roleId, {
        name: editingRole.name,
        description: editingRole.description,
      });

      if (result.success) {
        // Reload roles from Supabase
        const rolesData = await getRolesSupabase();
        setRoles(rolesData);
        setEditingRole(null);
      } else {
        alert(`Failed to update role: ${result.error}`);
      }
    }
  };

  const handleOpenPasswordResetModal = (request) => {
    setSelectedResetRequest(request);
    setResetPasswordData({
      newPassword: '',
      confirmPassword: '',
    });
    setResetPasswordMessage({ type: '', text: '' });
    setShowPasswordResetModal(true);
  };

  const handleClosePasswordResetModal = () => {
    setShowPasswordResetModal(false);
    setSelectedResetRequest(null);
    setResetPasswordData({
      newPassword: '',
      confirmPassword: '',
    });
    setResetPasswordMessage({ type: '', text: '' });
  };

  const handlePasswordResetSubmit = async (e) => {
    e.preventDefault();
    setResetPasswordMessage({ type: '', text: '' });

    // Validation
    if (resetPasswordData.newPassword !== resetPasswordData.confirmPassword) {
      setResetPasswordMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    if (resetPasswordData.newPassword.length < 6) {
      setResetPasswordMessage({ type: 'error', text: 'Password must be at least 6 characters long' });
      return;
    }

    if (!selectedResetRequest) {
      setResetPasswordMessage({ type: 'error', text: 'No request selected' });
      return;
    }

    try {
      // Update user password using Supabase
      const result = await resetPasswordSupabase(selectedResetRequest.email, resetPasswordData.newPassword);

      if (result.success) {
        // Mark request as approved
        if (isSupabaseConfigured()) {
          await supabase
            .from('password_reset_requests')
            .update({
              status: 'approved',
              approved_at: new Date().toISOString()
            })
            .eq('id', selectedResetRequest.id);
          await reloadPasswordResetRequests();
        } else {
          const requests = JSON.parse(localStorage.getItem('passwordResetRequests') || '[]');
          const reqIndex = requests.findIndex(r => r.id === selectedResetRequest.id);
          if (reqIndex !== -1) {
            requests[reqIndex].status = 'approved';
            requests[reqIndex].approvedAt = new Date().toISOString();
            localStorage.setItem('passwordResetRequests', JSON.stringify(requests));
            setPasswordResetRequests(requests);
          }
        }

        alert(`Password updated successfully for ${selectedResetRequest.name}!\nNew password: ${resetPasswordData.newPassword}\n\nPlease share this password securely with the user.`);
        handleClosePasswordResetModal();
      } else {
        setResetPasswordMessage({ type: 'error', text: result.error || 'Failed to update password' });
      }
    } catch (error) {
      console.error('Password reset error:', error);
      setResetPasswordMessage({ type: 'error', text: 'An error occurred while updating password' });
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8">Settings</h1>

      {/* Tabs */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-burgundy-700 text-burgundy-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              User Management
            </button>
            <button
              onClick={() => setActiveTab('roles')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'roles'
                  ? 'border-burgundy-700 text-burgundy-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Roles & Permissions
            </button>
            <button
              onClick={() => setActiveTab('general')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'general'
                  ? 'border-burgundy-700 text-burgundy-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              General Settings
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'security'
                  ? 'border-burgundy-700 text-burgundy-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Security
            </button>
            <button
              onClick={() => setActiveTab('password-requests')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'password-requests'
                  ? 'border-burgundy-700 text-burgundy-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Password Requests
            </button>
          </nav>
        </div>
      </div>

      {/* User Management Tab */}
      {activeTab === 'users' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Users</h2>
            <button
              onClick={() => setShowAddUserModal(true)}
              className="flex items-center space-x-2 bg-burgundy-700 text-white px-6 py-3 rounded-lg hover:bg-burgundy-800 transition-colors"
            >
              <Plus size={20} />
              <span>Add User</span>
            </button>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 bg-burgundy-100 rounded-full flex items-center justify-center">
                          <User className="text-burgundy-700" size={20} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-burgundy-100 text-burgundy-700">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.status === 'Active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.lastLogin}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit user"
                        >
                          <Edit size={18} />
                        </button>
                        {user.role !== 'Super Admin' && (
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete user"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Roles & Permissions Tab */}
      {activeTab === 'roles' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Roles & Permissions</h2>
            <button
              onClick={() => setShowAddRoleModal(true)}
              className="flex items-center space-x-2 bg-burgundy-700 text-white px-6 py-3 rounded-lg hover:bg-burgundy-800 transition-colors"
            >
              <Plus size={20} />
              <span>Add New Role</span>
            </button>
          </div>
          <div className="space-y-6">
            {roles.map((role) => (
              <div key={role.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center flex-1">
                    <div className="h-12 w-12 bg-burgundy-100 rounded-lg flex items-center justify-center">
                      <Shield className="text-burgundy-700" size={24} />
                    </div>
                    <div className="ml-4 flex-1">
                      {editingRole && editingRole.id === role.id ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editingRole.name}
                            onChange={(e) => setEditingRole({ ...editingRole, name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent text-sm font-semibold"
                            placeholder="Role name"
                          />
                          <input
                            type="text"
                            value={editingRole.description}
                            onChange={(e) => setEditingRole({ ...editingRole, description: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent text-sm"
                            placeholder="Role description"
                          />
                        </div>
                      ) : (
                        <>
                          <h3 className="text-lg font-semibold text-gray-900">{role.name}</h3>
                          <p className="text-sm text-gray-600">{role.description}</p>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {editingRole && editingRole.id === role.id ? (
                      <>
                        <button
                          onClick={() => handleSaveRole(role.id)}
                          className="flex items-center space-x-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                          <Save size={16} />
                          <span>Save</span>
                        </button>
                        <button
                          onClick={handleCancelEditRole}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEditRole(role)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit role name and description"
                        >
                          <Edit size={18} />
                        </button>
                        {role.name !== 'Super Admin' && (
                          <button
                            onClick={() => handleDeleteRole(role.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete role"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {role.name === 'Super Admin' ? (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Permissions:</h4>
                    <span className="px-3 py-1 bg-burgundy-100 text-burgundy-700 rounded-full text-xs font-medium">
                      All Permissions
                    </span>
                  </div>
                ) : (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Permissions:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {availablePermissions.map((permission) => {
                        const isChecked = role.permissions.includes(permission);
                        const isEditing = editingRole && editingRole.id === role.id;
                        return (
                          <label
                            key={permission}
                            className={`flex items-center space-x-2 p-2 rounded-lg transition-colors ${
                              isChecked ? 'bg-burgundy-50 border border-burgundy-200' : 'bg-gray-50 border border-gray-200'
                            } ${isEditing ? 'cursor-pointer hover:bg-gray-100' : 'cursor-default opacity-75'}`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleTogglePermission(role.id, permission)}
                              disabled={!isEditing}
                              className="h-4 w-4 text-burgundy-700 focus:ring-burgundy-700 border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            <span className={`text-xs ${isChecked ? 'text-burgundy-800 font-medium' : 'text-gray-700'}`}>
                              {permission}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* General Settings Tab */}
      {activeTab === 'general' && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">General Settings</h2>
          <div className="bg-white rounded-lg shadow p-6">
            <form onSubmit={handleSaveGeneralSettings} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Site Name
                  </label>
                  <input
                    type="text"
                    value={generalSettings.siteName}
                    onChange={(e) =>
                      setGeneralSettings({ ...generalSettings, siteName: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Site Email
                  </label>
                  <input
                    type="email"
                    value={generalSettings.siteEmail}
                    onChange={(e) =>
                      setGeneralSettings({ ...generalSettings, siteEmail: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                  <select
                    value={generalSettings.currency}
                    onChange={(e) =>
                      setGeneralSettings({ ...generalSettings, currency: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="INR">INR (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                  <select
                    value={generalSettings.timezone}
                    onChange={(e) =>
                      setGeneralSettings({ ...generalSettings, timezone: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
                  >
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    <option value="Europe/London">London (GMT)</option>
                    <option value="Asia/Kolkata">India (IST)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
                <input
                  type="checkbox"
                  id="maintenance"
                  checked={generalSettings.maintenanceMode}
                  onChange={(e) =>
                    setGeneralSettings({ ...generalSettings, maintenanceMode: e.target.checked })
                  }
                  className="rounded border-gray-300 text-burgundy-700 focus:ring-burgundy-700"
                />
                <label htmlFor="maintenance" className="text-sm font-medium text-gray-700">
                  Enable Maintenance Mode
                </label>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  className="flex items-center space-x-2 px-6 py-2 bg-burgundy-700 text-white rounded-lg hover:bg-burgundy-800 transition-colors"
                >
                  <Save size={18} />
                  <span>Save Settings</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Security Settings</h2>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-burgundy-100 rounded-lg">
                  <Lock className="text-burgundy-700" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
                  <p className="text-sm text-gray-600">
                    Update your password to keep your account secure
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-6">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, currentPassword: e.target.value })
                    }
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
                    placeholder="Enter current password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords({ ...showPasswords, current: !showPasswords.current })
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password * (minimum 6 characters)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, newPassword: e.target.value })
                    }
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
                    placeholder="Enter new password"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords({ ...showPasswords, new: !showPasswords.new })
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                    }
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
                    placeholder="Confirm new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Success/Error Message */}
              {passwordMessage.text && (
                <div
                  className={`px-4 py-3 rounded-lg text-sm ${
                    passwordMessage.type === 'success'
                      ? 'bg-green-50 border border-green-200 text-green-700'
                      : 'bg-red-50 border border-red-200 text-red-700'
                  }`}
                >
                  {passwordMessage.text}
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  className="flex items-center space-x-2 px-6 py-3 bg-burgundy-700 text-white rounded-lg hover:bg-burgundy-800 transition-colors font-medium"
                >
                  <Key size={18} />
                  <span>Change Password</span>
                </button>
              </div>
            </form>

            {/* Security Info */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Password Requirements:</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start space-x-2">
                  <span className="text-burgundy-700 mt-0.5">•</span>
                  <span>Minimum 6 characters long</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-burgundy-700 mt-0.5">•</span>
                  <span>Use a unique password that you don't use elsewhere</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-burgundy-700 mt-0.5">•</span>
                  <span>Consider using a password manager to generate and store strong passwords</span>
                </li>
              </ul>
            </div>

            {/* Session Info */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Session Security:</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start space-x-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Auto-logout after 30 minutes of inactivity</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Multi-access prevention (only one active session per account)</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Session timer displayed in header</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Password Reset Requests Tab */}
      {activeTab === 'password-requests' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-serif font-bold text-gray-900">Password Reset Requests</h3>
              <p className="text-sm text-gray-600 mt-1">Manage password reset requests from admin users</p>
            </div>
          </div>

          {passwordResetRequests.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Lock className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600">No pending password reset requests</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Requested At
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {passwordResetRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-burgundy-100 rounded-full flex items-center justify-center">
                            <User className="text-burgundy-700" size={20} />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{request.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {request.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(request.requestedAt).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          request.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : request.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {request.status === 'pending' && (
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleOpenPasswordResetModal(request)}
                              className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                            >
                              Approve & Set Password
                            </button>
                            <button
                              onClick={async () => {
                                if (confirm(`Are you sure you want to reject the password reset request from ${request.name}?`)) {
                                  if (isSupabaseConfigured()) {
                                    await supabase
                                      .from('password_reset_requests')
                                      .update({
                                        status: 'rejected',
                                        rejected_at: new Date().toISOString()
                                      })
                                      .eq('id', request.id);
                                    await reloadPasswordResetRequests();
                                  } else {
                                    const requests = JSON.parse(localStorage.getItem('passwordResetRequests') || '[]');
                                    const reqIndex = requests.findIndex(r => r.id === request.id);
                                    if (reqIndex !== -1) {
                                      requests[reqIndex].status = 'rejected';
                                      requests[reqIndex].rejectedAt = new Date().toISOString();
                                      localStorage.setItem('passwordResetRequests', JSON.stringify(requests));
                                      setPasswordResetRequests(requests);
                                    }
                                  }
                                }
                              }}
                              className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        {request.status !== 'pending' && (
                          <button
                            onClick={async () => {
                              if (confirm(`Are you sure you want to delete this ${request.status} request?`)) {
                                if (isSupabaseConfigured()) {
                                  await supabase
                                    .from('password_reset_requests')
                                    .delete()
                                    .eq('id', request.id);
                                  await reloadPasswordResetRequests();
                                } else {
                                  const requests = JSON.parse(localStorage.getItem('passwordResetRequests') || '[]');
                                  const updatedRequests = requests.filter(r => r.id !== request.id);
                                  localStorage.setItem('passwordResetRequests', JSON.stringify(updatedRequests));
                                  setPasswordResetRequests(updatedRequests);
                                }
                              }
                            }}
                            className="text-red-600 hover:text-red-800 transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full"
          >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-serif font-bold text-gray-900">Add New User</h2>
            </div>

            <form onSubmit={handleAddUser} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
                  required
                >
                  <option value="">Select role</option>
                  {roles.map((role) => (
                    <option key={role.name} value={role.name}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
                  required
                />
              </div>

              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-burgundy-700 text-white rounded-lg hover:bg-burgundy-800 transition-colors"
                >
                  Add User
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditUserModal && editingUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full"
          >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-serif font-bold text-gray-900">Edit User</h2>
            </div>

            <form onSubmit={handleUpdateUser} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
                  required
                >
                  {roles.map((role) => (
                    <option key={role.name} value={role.name}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditUserModal(false);
                    setEditingUser(null);
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-burgundy-700 text-white rounded-lg hover:bg-burgundy-800 transition-colors"
                >
                  Update User
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Add New Role Modal */}
      {showAddRoleModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-serif font-bold text-gray-900">Create New Role</h2>
            </div>

            <form onSubmit={handleAddRole} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role Name *</label>
                <input
                  type="text"
                  value={newRole.name}
                  onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
                  placeholder="e.g., Store Manager, Sales Manager"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  value={newRole.description}
                  onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                  rows="2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
                  placeholder="Describe what this role is responsible for..."
                  required
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Permissions *</label>
                <p className="text-sm text-gray-600 mb-3">Select the permissions for this role:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-4">
                  {availablePermissions.map((permission) => {
                    const isChecked = newRole.permissions.includes(permission);
                    return (
                      <label
                        key={permission}
                        className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-colors ${
                          isChecked ? 'bg-burgundy-50 border border-burgundy-200' : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewRole({ ...newRole, permissions: [...newRole.permissions, permission] });
                            } else {
                              setNewRole({ ...newRole, permissions: newRole.permissions.filter(p => p !== permission) });
                            }
                          }}
                          className="h-4 w-4 text-burgundy-700 focus:ring-burgundy-700 border-gray-300 rounded"
                        />
                        <span className={`text-xs ${isChecked ? 'text-burgundy-800 font-medium' : 'text-gray-700'}`}>
                          {permission}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddRoleModal(false);
                    setNewRole({ name: '', description: '', permissions: [] });
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-burgundy-700 text-white rounded-lg hover:bg-burgundy-800 transition-colors"
                >
                  Create Role
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Password Reset Modal */}
      {showPasswordResetModal && selectedResetRequest && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full"
          >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-serif font-bold text-gray-900">Reset Password</h2>
              <p className="text-sm text-gray-600 mt-1">
                Set new password for {selectedResetRequest.name}
              </p>
            </div>

            <form onSubmit={handlePasswordResetSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User Email
                </label>
                <input
                  type="email"
                  value={selectedResetRequest.email}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="password"
                    value={resetPasswordData.newPassword}
                    onChange={(e) => setResetPasswordData({ ...resetPasswordData, newPassword: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
                    placeholder="Enter new password"
                    required
                    minLength={6}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="password"
                    value={resetPasswordData.confirmPassword}
                    onChange={(e) => setResetPasswordData({ ...resetPasswordData, confirmPassword: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-700 focus:border-transparent"
                    placeholder="Confirm new password"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              {/* Success/Error Message */}
              {resetPasswordMessage.text && (
                <div
                  className={`px-4 py-3 rounded-lg text-sm ${
                    resetPasswordMessage.type === 'success'
                      ? 'bg-green-50 border border-green-200 text-green-700'
                      : 'bg-red-50 border border-red-200 text-red-700'
                  }`}
                >
                  {resetPasswordMessage.text}
                </div>
              )}

              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleClosePasswordResetModal}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Reset Password
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Settings;
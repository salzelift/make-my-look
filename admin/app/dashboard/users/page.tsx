'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  Eye,
  Mail,
  Phone,
  Calendar,
  MoreVertical
} from 'lucide-react';
import { usersAPI } from '@/lib/api';
import { User, UserType } from '@/lib/types';

const UserRow = ({ user, onEdit, onDelete, onView }: {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onView: (user: User) => void;
}) => {
  const [showActions, setShowActions] = useState(false);

  const getUserTypeColor = (type: UserType) => {
    switch (type) {
      case UserType.OWNER:
        return 'bg-blue-100 text-blue-800';
      case UserType.CUSTOMER:
        return 'bg-green-100 text-green-800';
      case UserType.EMPLOYEE:
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-gray-700">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{user.name}</div>
            <div className="text-sm text-gray-500 flex items-center">
              <Mail className="w-3 h-3 mr-1" />
              {user.email}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getUserTypeColor(user.userType)}`}>
          {user.userType}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 flex items-center">
        <Phone className="w-3 h-3 mr-1" />
        {user.phoneNumber}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex items-center">
        <Calendar className="w-3 h-3 mr-1" />
        {new Date(user.createdAt).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          
          {showActions && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
              <div className="py-1">
                <button
                  onClick={() => {
                    onView(user);
                    setShowActions(false);
                  }}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </button>
                <button
                  onClick={() => {
                    onEdit(user);
                    setShowActions(false);
                  }}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit User
                </button>
                <button
                  onClick={() => {
                    onDelete(user);
                    setShowActions(false);
                  }}
                  className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete User
                </button>
              </div>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<UserType | 'ALL'>('ALL');

  useEffect(() => {
    loadUsers();
  }, [filterType]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const typeFilter = filterType !== 'ALL' ? filterType : undefined;
      const response = await usersAPI.getAll(typeFilter);
      setUsers(response.data);
    } catch (err: any) {
      console.error('Error loading users:', err);
      setError('Failed to load users');
      
      // Mock data for demo
      setUsers([
        {
          id: '1',
          email: 'john.doe@example.com',
          name: 'John Doe',
          phoneNumber: '+1234567890',
          userType: UserType.OWNER,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          email: 'jane.smith@example.com',
          name: 'Jane Smith',
          phoneNumber: '+1234567891',
          userType: UserType.CUSTOMER,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '3',
          email: 'mike.johnson@example.com',
          name: 'Mike Johnson',
          phoneNumber: '+1234567892',
          userType: UserType.EMPLOYEE,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (user: User) => {
    console.log('Edit user:', user);
    // TODO: Implement edit modal
  };

  const handleDelete = (user: User) => {
    console.log('Delete user:', user);
    // TODO: Implement delete confirmation
  };

  const handleView = (user: User) => {
    console.log('View user:', user);
    // TODO: Implement user details modal
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage all users in your platform</p>
        </div>
        <button className="btn-primary flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Filters and Search */}
      <div className="card p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
            />
          </div>

          {/* Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as UserType | 'ALL')}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
            >
              <option value="ALL">All Users</option>
              <option value={UserType.OWNER}>Owners</option>
              <option value={UserType.CUSTOMER}>Customers</option>
              <option value={UserType.EMPLOYEE}>Employees</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-4">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Customers</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.userType === UserType.CUSTOMER).length}
              </p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Owners</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.userType === UserType.OWNER).length}
              </p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-orange-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Employees</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.userType === UserType.EMPLOYEE).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onView={handleView}
                />
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Try adjusting your search criteria.' : 'Get started by adding a new user.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
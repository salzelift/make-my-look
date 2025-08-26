'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Store as StoreIcon, 
  Eye,
  MapPin,
  Phone,
  Calendar,
  MoreVertical,
  Users,
  Scissors
} from 'lucide-react';
import { storesAPI } from '@/lib/api';
import { Store } from '@/lib/types';

const StoreRow = ({ store, onEdit, onDelete, onView }: {
  store: Store;
  onEdit: (store: Store) => void;
  onDelete: (store: Store) => void;
  onView: (store: Store) => void;
}) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
            <StoreIcon className="w-5 h-5 text-gray-600" />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{store.name}</div>
            <div className="text-sm text-gray-500 flex items-center">
              <MapPin className="w-3 h-3 mr-1" />
              {store.address}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {store.owner.user.name}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 flex items-center">
        <Phone className="w-3 h-3 mr-1" />
        {store.phoneNumber || 'N/A'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {store.services?.length || 0} services
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex items-center">
        <Calendar className="w-3 h-3 mr-1" />
        {new Date(store.createdAt).toLocaleDateString()}
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
                    onView(store);
                    setShowActions(false);
                  }}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </button>
                <button
                  onClick={() => {
                    onEdit(store);
                    setShowActions(false);
                  }}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Store
                </button>
                <button
                  onClick={() => {
                    onDelete(store);
                    setShowActions(false);
                  }}
                  className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Store
                </button>
              </div>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};

export default function StoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async () => {
    try {
      setIsLoading(true);
      const response = await storesAPI.getAll();
      setStores(response.data);
    } catch (err: any) {
      console.error('Error loading stores:', err);
      setError('Failed to load stores');
      
      // Mock data for demo
      setStores([
        {
          id: '1',
          name: 'Glamour Salon',
          email: 'contact@glamour.com',
          address: '123 Beauty Street, Downtown',
          phoneNumber: '+1234567890',
          latitude: 40.7128,
          longitude: -74.0060,
          ownerId: '1',
          owner: {
            id: '1',
            userId: '1',
            user: {
              id: '1',
              name: 'John Doe',
              email: 'john@example.com',
              phoneNumber: '+1234567890',
              userType: 'OWNER' as any,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            stores: []
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          services: [],
          bookings: [],
          availability: [],
          storeEmployees: [],
          employeeAvailability: []
        },
        {
          id: '2',
          name: 'Beauty Hub',
          email: 'info@beautyhub.com',
          address: '456 Style Avenue, Uptown',
          phoneNumber: '+1234567891',
          latitude: 40.7589,
          longitude: -73.9851,
          ownerId: '2',
          owner: {
            id: '2',
            userId: '2',
            user: {
              id: '2',
              name: 'Jane Smith',
              email: 'jane@example.com',
              phoneNumber: '+1234567891',
              userType: 'OWNER' as any,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            stores: []
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          services: [],
          bookings: [],
          availability: [],
          storeEmployees: [],
          employeeAvailability: []
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStores = stores.filter(store =>
    store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.owner.user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (store: Store) => {
    console.log('Edit store:', store);
    // TODO: Implement edit modal
  };

  const handleDelete = (store: Store) => {
    console.log('Delete store:', store);
    // TODO: Implement delete confirmation
  };

  const handleView = (store: Store) => {
    console.log('View store:', store);
    // TODO: Implement store details modal
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
          <h1 className="text-2xl font-bold text-gray-900">Store Management</h1>
          <p className="text-gray-600">Manage all stores on your platform</p>
        </div>
        <button className="btn-primary flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          Add Store
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Search */}
      <div className="card p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search stores by name, address, or owner..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
          />
        </div>
      </div>

      {/* Store Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-4">
          <div className="flex items-center">
            <StoreIcon className="w-8 h-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Stores</p>
              <p className="text-2xl font-bold text-gray-900">{stores.length}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Active Owners</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(stores.map(s => s.ownerId)).size}
              </p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center">
            <Scissors className="w-8 h-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Services</p>
              <p className="text-2xl font-bold text-gray-900">
                {stores.reduce((sum, store) => sum + (store.services?.length || 0), 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center">
            <MapPin className="w-8 h-8 text-orange-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Cities</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(stores.map(s => s.address.split(',').pop()?.trim())).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stores Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Store
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Owner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Services
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStores.map((store) => (
                <StoreRow
                  key={store.id}
                  store={store}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onView={handleView}
                />
              ))}
            </tbody>
          </table>
        </div>

        {filteredStores.length === 0 && (
          <div className="text-center py-12">
            <StoreIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No stores found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Try adjusting your search criteria.' : 'Get started by adding a new store.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
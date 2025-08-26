'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Scissors, 
  Tag,
  MoreVertical
} from 'lucide-react';
import { servicesAPI } from '@/lib/api';
import { ServiceType } from '@/lib/types';

const ServiceTypeRow = ({ serviceType, onEdit, onDelete }: {
  serviceType: ServiceType;
  onEdit: (serviceType: ServiceType) => void;
  onDelete: (serviceType: ServiceType) => void;
}) => {
  const [showActions, setShowActions] = useState(false);

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'hair':
        return 'bg-blue-100 text-blue-800';
      case 'facial':
        return 'bg-green-100 text-green-800';
      case 'nails':
        return 'bg-purple-100 text-purple-800';
      case 'body':
        return 'bg-orange-100 text-orange-800';
      case 'beauty':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
            <Scissors className="w-5 h-5 text-gray-600" />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{serviceType.name}</div>
            <div className="text-sm text-gray-500">{serviceType.description}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(serviceType.category)}`}>
          {serviceType.category}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {serviceType.storeServices?.length || 0} stores
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(serviceType.createdAt).toLocaleDateString()}
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
                    onEdit(serviceType);
                    setShowActions(false);
                  }}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Service
                </button>
                <button
                  onClick={() => {
                    onDelete(serviceType);
                    setShowActions(false);
                  }}
                  className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Service
                </button>
              </div>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};

const CreateServiceModal = ({ isOpen, onClose, onSave }: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; description?: string; category: string }) => void;
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Hair'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setFormData({ name: '', description: '', category: 'Hair' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Service Type</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
              placeholder="e.g., Haircut, Facial Treatment"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
            >
              <option value="Hair">Hair</option>
              <option value="Facial">Facial</option>
              <option value="Nails">Nails</option>
              <option value="Body">Body</option>
              <option value="Beauty">Beauty</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
              rows={3}
              placeholder="Brief description of the service..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              Add Service
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function ServicesPage() {
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadServiceTypes();
  }, []);

  const loadServiceTypes = async () => {
    try {
      setIsLoading(true);
      const response = await servicesAPI.getTypes();
      setServiceTypes(response.data);
    } catch (err: any) {
      console.error('Error loading service types:', err);
      setError('Failed to load service types');
      
      // Mock data for demo
      setServiceTypes([
        {
          id: '1',
          name: 'Haircut & Styling',
          description: 'Professional haircut and styling service',
          category: 'Hair',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          storeServices: []
        },
        {
          id: '2',
          name: 'Facial Treatment',
          description: 'Relaxing facial treatment for all skin types',
          category: 'Facial',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          storeServices: []
        },
        {
          id: '3',
          name: 'Manicure',
          description: 'Complete nail care and polish',
          category: 'Nails',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          storeServices: []
        },
        {
          id: '4',
          name: 'Deep Tissue Massage',
          description: 'Therapeutic massage for muscle relief',
          category: 'Body',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          storeServices: []
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredServiceTypes = serviceTypes.filter(serviceType => {
    const matchesSearch = serviceType.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         serviceType.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || serviceType.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleEdit = (serviceType: ServiceType) => {
    console.log('Edit service type:', serviceType);
    // TODO: Implement edit modal
  };

  const handleDelete = async (serviceType: ServiceType) => {
    if (confirm('Are you sure you want to delete this service type?')) {
      try {
        await servicesAPI.deleteType(serviceType.id);
        setServiceTypes(serviceTypes.filter(st => st.id !== serviceType.id));
      } catch (err: any) {
        console.error('Error deleting service type:', err);
        // For demo, just remove locally
        setServiceTypes(serviceTypes.filter(st => st.id !== serviceType.id));
      }
    }
  };

  const handleCreateService = async (data: { name: string; description?: string; category: string }) => {
    try {
      const response = await servicesAPI.createType(data);
      setServiceTypes([...serviceTypes, response.data]);
    } catch (err: any) {
      console.error('Error creating service type:', err);
      // For demo, add locally
      const newService: ServiceType = {
        id: Date.now().toString(),
        name: data.name,
        description: data.description,
        category: data.category,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        storeServices: []
      };
      setServiceTypes([...serviceTypes, newService]);
    }
  };

  const categoryStats = {
    total: serviceTypes.length,
    hair: serviceTypes.filter(st => st.category === 'Hair').length,
    facial: serviceTypes.filter(st => st.category === 'Facial').length,
    nails: serviceTypes.filter(st => st.category === 'Nails').length,
    body: serviceTypes.filter(st => st.category === 'Body').length,
    beauty: serviceTypes.filter(st => st.category === 'Beauty').length,
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
          <h1 className="text-2xl font-bold text-gray-900">Service Management</h1>
          <p className="text-gray-600">Manage service types available on your platform</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Service Type
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
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search service types..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Tag className="w-4 h-4 text-gray-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
            >
              <option value="ALL">All Categories</option>
              <option value="Hair">Hair</option>
              <option value="Facial">Facial</option>
              <option value="Nails">Nails</option>
              <option value="Body">Body</option>
              <option value="Beauty">Beauty</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
        <div className="card p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{categoryStats.total}</p>
            <p className="text-sm text-gray-600">Total Services</p>
          </div>
        </div>
        <div className="card p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{categoryStats.hair}</p>
            <p className="text-sm text-gray-600">Hair</p>
          </div>
        </div>
        <div className="card p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{categoryStats.facial}</p>
            <p className="text-sm text-gray-600">Facial</p>
          </div>
        </div>
        <div className="card p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{categoryStats.nails}</p>
            <p className="text-sm text-gray-600">Nails</p>
          </div>
        </div>
        <div className="card p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">{categoryStats.body}</p>
            <p className="text-sm text-gray-600">Body</p>
          </div>
        </div>
        <div className="card p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-pink-600">{categoryStats.beauty}</p>
            <p className="text-sm text-gray-600">Beauty</p>
          </div>
        </div>
      </div>

      {/* Services Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Used by Stores
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
              {filteredServiceTypes.map((serviceType) => (
                <ServiceTypeRow
                  key={serviceType.id}
                  serviceType={serviceType}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </tbody>
          </table>
        </div>

        {filteredServiceTypes.length === 0 && (
          <div className="text-center py-12">
            <Scissors className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No service types found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Try adjusting your search criteria.' : 'Get started by adding a new service type.'}
            </p>
          </div>
        )}
      </div>

      {/* Create Service Modal */}
      <CreateServiceModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateService}
      />
    </div>
  );
}
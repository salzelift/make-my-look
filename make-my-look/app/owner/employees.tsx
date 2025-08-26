import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Alert, Modal } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Loading } from '@/components/ui/Loading';
import { employeesAPI } from '@/services/api';
import { StoreEmployee, EmployeeAvailability } from '@/types';
import { Plus, Edit, Trash2, Calendar, BarChart3, User } from 'lucide-react-native';

export default function EmployeesScreen() {
  const params = useLocalSearchParams<{ storeId: string; storeName: string }>();
  const { user, isAuthenticated } = useAuth();
  const [employees, setEmployees] = useState<StoreEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<StoreEmployee | null>(null);
  const [filters, setFilters] = useState({ status: '', role: '' });

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    designation: '',
    role: '',
    salary: '',
    employeeId: ''
  });

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  useEffect(() => {
    if (!isAuthenticated || user?.userType !== 'OWNER') {
      router.replace('/(auth)/welcome');
      return;
    }

    loadEmployees();
  }, [isAuthenticated, user, filters]);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const response = await employeesAPI.getStoreEmployees(params.storeId!, filters);
      setEmployees(response.employees);
    } catch (error: any) {
      console.error('Failed to load employees:', error);
      Alert.alert('Error', 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = async () => {
    if (!formData.name || !formData.email || !formData.password || !formData.designation || !formData.role) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }

    try {
      await employeesAPI.addEmployee(params.storeId!, {
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
        designation: formData.designation,
        role: formData.role,
        salary: formData.salary ? parseFloat(formData.salary) : undefined,
        employeeId: formData.employeeId || undefined
      });

      Alert.alert('Success', 'Employee added successfully');
      setShowAddModal(false);
      resetForm();
      loadEmployees();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to add employee');
    }
  };

  const handleUpdateEmployee = async () => {
    if (!selectedEmployee) return;

    try {
      await employeesAPI.updateEmployee(selectedEmployee.employee.employeeId, {
        name: formData.name || undefined,
        email: formData.email || undefined,
        phoneNumber: formData.phoneNumber || undefined,
        designation: formData.designation || undefined,
        role: formData.role || undefined,
        salary: formData.salary ? parseFloat(formData.salary) : undefined
      });

      Alert.alert('Success', 'Employee updated successfully');
      setShowEditModal(false);
      resetForm();
      loadEmployees();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to update employee');
    }
  };

  const handleRemoveEmployee = async (employee: StoreEmployee) => {
    Alert.alert(
      'Remove Employee',
      `Are you sure you want to remove ${employee.employee.user.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await employeesAPI.removeEmployee(params.storeId!, employee.employee.employeeId);
              Alert.alert('Success', 'Employee removed successfully');
              loadEmployees();
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.error || 'Failed to remove employee');
            }
          }
        }
      ]
    );
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phoneNumber: '',
      password: '',
      designation: '',
      role: '',
      salary: '',
      employeeId: ''
    });
    setSelectedEmployee(null);
  };

  const openEditModal = (employee: StoreEmployee) => {
    setSelectedEmployee(employee);
    setFormData({
      name: employee.employee.user.name,
      email: employee.employee.user.email,
      phoneNumber: employee.employee.user.phoneNumber,
      password: '',
      designation: employee.employee.designation,
      role: employee.role,
      salary: employee.employee.salary?.toString() || '',
      employeeId: employee.employee.employeeId
    });
    setShowEditModal(true);
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  if (!isAuthenticated || user?.userType !== 'OWNER') {
    return null;
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor }}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-8">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
            <View className="flex-1">
              <Text style={{ color: textColor }} className="text-2xl font-bold">
                Employees
              </Text>
              <Text style={{ color: textColor }} className="text-base opacity-70">
                {params.storeName}
              </Text>
            </View>
            <TouchableOpacity
              onPress={openAddModal}
              className="bg-black rounded-full p-3"
            >
              <Plus size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Filters */}
          <Card style={{ marginBottom: 24 }}>
            <Text style={{ color: textColor }} className="text-lg font-semibold mb-4">
              Filters
            </Text>
            <View className="flex-row space-x-3">
              <TouchableOpacity
                onPress={() => setFilters({ ...filters, status: filters.status === 'active' ? '' : 'active' })}
                className={`px-4 py-2 rounded-lg border ${
                  filters.status === 'active' ? 'bg-black border-black' : 'border-gray-300'
                }`}
              >
                <Text className={filters.status === 'active' ? 'text-white' : 'text-black'}>
                  Active
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setFilters({ ...filters, status: filters.status === 'inactive' ? '' : 'inactive' })}
                className={`px-4 py-2 rounded-lg border ${
                  filters.status === 'inactive' ? 'bg-black border-black' : 'border-gray-300'
                }`}
              >
                <Text className={filters.status === 'inactive' ? 'text-white' : 'text-black'}>
                  Inactive
                </Text>
              </TouchableOpacity>
            </View>
          </Card>

          {/* Employees List */}
          {loading ? (
            <Loading />
          ) : employees.length === 0 ? (
            <Card>
              <View className="py-8 items-center">
                <User size={48} color={textColor} style={{ opacity: 0.5 }} />
                <Text style={{ color: textColor }} className="text-lg font-semibold mt-4">
                  No Employees
                </Text>
                <Text style={{ color: textColor }} className="text-base opacity-70 text-center mt-2">
                  Add your first employee to get started
                </Text>
                <Button
                  title="Add Employee"
                  onPress={openAddModal}
                  style={{ marginTop: 16 }}
                />
              </View>
            </Card>
          ) : (
            <View className="space-y-4">
              {employees.map((employee) => (
                <Card key={employee.id}>
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text style={{ color: textColor }} className="text-lg font-semibold">
                        {employee.employee.user.name}
                      </Text>
                      <Text style={{ color: textColor }} className="text-base opacity-70">
                        {employee.employee.designation} • {employee.role}
                      </Text>
                      <Text style={{ color: textColor }} className="text-sm opacity-70">
                        {employee.employee.user.email}
                      </Text>
                      <Text style={{ color: textColor }} className="text-sm opacity-70">
                        ID: {employee.employee.employeeId}
                      </Text>
                      {employee.employee.salary && (
                        <Text style={{ color: textColor }} className="text-sm opacity-70">
                          Salary: ${employee.employee.salary}
                        </Text>
                      )}
                    </View>
                    <View className="flex-row space-x-2">
                      <TouchableOpacity
                        onPress={() => router.push({
                          pathname: '/owner/employee-availability',
                          params: {
                            employeeId: employee.employee.employeeId,
                            storeId: params.storeId,
                            employeeName: employee.employee.user.name
                          }
                        })}
                        className="p-2"
                      >
                        <Calendar size={20} color={textColor} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => router.push({
                          pathname: '/owner/employee-stats',
                          params: {
                            employeeId: employee.employee.employeeId,
                            storeId: params.storeId,
                            employeeName: employee.employee.user.name
                          }
                        })}
                        className="p-2"
                      >
                        <BarChart3 size={20} color={textColor} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => openEditModal(employee)}
                        className="p-2"
                      >
                        <Edit size={20} color={textColor} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleRemoveEmployee(employee)}
                        className="p-2"
                      >
                        <Trash2 size={20} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </Card>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add Employee Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView className="flex-1" style={{ backgroundColor }}>
          <View className="px-6 pt-8">
            <View className="flex-row items-center justify-between mb-6">
              <Text style={{ color: textColor }} className="text-2xl font-bold">
                Add Employee
              </Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Text style={{ color: textColor }} className="text-lg">Cancel</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="space-y-4">
                <Input
                  label="Name *"
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  placeholder="Enter employee name"
                />
                <Input
                  label="Email *"
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                  placeholder="Enter email address"
                  keyboardType="email-address"
                />
                <Input
                  label="Phone Number"
                  value={formData.phoneNumber}
                  onChangeText={(text) => setFormData({ ...formData, phoneNumber: text })}
                  placeholder="Enter phone number"
                  keyboardType="phone-pad"
                />
                <Input
                  label="Password *"
                  value={formData.password}
                  onChangeText={(text) => setFormData({ ...formData, password: text })}
                  placeholder="Enter password"
                  secureTextEntry
                />
                <Input
                  label="Designation *"
                  value={formData.designation}
                  onChangeText={(text) => setFormData({ ...formData, designation: text })}
                  placeholder="e.g., Hair Stylist, Nail Technician"
                />
                <Input
                  label="Role *"
                  value={formData.role}
                  onChangeText={(text) => setFormData({ ...formData, role: text })}
                  placeholder="e.g., Senior Stylist, Junior Technician"
                />
                <Input
                  label="Salary"
                  value={formData.salary}
                  onChangeText={(text) => setFormData({ ...formData, salary: text })}
                  placeholder="Enter salary amount"
                  keyboardType="numeric"
                />
                <Input
                  label="Employee ID"
                  value={formData.employeeId}
                  onChangeText={(text) => setFormData({ ...formData, employeeId: text })}
                  placeholder="Custom employee ID (optional)"
                />

                <Button
                  title="Add Employee"
                  onPress={handleAddEmployee}
                  style={{ marginTop: 16 }}
                />
              </View>
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Edit Employee Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView className="flex-1" style={{ backgroundColor }}>
          <View className="px-6 pt-8">
            <View className="flex-row items-center justify-between mb-6">
              <Text style={{ color: textColor }} className="text-2xl font-bold">
                Edit Employee
              </Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Text style={{ color: textColor }} className="text-lg">Cancel</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="space-y-4">
                <Input
                  label="Name"
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  placeholder="Enter employee name"
                />
                <Input
                  label="Email"
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                  placeholder="Enter email address"
                  keyboardType="email-address"
                />
                <Input
                  label="Phone Number"
                  value={formData.phoneNumber}
                  onChangeText={(text) => setFormData({ ...formData, phoneNumber: text })}
                  placeholder="Enter phone number"
                  keyboardType="phone-pad"
                />
                <Input
                  label="Designation"
                  value={formData.designation}
                  onChangeText={(text) => setFormData({ ...formData, designation: text })}
                  placeholder="e.g., Hair Stylist, Nail Technician"
                />
                <Input
                  label="Role"
                  value={formData.role}
                  onChangeText={(text) => setFormData({ ...formData, role: text })}
                  placeholder="e.g., Senior Stylist, Junior Technician"
                />
                <Input
                  label="Salary"
                  value={formData.salary}
                  onChangeText={(text) => setFormData({ ...formData, salary: text })}
                  placeholder="Enter salary amount"
                  keyboardType="numeric"
                />

                <Button
                  title="Update Employee"
                  onPress={handleUpdateEmployee}
                  style={{ marginTop: 16 }}
                />
              </View>
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
} 
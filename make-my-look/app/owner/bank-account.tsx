import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { router, Stack } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ownersAPI } from '@/services/api';

export default function BankAccountScreen() {
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    accountName: '',
    accountNumber: '',
    ifscCode: '',
    bankName: '',
    branchName: '',
    accountType: '',
    accountHolderName: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [existingBankAccount, setExistingBankAccount] = useState<any>(null);
  const [loadingBankAccount, setLoadingBankAccount] = useState(true);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  React.useEffect(() => {
    if (!isAuthenticated || user?.userType !== 'OWNER') {
      router.replace('/(auth)/welcome');
      return;
    }

    loadExistingBankAccount();
  }, [isAuthenticated, user]);

  const loadExistingBankAccount = async () => {
    try {
      setLoadingBankAccount(true);
      const response = await ownersAPI.getBankAccount();
      if (response.bankAccount) {
        setExistingBankAccount(response.bankAccount);
        setFormData({
          accountName: response.bankAccount.accountName,
          accountNumber: response.bankAccount.accountNumber,
          ifscCode: response.bankAccount.ifscCode,
          bankName: response.bankAccount.bankName,
          branchName: response.bankAccount.branchName,
          accountType: response.bankAccount.accountType,
          accountHolderName: response.bankAccount.accountHolderName,
        });
      }
    } catch (error: any) {
      // Bank account doesn't exist yet, which is fine
      console.log('No existing bank account found');
    } finally {
      setLoadingBankAccount(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.accountName.trim()) {
      newErrors.accountName = 'Account name is required';
    }

    if (!formData.accountNumber.trim()) {
      newErrors.accountNumber = 'Account number is required';
    } else if (!/^\d{9,18}$/.test(formData.accountNumber.trim())) {
      newErrors.accountNumber = 'Account number must be 9-18 digits';
    }

    if (!formData.ifscCode.trim()) {
      newErrors.ifscCode = 'IFSC code is required';
    } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifscCode.trim().toUpperCase())) {
      newErrors.ifscCode = 'Invalid IFSC code format';
    }

    if (!formData.bankName.trim()) {
      newErrors.bankName = 'Bank name is required';
    }

    if (!formData.branchName.trim()) {
      newErrors.branchName = 'Branch name is required';
    }

    if (!formData.accountType.trim()) {
      newErrors.accountType = 'Account type is required';
    }

    if (!formData.accountHolderName.trim()) {
      newErrors.accountHolderName = 'Account holder name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await ownersAPI.createBankAccount({
        accountName: formData.accountName.trim(),
        accountNumber: formData.accountNumber.trim(),
        ifscCode: formData.ifscCode.trim().toUpperCase(),
        bankName: formData.bankName.trim(),
        branchName: formData.branchName.trim(),
        accountType: formData.accountType.trim(),
        accountHolderName: formData.accountHolderName.trim(),
      });

      Alert.alert(
        'Success!',
        existingBankAccount 
          ? 'Bank account has been updated successfully.'
          : 'Bank account has been added successfully.',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to add bank account');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isAuthenticated || user?.userType !== 'OWNER') {
    return null;
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor }}>
      <Stack.Screen 
        options={
          {
            headerShown: false
          }
        }
      />
      <KeyboardAvoidingView 
        className="flex-1" 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-6 pt-8">
            {loadingBankAccount ? (
              <View className="flex-1 items-center justify-center py-20">
                <Text style={{ color: textColor }} className="text-lg">Loading...</Text>
              </View>
            ) : (
              <>
                {/* Header */}
                <View className="mb-8 mt-10">
                  <Text style={{ color: textColor }} className="text-3xl font-bold mb-2">
                    {existingBankAccount ? 'Update Bank Account' : 'Add Bank Account'}
                  </Text>
                  <Text style={{ color: textColor }} className="text-base opacity-70">
                    {existingBankAccount 
                      ? 'Update your bank account details for receiving payments'
                      : 'Add your bank account details for receiving payments'
                    }
                  </Text>
                </View>

            {/* Form */}
            <Card style={{ marginBottom: 24 }}>
              <View className="space-y-4">
                <Input
                  label="Account Name"
                  value={formData.accountName}
                  onChangeText={(value) => updateFormData('accountName', value)}
                  placeholder="Enter account name"
                  error={errors.accountName}
                />

                <Input
                  label="Account Number"
                  value={formData.accountNumber}
                  onChangeText={(value) => updateFormData('accountNumber', value)}
                  placeholder="Enter account number"
                  keyboardType="numeric"
                  error={errors.accountNumber}
                />

                <Input
                  label="IFSC Code"
                  value={formData.ifscCode}
                  onChangeText={(value) => updateFormData('ifscCode', value)}
                  placeholder="Enter IFSC code"
                  autoCapitalize="characters"
                  error={errors.ifscCode}
                />

                <Input
                  label="Bank Name"
                  value={formData.bankName}
                  onChangeText={(value) => updateFormData('bankName', value)}
                  placeholder="Enter bank name"
                  error={errors.bankName}
                />

                <Input
                  label="Branch Name"
                  value={formData.branchName}
                  onChangeText={(value) => updateFormData('branchName', value)}
                  placeholder="Enter branch name"
                  error={errors.branchName}
                />

                <Input
                  label="Account Type"
                  value={formData.accountType}
                  onChangeText={(value) => updateFormData('accountType', value)}
                  placeholder="e.g., Savings, Current"
                  error={errors.accountType}
                />

                <Input
                  label="Account Holder Name"
                  value={formData.accountHolderName}
                  onChangeText={(value) => updateFormData('accountHolderName', value)}
                  placeholder="Enter account holder name"
                  error={errors.accountHolderName}
                />
              </View>
            </Card>

            {/* Submit Button */}
            <Button
              title={existingBankAccount ? "Update Bank Account" : "Add Bank Account"}
              onPress={handleSubmit}
              loading={loading}
              size="large"
              style={{ marginBottom: 24 }}
            />

            {/* Cancel Button */}
            <Button
              title="Cancel"
              onPress={() => router.back()}
              variant="outline"
              size="large"
            />
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
} 
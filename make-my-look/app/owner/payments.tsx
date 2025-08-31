import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { router, Stack } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { ownersAPI } from '@/services/api';
import { PaymentPayout } from '@/types';
import { ArrowLeft, DollarSign, Calendar, User, CheckCircle, Clock } from 'lucide-react-native';

export default function PaymentsScreen() {
  const { user, isAuthenticated } = useAuth();
  const [paymentPayouts, setPaymentPayouts] = useState<PaymentPayout[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalPayouts: 0,
    totalAmount: 0,
    pendingAmount: 0,
    paidAmount: 0
  });

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  useEffect(() => {
    if (!isAuthenticated || user?.userType !== 'OWNER') {
      router.replace('/(auth)/welcome');
      return;
    }

    loadPaymentPayouts();
  }, [isAuthenticated, user]);

  const loadPaymentPayouts = async () => {
    try {
      setLoading(true);
      const response = await ownersAPI.getPaymentPayouts();
      setPaymentPayouts(response.paymentPayouts || []);
      
      // Calculate stats
      const totalAmount = response.paymentPayouts?.reduce((sum: number, payout: PaymentPayout) => sum + payout.amount, 0) || 0;
      const pendingAmount = response.paymentPayouts?.reduce((sum: number, payout: PaymentPayout) => 
        payout.status === 'PENDING' ? sum + payout.amount : sum, 0) || 0;
      const paidAmount = response.paymentPayouts?.reduce((sum: number, payout: PaymentPayout) => 
        payout.status === 'PAIDOUT' ? sum + payout.amount : sum, 0) || 0;

      setStats({
        totalPayouts: response.paymentPayouts?.length || 0,
        totalAmount,
        pendingAmount,
        paidAmount
      });
    } catch (error: any) {
      console.error('Failed to load payment payouts:', error);
      Alert.alert('Error', 'Failed to load payment payouts');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPaymentPayouts();
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAIDOUT':
        return { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle };
      case 'PENDING':
        return { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-700', icon: Clock };
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PAIDOUT':
        return 'Paid Out';
      case 'PENDING':
        return 'Pending';
      default:
        return 'Unknown';
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
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="px-6 pt-8">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-8 mt-10">
            <View className="flex-row items-center">
              <TouchableOpacity 
                onPress={() => router.back()}
                className="mr-4"
              >
                <ArrowLeft size={24} color={textColor} />
              </TouchableOpacity>
              <View>
                <Text style={{ color: textColor }} className="text-3xl font-bold mb-1">
                  Payments
                </Text>
                <Text style={{ color: textColor }} className="text-base opacity-70">
                  View your payment payouts
                </Text>
              </View>
            </View>
          </View>

          {loading ? (
            <Loading text="Loading payment payouts..." />
          ) : (
            <>
              {/* Stats Cards */}
              <View className="grid grid-cols-2 gap-4 mb-8">
                <Card variant="elevated">
                  <View className="flex-row items-center justify-between">
                    <View>
                      <Text style={{ color: textColor }} className="text-2xl font-bold mb-1">
                        {formatAmount(stats.totalAmount)}
                      </Text>
                      <Text style={{ color: textColor }} className="text-sm opacity-70">
                        Total Amount
                      </Text>
                    </View>
                    <View className="w-12 h-12 bg-green-100 rounded-full items-center justify-center">
                      <DollarSign size={24} color="#16a34a" />
                    </View>
                  </View>
                </Card>

                <Card variant="elevated">
                  <View className="flex-row items-center justify-between">
                    <View>
                      <Text style={{ color: textColor }} className="text-2xl font-bold mb-1">
                        {stats.totalPayouts}
                      </Text>
                      <Text style={{ color: textColor }} className="text-sm opacity-70">
                        Total Payouts
                      </Text>
                    </View>
                    <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center">
                      <Calendar size={24} color="#2563eb" />
                    </View>
                  </View>
                </Card>

                <Card variant="elevated">
                  <View className="flex-row items-center justify-between">
                    <View>
                      <Text style={{ color: textColor }} className="text-2xl font-bold mb-1">
                        {formatAmount(stats.pendingAmount)}
                      </Text>
                      <Text style={{ color: textColor }} className="text-sm opacity-70">
                        Pending
                      </Text>
                    </View>
                    <View className="w-12 h-12 bg-yellow-100 rounded-full items-center justify-center">
                      <Clock size={24} color="#ca8a04" />
                    </View>
                  </View>
                </Card>

                <Card variant="elevated">
                  <View className="flex-row items-center justify-between">
                    <View>
                      <Text style={{ color: textColor }} className="text-2xl font-bold mb-1">
                        {formatAmount(stats.paidAmount)}
                      </Text>
                      <Text style={{ color: textColor }} className="text-sm opacity-70">
                        Paid Out
                      </Text>
                    </View>
                    <View className="w-12 h-12 bg-green-100 rounded-full items-center justify-center">
                      <CheckCircle size={24} color="#16a34a" />
                    </View>
                  </View>
                </Card>
              </View>

              {/* Payment Payouts List */}
              <Card style={{ marginBottom: 24 }}>
                <Text style={{ color: textColor }} className="text-xl font-bold mb-4">
                  Payment Payouts
                </Text>

                {paymentPayouts.length === 0 ? (
                  <View className="py-12 items-center">
                    <DollarSign size={48} color={textColor} style={{ opacity: 0.5 }} />
                    <Text style={{ color: textColor }} className="text-lg font-medium mt-4 mb-2">
                      No Payment Payouts
                    </Text>
                    <Text style={{ color: textColor }} className="text-base opacity-70 text-center">
                      You haven't received any payment payouts yet.
                    </Text>
                  </View>
                ) : (
                  <View className="space-y-4">
                    {paymentPayouts.map((payout) => {
                      const statusConfig = getStatusColor(payout.status);
                      const StatusIcon = statusConfig.icon;
                      
                      return (
                        <View 
                          key={payout.id} 
                          className="p-4 border border-gray-200 rounded-lg"
                        >
                          <View className="flex-row justify-between items-start mb-3">
                            <View className="flex-1">
                              <Text style={{ color: textColor }} className="text-lg font-semibold mb-1">
                                {formatAmount(payout.amount)}
                              </Text>
                              <View className="flex-row items-center mb-2">
                                <User size={16} color={textColor} style={{ opacity: 0.7, marginRight: 4 }} />
                                <Text style={{ color: textColor }} className="text-sm opacity-70">
                                  {payout.paidBy.user.name}
                                </Text>
                              </View>
                              <View className="flex-row items-center">
                                <Calendar size={16} color={textColor} style={{ opacity: 0.7, marginRight: 4 }} />
                                <Text style={{ color: textColor }} className="text-sm opacity-70">
                                  {formatDate(payout.createdAt)}
                                </Text>
                              </View>
                            </View>
                            <View className={`px-3 py-1 rounded-full ${statusConfig.bg}`}>
                              <View className="flex-row items-center">
                                <StatusIcon size={14} color={statusConfig.text.replace('text-', '#')} />
                                <Text className={`text-xs font-medium ml-1 ${statusConfig.text}`}>
                                  {getStatusText(payout.status)}
                                </Text>
                              </View>
                            </View>
                          </View>
                          
                          <View className="pt-3 border-t border-gray-100">
                            <Text style={{ color: textColor }} className="text-xs opacity-70">
                              Customer: {payout.paidBy.user.email}
                            </Text>
                            <Text style={{ color: textColor }} className="text-xs opacity-70">
                              Phone: {payout.paidBy.user.phoneNumber}
                            </Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}
              </Card>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 
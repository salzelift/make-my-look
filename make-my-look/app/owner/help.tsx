import React from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { router, Stack } from 'expo-router';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Card } from '@/components/ui/Card';
import { 
  ArrowLeft,
  HelpCircle,
  Store,
  Users,
  Calendar,
  CreditCard,
  Settings,
  BarChart3,
  UserPlus,
  Clock,
  Phone,
  Shield
} from 'lucide-react-native';

export default function OwnerHelpScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  const faqData = [
    {
      id: 1,
      question: "How do I add a new store?",
      answer: "Go to the 'Stores' tab, tap the '+' button, fill in your store details including name, address, services, and operating hours. Make sure to set your availability for bookings.",
      icon: Store
    },
    {
      id: 2,
      question: "How do I manage my employees?",
      answer: "In your store details, tap 'Manage Employees' to add staff members. You can set their roles, schedules, and permissions. Each employee will get their own login credentials.",
      icon: Users
    },
    {
      id: 3,
      question: "How do customers find my salon?",
      answer: "Customers need your unique owner code to connect to your salon. Share this code with your customers, and they can enter it in their profile to see and book your services.",
      icon: UserPlus
    },
    {
      id: 4,
      question: "How do I set my service prices?",
      answer: "In your store settings, go to 'Services' and tap on any service to edit its price, duration, and description. You can also activate/deactivate services as needed.",
      icon: CreditCard
    },
    {
      id: 5,
      question: "How do I manage bookings?",
      answer: "Use the 'Bookings' tab to view all appointments. You can accept, reject, or reschedule bookings. Set your availability in store settings to control when customers can book.",
      icon: Calendar
    },
    {
      id: 6,
      question: "When do I receive payments?",
      answer: "Payments are automatically processed and transferred to your registered bank account. You can view payment details and payout history in the 'Payments' section.",
      icon: BarChart3
    },
    {
      id: 7,
      question: "How do I set my store hours?",
      answer: "In your store settings, go to 'Availability' to set your operating hours for each day of the week. This determines when customers can book appointments.",
      icon: Clock
    },
    {
      id: 8,
      question: "How do I update my bank details?",
      answer: "Go to your profile, select 'Bank Account' to add or update your banking information. This is required to receive payments from bookings.",
      icon: Shield
    },
    {
      id: 9,
      question: "Can I customize my services?",
      answer: "Yes! You can add custom services, set specific prices and durations, and provide detailed descriptions. Go to your store settings and manage the services section.",
      icon: Settings
    },
    {
      id: 10,
      question: "How do I track my business performance?",
      answer: "Use the 'Dashboard' to view your business analytics including total bookings, revenue, customer trends, and employee performance metrics.",
      icon: BarChart3
    }
  ];

  const handleBackPress = () => {
    router.back();
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor }}>
      <Stack.Screen options={
        {
          headerShown: false
        }
      }/>
      <StatusBar barStyle="dark-content" backgroundColor={backgroundColor} />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-100">
        <TouchableOpacity onPress={handleBackPress} className="p-2">
          <ArrowLeft size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={{ color: textColor }} className="text-xl font-bold">
          Help & FAQ
        </Text>
        <View className="w-8" />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-6">
          {/* Welcome Section */}
          <Card variant="elevated" style={{ marginBottom: 24 }}>
            <View className="items-center py-4">
              <View className="w-16 h-16 bg-primary-100 rounded-full items-center justify-center mb-4">
                <HelpCircle size={32} color="#475569" />
              </View>
              <Text style={{ color: textColor }} className="text-2xl font-bold mb-2 text-center">
                Business Owner Guide
              </Text>
              <Text style={{ color: textColor }} className="text-base opacity-70 text-center leading-6">
                Learn how to manage your salon business, handle bookings, and grow your customer base with our platform.
              </Text>
            </View>
          </Card>

          {/* FAQ Section */}
          <Text style={{ color: textColor }} className="text-xl font-bold mb-4">
            Frequently Asked Questions
          </Text>

          {faqData.map((faq) => {
            const IconComponent = faq.icon;
            return (
              <Card key={faq.id} variant="elevated" style={{ marginBottom: 16 }}>
                <View className="flex-row items-start">
                  <View className="w-10 h-10 bg-primary-100 rounded-full items-center justify-center mr-4 mt-1">
                    <IconComponent size={20} color="#475569" />
                  </View>
                  <View className="flex-1">
                    <Text style={{ color: textColor }} className="text-lg font-semibold mb-3">
                      {faq.question}
                    </Text>
                    <Text style={{ color: textColor }} className="text-base opacity-70 leading-6">
                      {faq.answer}
                    </Text>
                  </View>
                </View>
              </Card>
            );
          })}

          {/* Getting Started Tips */}
          <Card variant="elevated" style={{ marginBottom: 24, marginTop: 8 }}>
            <Text style={{ color: textColor }} className="text-xl font-bold mb-4">
              Getting Started Tips
            </Text>
            <View className="space-y-3">
              <View className="flex-row items-start">
                <Text className="text-primary-600 font-bold text-lg mr-3">1.</Text>
                <Text style={{ color: textColor }} className="text-base opacity-70 flex-1 leading-6">
                  Complete your profile and add your bank account details
                </Text>
              </View>
              <View className="flex-row items-start">
                <Text className="text-primary-600 font-bold text-lg mr-3">2.</Text>
                <Text style={{ color: textColor }} className="text-base opacity-70 flex-1 leading-6">
                  Set up your store with accurate address and service information
                </Text>
              </View>
              <View className="flex-row items-start">
                <Text className="text-primary-600 font-bold text-lg mr-3">3.</Text>
                <Text style={{ color: textColor }} className="text-base opacity-70 flex-1 leading-6">
                  Configure your availability and service pricing
                </Text>
              </View>
              <View className="flex-row items-start">
                <Text className="text-primary-600 font-bold text-lg mr-3">4.</Text>
                <Text style={{ color: textColor }} className="text-base opacity-70 flex-1 leading-6">
                  Share your owner code with customers to start receiving bookings
                </Text>
              </View>
            </View>
          </Card>

          {/* Contact Support Section */}
          <Card variant="elevated" style={{ marginBottom: 24 }}>
            <View className="items-center py-6">
              <View className="w-12 h-12 bg-accent-100 rounded-full items-center justify-center mb-4">
                <Phone size={24} color="#F2751A" />
              </View>
              <Text style={{ color: textColor }} className="text-lg font-bold mb-2">
                Need personalized help?
              </Text>
              <Text style={{ color: textColor }} className="text-base opacity-70 text-center mb-4 leading-6">
                Our business support team is ready to help you grow your salon business.
              </Text>
              <TouchableOpacity 
                onPress={() => router.push('/owner/support')}
                className="bg-primary-600 px-6 py-3 rounded-xl"
              >
                <Text className="text-white font-semibold text-base">
                  Contact Business Support
                </Text>
              </TouchableOpacity>
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

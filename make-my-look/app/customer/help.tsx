import React from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { router, Stack } from 'expo-router';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Card } from '@/components/ui/Card';
import { 
  ArrowLeft,
  HelpCircle,
  Calendar,
  CreditCard,
  MapPin,
  User,
  Clock,
  AlertCircle,
  CheckCircle,
  Phone
} from 'lucide-react-native';

export default function CustomerHelpScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  const faqData = [
    {
      id: 1,
      question: "How do I book an appointment?",
      answer: "To book an appointment, go to the home screen, select your preferred salon, choose a service, pick a date and time, and complete the booking with payment.",
      icon: Calendar
    },
    {
      id: 2,
      question: "How do I connect to a salon?",
      answer: "You need an owner code from your salon. Go to your profile, tap 'Change Owner Code', and enter the code provided by your salon owner.",
      icon: User
    },
    {
      id: 3,
      question: "Can I cancel or reschedule my appointment?",
      answer: "Yes, you can cancel or reschedule appointments from the 'My Bookings' section. Please note that cancellation policies may apply depending on timing.",
      icon: Clock
    },
    {
      id: 4,
      question: "What payment methods are accepted?",
      answer: "We accept all major credit/debit cards, UPI, and digital wallets through our secure payment gateway powered by Razorpay.",
      icon: CreditCard
    },
    {
      id: 5,
      question: "How do I find salons near me?",
      answer: "The app automatically shows salons from your connected owner. You can search for specific services or view all available options on the home screen.",
      icon: MapPin
    },
    {
      id: 6,
      question: "What if I have issues with my booking?",
      answer: "If you face any issues with your booking, you can contact the salon directly or reach out to our support team through the 'Contact Support' option.",
      icon: AlertCircle
    },
    {
      id: 7,
      question: "How do I update my profile information?",
      answer: "Go to your profile screen and tap the 'Edit' button next to 'Profile Information' to update your name, phone number, and preferred services.",
      icon: User
    },
    {
      id: 8,
      question: "Are my payments secure?",
      answer: "Yes, all payments are processed through Razorpay, a secure and trusted payment gateway. Your payment information is encrypted and protected.",
      icon: CheckCircle
    }
  ];

  const handleBackPress = () => {
    router.back();
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor }}>
      <StatusBar barStyle="dark-content" backgroundColor={backgroundColor} />

      <Stack.Screen options={
        {
          headerShown: false
        }
      }/>
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
                How can we help you?
              </Text>
              <Text style={{ color: textColor }} className="text-base opacity-70 text-center leading-6">
                Find answers to frequently asked questions and learn how to make the most of your salon booking experience.
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

          {/* Contact Support Section */}
          <Card variant="elevated" style={{ marginBottom: 24, marginTop: 8 }}>
            <View className="items-center py-6">
              <View className="w-12 h-12 bg-accent-100 rounded-full items-center justify-center mb-4">
                <Phone size={24} color="#F2751A" />
              </View>
              <Text style={{ color: textColor }} className="text-lg font-bold mb-2">
                Still need help?
              </Text>
              <Text style={{ color: textColor }} className="text-base opacity-70 text-center mb-4 leading-6">
                Can't find what you're looking for? Our support team is here to help.
              </Text>
              <TouchableOpacity 
                onPress={() => router.push('/customer/support')}
                className="bg-primary-600 px-6 py-3 rounded-xl"
              >
                <Text className="text-white font-semibold text-base">
                  Contact Support
                </Text>
              </TouchableOpacity>
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

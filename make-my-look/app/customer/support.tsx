import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, StatusBar, TextInput, Alert, Linking } from 'react-native';
import { router, Stack } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  ArrowLeft,
  Phone,
  Mail,
  MessageCircle,
  Clock,
  Send,
  ExternalLink  
} from 'lucide-react-native';

export default function CustomerSupportScreen() {
  const { user } = useAuth();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');

  const handleBackPress = () => {
    router.back();
  };

  const handleSendMessage = async () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert('Error', 'Please fill in both subject and message fields.');
      return;
    }

    try {
      setLoading(true);
      
      // Simulate API call - in real implementation, this would send to your support system
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Message Sent!',
        'Your support request has been submitted. We\'ll get back to you within 24 hours.',
        [
          {
            text: 'OK',
            onPress: () => {
              setSubject('');
              setMessage('');
              router.back();
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneCall = () => {
    const phoneNumber = '+1-800-SALON-HELP'; // Replace with actual support number
    Linking.openURL(`tel:${phoneNumber.replace(/[^\d+]/g, '')}`);
  };

  const handleEmailSupport = () => {
    const email = 'support@makemylook.com';
    const subject = 'Support Request from Mobile App';
    const body = `Hi Support Team,\n\nI need help with:\n\n[Please describe your issue here]\n\nUser Details:\nName: ${user?.name}\nEmail: ${user?.email}\nPhone: ${user?.phoneNumber}\n\nThank you!`;
    
    Linking.openURL(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
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
          Contact Support
        </Text>
        <View className="w-8" />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-6">
          {/* Welcome Section */}
          <Card variant="elevated" style={{ marginBottom: 24 }}>
            <View className="items-center py-4">
              <View className="w-16 h-16 bg-accent-100 rounded-full items-center justify-center mb-4">
                <MessageCircle size={32} color="#F2751A" />
              </View>
              <Text style={{ color: textColor }} className="text-2xl font-bold mb-2 text-center">
                We're here to help!
              </Text>
              <Text style={{ color: textColor }} className="text-base opacity-70 text-center leading-6">
                Get in touch with our support team. We typically respond within 24 hours.
              </Text>
            </View>
          </Card>

          {/* Quick Contact Options */}
          <Text style={{ color: textColor }} className="text-xl font-bold mb-4">
            Quick Contact
          </Text>

          <View className="flex-row space-x-3 mb-6">
            <TouchableOpacity 
              onPress={handlePhoneCall}
              className="flex-1 bg-green-50 p-4 rounded-xl border border-green-200"
            >
              <View className="items-center">
                <Phone size={24} color="#22C55E" />
                <Text className="text-green-700 font-semibold mt-2 text-center">
                  Call Us
                </Text>
                <Text className="text-green-600 text-sm mt-1 text-center">
                  Instant help
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={handleEmailSupport}
              className="flex-1 bg-blue-50 p-4 rounded-xl border border-blue-200"
            >
              <View className="items-center">
                <Mail size={24} color="#3B82F6" />
                <Text className="text-blue-700 font-semibold mt-2 text-center">
                  Email Us
                </Text>
                <Text className="text-blue-600 text-sm mt-1 text-center">
                  Detailed support
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Support Hours */}
          <Card variant="outlined" style={{ marginBottom: 24 }}>
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-primary-100 rounded-full items-center justify-center mr-4">
                <Clock size={20} color="#475569" />
              </View>
              <View className="flex-1">
                <Text style={{ color: textColor }} className="text-lg font-semibold mb-1">
                  Support Hours
                </Text>
                <Text style={{ color: textColor }} className="text-base opacity-70">
                  Monday - Friday: 9:00 AM - 6:00 PM
                </Text>
                <Text style={{ color: textColor }} className="text-base opacity-70">
                  Saturday - Sunday: 10:00 AM - 4:00 PM
                </Text>
              </View>
            </View>
          </Card>

          {/* Message Form */}
          <Card variant="elevated" style={{ marginBottom: 24 }}>
            <Text style={{ color: textColor }} className="text-xl font-bold mb-4">
              Send us a message
            </Text>

            <View className="mb-4">
              <Text style={{ color: textColor }} className="text-base font-medium mb-2">
                Subject *
              </Text>
              <TextInput
                value={subject}
                onChangeText={setSubject}
                placeholder="What do you need help with?"
                placeholderTextColor={`${textColor}80`}
                style={{ 
                  color: textColor, 
                  borderColor: borderColor,
                  backgroundColor: `${backgroundColor}F0`
                }}
                className="border rounded-xl px-4 py-3 text-base"
                editable={!loading}
              />
            </View>

            <View className="mb-6">
              <Text style={{ color: textColor }} className="text-base font-medium mb-2">
                Message *
              </Text>
              <TextInput
                value={message}
                onChangeText={setMessage}
                placeholder="Please describe your issue in detail..."
                placeholderTextColor={`${textColor}80`}
                style={{ 
                  color: textColor, 
                  borderColor: borderColor,
                  backgroundColor: `${backgroundColor}F0`,
                  height: 120,
                  textAlignVertical: 'top'
                }}
                className="border rounded-xl px-4 py-3 text-base"
                multiline
                numberOfLines={5}
                editable={!loading}
              />
            </View>

            <Button
              title="Send Message"
              onPress={handleSendMessage}
              loading={loading}
              icon={<Send size={16} color="white" />}
              size="large"
            />
          </Card>

          {/* Additional Resources */}
          <Card variant="outlined" style={{ marginBottom: 24 }}>
            <Text style={{ color: textColor }} className="text-lg font-semibold mb-3">
              Before contacting support
            </Text>
            <Text style={{ color: textColor }} className="text-base opacity-70 mb-3 leading-6">
              • Check our Help & FAQ section for quick answers
            </Text>
            <Text style={{ color: textColor }} className="text-base opacity-70 mb-3 leading-6">
              • Try restarting the app if you're experiencing technical issues
            </Text>
            <Text style={{ color: textColor }} className="text-base opacity-70 leading-6">
              • Have your booking details ready when contacting about appointments
            </Text>
            
            <TouchableOpacity 
              onPress={() => router.push('/customer/help')}
              className="flex-row items-center mt-4 pt-4 border-t border-gray-200"
            >
              <Text style={{ color: textColor }} className="text-base font-medium mr-2">
                Visit Help & FAQ
              </Text>
              <ExternalLink size={16} color={textColor} />
            </TouchableOpacity>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

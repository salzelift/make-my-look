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
  ExternalLink,
  Briefcase,
  TrendingUp,
  Users
} from 'lucide-react-native';

export default function OwnerSupportScreen() {
  const { user } = useAuth();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('normal');
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
      
      // Simulate API call - in real implementation, this would send to your business support system
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const responseTime = priority === 'urgent' ? '4 hours' : priority === 'high' ? '12 hours' : '24 hours';
      
      Alert.alert(
        'Support Request Submitted!',
        `Your business support request has been submitted with ${priority} priority. We'll get back to you within ${responseTime}.`,
        [
          {
            text: 'OK',
            onPress: () => {
              setSubject('');
              setMessage('');
              setPriority('normal');
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
    const phoneNumber = '+1-800-BUSINESS'; // Replace with actual business support number
    Linking.openURL(`tel:${phoneNumber.replace(/[^\d+]/g, '')}`);
  };

  const handleEmailSupport = () => {
    const email = 'business@makemylook.com';
    const subject = 'Business Support Request';
    const body = `Hi Business Support Team,\n\nI need assistance with:\n\n[Please describe your business issue here]\n\nBusiness Owner Details:\nName: ${user?.name}\nEmail: ${user?.email}\nPhone: ${user?.phoneNumber}\n\nThank you!`;
    
    Linking.openURL(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const priorityOptions = [
    { value: 'normal', label: 'Normal', description: '24h response', color: 'bg-gray-100 border-gray-200' },
    { value: 'high', label: 'High', description: '12h response', color: 'bg-yellow-100 border-yellow-200' },
    { value: 'urgent', label: 'Urgent', description: '4h response', color: 'bg-red-100 border-red-200' }
  ];

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
          Business Support
        </Text>
        <View className="w-8" />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-6">
          {/* Welcome Section */}
          <Card variant="elevated" style={{ marginBottom: 24 }}>
            <View className="items-center py-4">
              <View className="w-16 h-16 bg-accent-100 rounded-full items-center justify-center mb-4">
                <Briefcase size={32} color="#F2751A" />
              </View>
              <Text style={{ color: textColor }} className="text-2xl font-bold mb-2 text-center">
                Business Support
              </Text>
              <Text style={{ color: textColor }} className="text-base opacity-70 text-center leading-6">
                Dedicated support for salon owners. Get help with business operations, technical issues, and growth strategies.
              </Text>
            </View>
          </Card>

          {/* Quick Contact Options */}
          <Text style={{ color: textColor }} className="text-xl font-bold mb-4">
            Priority Support
          </Text>

          <View className="flex-row space-x-3 mb-6">
            <TouchableOpacity 
              onPress={handlePhoneCall}
              className="flex-1 bg-green-50 p-4 rounded-xl border border-green-200"
            >
              <View className="items-center">
                <Phone size={24} color="#22C55E" />
                <Text className="text-green-700 font-semibold mt-2 text-center">
                  Call Business Line
                </Text>
                <Text className="text-green-600 text-sm mt-1 text-center">
                  Immediate help
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
                  Email Business Team
                </Text>
                <Text className="text-blue-600 text-sm mt-1 text-center">
                  Detailed support
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Support Categories */}
          <Card variant="outlined" style={{ marginBottom: 24 }}>
            <Text style={{ color: textColor }} className="text-lg font-semibold mb-4">
              We can help you with:
            </Text>
            <View className="space-y-3">
              <View className="flex-row items-center">
                <TrendingUp size={16} color="#22C55E" />
                <Text style={{ color: textColor }} className="text-base ml-3 opacity-70">
                  Business growth and marketing strategies
                </Text>
              </View>
              <View className="flex-row items-center">
                <Users size={16} color="#3B82F6" />
                <Text style={{ color: textColor }} className="text-base ml-3 opacity-70">
                  Staff management and training
                </Text>
              </View>
              <View className="flex-row items-center">
                <MessageCircle size={16} color="#F2751A" />
                <Text style={{ color: textColor }} className="text-base ml-3 opacity-70">
                  Technical issues and app features
                </Text>
              </View>
              <View className="flex-row items-center">
                <Briefcase size={16} color="#8B5CF6" />
                <Text style={{ color: textColor }} className="text-base ml-3 opacity-70">
                  Payment processing and financial queries
                </Text>
              </View>
            </View>
          </Card>

          {/* Support Hours */}
          <Card variant="outlined" style={{ marginBottom: 24 }}>
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-primary-100 rounded-full items-center justify-center mr-4">
                <Clock size={20} color="#475569" />
              </View>
              <View className="flex-1">
                <Text style={{ color: textColor }} className="text-lg font-semibold mb-1">
                  Business Support Hours
                </Text>
                <Text style={{ color: textColor }} className="text-base opacity-70">
                  Monday - Friday: 8:00 AM - 8:00 PM
                </Text>
                <Text style={{ color: textColor }} className="text-base opacity-70">
                  Saturday - Sunday: 10:00 AM - 6:00 PM
                </Text>
              </View>
            </View>
          </Card>

          {/* Message Form */}
          <Card variant="elevated" style={{ marginBottom: 24 }}>
            <Text style={{ color: textColor }} className="text-xl font-bold mb-4">
              Submit a support request
            </Text>

            {/* Priority Selection */}
            <View className="mb-4">
              <Text style={{ color: textColor }} className="text-base font-medium mb-3">
                Priority Level
              </Text>
              <View className="space-y-2">
                {priorityOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => setPriority(option.value)}
                    className={`p-3 rounded-xl border ${option.color} ${priority === option.value ? 'ring-2 ring-primary-500' : ''}`}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center">
                        <View className={`w-4 h-4 rounded-full border-2 mr-3 ${priority === option.value ? 'bg-primary-500 border-primary-500' : 'border-gray-300'}`} />
                        <Text style={{ color: textColor }} className="font-medium">
                          {option.label}
                        </Text>
                      </View>
                      <Text style={{ color: textColor }} className="text-sm opacity-70">
                        {option.description}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

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
                placeholder="Please provide details about your business needs or technical issues..."
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
              title="Submit Request"
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
              • Check our Business Help & FAQ for quick solutions
            </Text>
            <Text style={{ color: textColor }} className="text-base opacity-70 mb-3 leading-6">
              • Ensure your app is updated to the latest version
            </Text>
            <Text style={{ color: textColor }} className="text-base opacity-70 leading-6">
              • Have your store details and error messages ready
            </Text>
            
            <TouchableOpacity 
              onPress={() => router.push('/owner/help')}
              className="flex-row items-center mt-4 pt-4 border-t border-gray-200"
            >
              <Text style={{ color: textColor }} className="text-base font-medium mr-2">
                Visit Business Help & FAQ
              </Text>
              <ExternalLink size={16} color={textColor} />
            </TouchableOpacity>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

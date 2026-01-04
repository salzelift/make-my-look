import React, { useState } from 'react';
import { Modal as RNModal, View, Text, TouchableOpacity, ViewStyle, ActivityIndicator, TextInput } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

interface InputModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  placeholder?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: (value: string) => void;
  onCancel?: () => void;
  type?: 'default' | 'warning' | 'success' | 'error';
  style?: ViewStyle;
  loading?: boolean;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  maxLength?: number;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}

export const InputModal: React.FC<InputModalProps> = ({
  visible,
  onClose,
  title,
  message,
  placeholder = '',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  type = 'default',
  style,
  loading = false,
  keyboardType = 'default',
  maxLength,
  autoCapitalize = 'none',
}) => {
  const [inputValue, setInputValue] = useState('');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');

  const getTypeStyles = () => {
    switch (type) {
      case 'warning':
        return {
          icon: '⚠️',
          confirmButton: 'bg-yellow-500',
          confirmText: 'text-white',
        };
      case 'success':
        return {
          icon: '✅',
          confirmButton: 'bg-green-500',
          confirmText: 'text-white',
        };
      case 'error':
        return {
          icon: '❌',
          confirmButton: 'bg-red-500',
          confirmText: 'text-white',
        };
      default:
        return {
          icon: '🔑',
          confirmButton: 'bg-primary-600',
          confirmText: 'text-white',
        };
    }
  };

  const typeStyles = getTypeStyles();

  const handleCancel = () => {
    setInputValue('');
    if (onCancel) {
      onCancel();
    }
    onClose();
  };

  const handleConfirm = () => {
    onConfirm(inputValue);
    setInputValue('');
    onClose();
  };

  const handleClose = () => {
    setInputValue('');
    onClose();
  };

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View className="flex-1 justify-center items-center bg-black bg-opacity-50 px-6">
        <View 
          className="bg-white rounded-2xl p-6 w-full max-w-sm"
          style={[{ backgroundColor }, style]}
        >
          {/* Icon */}
          <View className="items-center mb-4">
            <Text className="text-4xl">{typeStyles.icon}</Text>
          </View>

          {/* Title */}
          <Text 
            style={{ color: textColor }} 
            className="text-xl font-bold text-center mb-2"
          >
            {title}
          </Text>

          {/* Message */}
          <Text 
            style={{ color: textColor }} 
            className="text-base text-center opacity-70 mb-6 leading-6"
          >
            {message}
          </Text>

          {/* Input */}
          <View className="mb-6">
            <TextInput
              value={inputValue}
              onChangeText={setInputValue}
              placeholder={placeholder}
              placeholderTextColor={`${textColor}80`}
              style={{ 
                color: textColor, 
                borderColor: borderColor,
                backgroundColor: `${backgroundColor}F0`
              }}
              className="border rounded-xl px-4 py-3 text-base"
              keyboardType={keyboardType}
              maxLength={maxLength}
              autoCapitalize={autoCapitalize}
              autoCorrect={false}
              editable={!loading}
            />
          </View>

          {/* Buttons */}
          <View className="flex-row space-x-3">
            <TouchableOpacity
              onPress={handleCancel}
              className="flex-1 py-3 px-4 rounded-xl border"
              style={{ borderColor }}
              disabled={loading}
            >
              <Text 
                style={{ color: textColor, opacity: loading ? 0.5 : 1 }} 
                className="text-center font-semibold"
              >
                {cancelText}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleConfirm}
              className={`flex-1 py-3 px-4 rounded-xl ${typeStyles.confirmButton}`}
              disabled={loading || !inputValue.trim()}
              style={{ opacity: loading || !inputValue.trim() ? 0.5 : 1 }}
            >
              {loading ? (
                <View className="flex-row items-center justify-center">
                  <ActivityIndicator size="small" color="white" style={{ marginRight: 8 }} />
                  <Text className={`text-center font-semibold ${typeStyles.confirmText}`}>
                    Processing...
                  </Text>
                </View>
              ) : (
                <Text className={`text-center font-semibold ${typeStyles.confirmText}`}>
                  {confirmText}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </RNModal>
  );
};

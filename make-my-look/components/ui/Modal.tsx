import React from 'react';
import { Modal as RNModal, View, Text, TouchableOpacity, ViewStyle, ActivityIndicator } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  type?: 'default' | 'warning' | 'success' | 'error';
  style?: ViewStyle;
  loading?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  type = 'default',
  style,
  loading = false,
}) => {
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
          icon: '❓',
          confirmButton: 'bg-black',
          confirmText: 'text-white',
        };
    }
  };

  const typeStyles = getTypeStyles();

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onClose();
  };

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
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
              disabled={loading}
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
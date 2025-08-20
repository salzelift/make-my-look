import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

interface LoadingProps {
  message?: string;
  size?: 'small' | 'large';
}

export const Loading: React.FC<LoadingProps> = ({ 
  message = 'Loading...', 
  size = 'large' 
}) => {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  return (
    <View 
      className="flex-1 items-center justify-center px-6" 
      style={{ backgroundColor }}
    >
      <ActivityIndicator size={size} color={textColor} />
      {message && (
        <Text 
          style={{ color: textColor }} 
          className="text-base opacity-70 mt-4 text-center"
        >
          {message}
        </Text>
      )}
    </View>
  );
};
import React from 'react';
import { View, Text, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

interface LoadingProps {
  size?: 'small' | 'large';
  text?: string;
  message?: string;
  variant?: 'default' | 'overlay' | 'inline';
  style?: ViewStyle;
}

export const Loading: React.FC<LoadingProps> = ({
  size = 'large',
  text,
  message,
  variant = 'default',
  style,
}) => {
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');

  const getContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      alignItems: 'center',
      justifyContent: 'center',
    };

    const variantStyles: Record<string, ViewStyle> = {
      default: {
        flex: 1,
        padding: 20,
      },
      overlay: {
        position: 'absolute' as const,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        zIndex: 1000,
      },
      inline: {
        padding: 16,
      },
    };

    return {
      ...baseStyle,
      ...variantStyles[variant],
    };
  };

  const getTextStyle = (): TextStyle => ({
    marginTop: 12,
    fontSize: 14,
    color: textColor,
    fontWeight: '500',
    textAlign: 'center',
    opacity: 0.7,
  });

  return (
    <View style={[getContainerStyle(), style]}>
      <ActivityIndicator
        size={size}
        color={textColor}
      />
      {(text || message) && (
        <Text style={getTextStyle()}>
          {message || text}
        </Text>
      )}
    </View>
  );
};
import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
  shadow?: boolean;
  variant?: 'default' | 'elevated' | 'outlined' | 'gradient';
  borderRadius?: number;
  backgroundColor?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  padding = 20,
  shadow = true,
  variant = 'default',
  borderRadius = 16,
  backgroundColor,
}) => {
  const themeBackgroundColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');

  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius,
      padding,
      overflow: 'hidden',
    };

    const variantStyles = {
      default: {
        backgroundColor: backgroundColor || themeBackgroundColor,
        borderWidth: 1,
        borderColor,
        ...(shadow && {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 4,
        }),
      },
      elevated: {
        backgroundColor: backgroundColor || themeBackgroundColor,
        borderWidth: 0,
        ...(shadow && {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.12,
          shadowRadius: 20,
          elevation: 8,
        }),
      },
      outlined: {
        backgroundColor: backgroundColor || themeBackgroundColor,
        borderWidth: 2,
        borderColor: textColor,
        shadowOpacity: 0,
        elevation: 0,
      },
      gradient: {
        backgroundColor: backgroundColor || '#667eea',
        borderWidth: 0,
        ...(shadow && {
          shadowColor: '#667eea',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.2,
          shadowRadius: 16,
          elevation: 6,
        }),
      },
    };

    return {
      ...baseStyle,
      ...variantStyles[variant],
    };
  };

  return (
    <View style={[getCardStyle(), style]}>
      {children}
    </View>
  );
};
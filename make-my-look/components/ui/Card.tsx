import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
  shadow?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  padding = 16,
  shadow = true,
}) => {
  const backgroundColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');

  const getCardStyle = (): ViewStyle => ({
    backgroundColor,
    borderRadius: 12,
    borderWidth: 1,
    borderColor,
    padding,
    ...(shadow && {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    }),
  });

  return (
    <View style={[getCardStyle(), style]}>
      {children}
    </View>
  );
};
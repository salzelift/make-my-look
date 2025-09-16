import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle, TextStyle, Animated } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient';
  size?: 'small' | 'medium' | 'large' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
  iconPosition = 'left',
}) => {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    };

    // Size styles
    const sizeStyles = {
      small: { 
        paddingVertical: 10, 
        paddingHorizontal: 20,
        minHeight: 40,
      },
      medium: { 
        paddingVertical: 14, 
        paddingHorizontal: 28,
        minHeight: 48,
      },
      large: { 
        paddingVertical: 18, 
        paddingHorizontal: 36,
        minHeight: 56,
      },
      xl: { 
        paddingVertical: 22, 
        paddingHorizontal: 44,
        minHeight: 64,
      },
    };

    // Variant styles
    const variantStyles = {
      primary: {
        backgroundColor: textColor,
        borderWidth: 0,
        shadowColor: textColor,
      },
      secondary: {
        backgroundColor: backgroundColor,
        borderWidth: 1,
        borderColor: borderColor,
        shadowColor: '#000',
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: textColor,
        shadowColor: '#000',
      },
      ghost: {
        backgroundColor: 'transparent',
        borderWidth: 0,
        shadowOpacity: 0,
        elevation: 0,
      },
      gradient: {
        backgroundColor: '#667eea',
        borderWidth: 0,
        shadowColor: '#667eea',
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      opacity: disabled || loading ? 0.6 : 1,
    };
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontWeight: '600',
      textAlign: 'center',
      letterSpacing: 0.5,
      backgroundColor: 'transparent', // Ensure no background color
    };

    // Size styles
    const sizeStyles = {
      small: { fontSize: 14 },
      medium: { fontSize: 16 },
      large: { fontSize: 18 },
      xl: { fontSize: 20 },
    };

    // Variant styles
    const variantStyles = {
      primary: { color: backgroundColor },
      secondary: { color: textColor },
      outline: { color: textColor },
      ghost: { color: textColor },
      gradient: { color: '#FFFFFF' },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
    };
  };

  const getIconStyle = (): TextStyle => ({
    marginRight: iconPosition === 'left' ? 8 : 0,
    marginLeft: iconPosition === 'right' ? 8 : 0,
    backgroundColor: 'transparent', // Ensure no background color for icons
  });

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading && (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' || variant === 'gradient' ? backgroundColor : textColor}
          style={{ marginRight: 8 }}
        />
      )}
      
      {!loading && icon && iconPosition === 'left' && (
        <Text style={getIconStyle()}>{icon}</Text>
      )}
      
      <Text style={[getTextStyle(), textStyle]}>
        {title}
      </Text>
      
      {!loading && icon && iconPosition === 'right' && (
        <Text style={getIconStyle()}>{icon}</Text>
      )}
    </TouchableOpacity>
  );
};
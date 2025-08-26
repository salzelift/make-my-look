import React, { useState } from 'react';
import { View, TextInput, Text, TextInputProps, ViewStyle, TextStyle } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  variant?: 'default' | 'filled' | 'outlined';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  inputStyle,
  labelStyle,
  variant = 'default',
  leftIcon,
  rightIcon,
  helperText,
  ...textInputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);
  
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'inputBackground');
  const borderColor = useThemeColor({}, 'border');
  const placeholderColor = useThemeColor({}, 'placeholder');

  const getInputContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 56,
      paddingHorizontal: 16,
      borderWidth: 2,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 1,
    };

    const variantStyles = {
      default: {
        backgroundColor: backgroundColor,
        borderColor: error ? '#EF4444' : isFocused ? textColor : borderColor,
      },
      filled: {
        backgroundColor: error ? '#FEF2F2' : isFocused ? '#F8FAFC' : backgroundColor,
        borderColor: error ? '#EF4444' : isFocused ? textColor : 'transparent',
      },
      outlined: {
        backgroundColor: 'transparent',
        borderColor: error ? '#EF4444' : isFocused ? textColor : borderColor,
      },
    };

    return {
      ...baseStyle,
      ...variantStyles[variant],
    };
  };

  const getInputStyle = (): TextStyle => ({
    fontSize: 16,
    color: textColor,
    flex: 1,
    paddingVertical: 16,
    fontWeight: '500',
  });

  const getLabelStyle = (): TextStyle => ({
    fontSize: 14,
    fontWeight: '600',
    color: textColor,
    marginBottom: 8,
    letterSpacing: 0.5,
  });

  const getErrorStyle = (): TextStyle => ({
    fontSize: 12,
    color: '#EF4444',
    marginTop: 6,
    fontWeight: '500',
  });

  const getHelperStyle = (): TextStyle => ({
    fontSize: 12,
    color: placeholderColor,
    marginTop: 6,
    fontWeight: '400',
  });

  const getIconStyle = (): ViewStyle => ({
    marginRight: leftIcon ? 12 : 0,
    marginLeft: rightIcon ? 12 : 0,
  });

  return (
    <View style={containerStyle}>
      {label && (
        <Text style={[getLabelStyle(), labelStyle]}>
          {label}
        </Text>
      )}
      
      <View style={getInputContainerStyle()}>
        {leftIcon && (
          <View style={getIconStyle()}>
            {leftIcon}
          </View>
        )}
        
        <TextInput
          style={[getInputStyle(), inputStyle]}
          placeholderTextColor={placeholderColor}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...textInputProps}
        />
        
        {rightIcon && (
          <View style={getIconStyle()}>
            {rightIcon}
          </View>
        )}
      </View>
      
      {error && (
        <Text style={getErrorStyle()}>
          {error}
        </Text>
      )}
      
      {helperText && !error && (
        <Text style={getHelperStyle()}>
          {helperText}
        </Text>
      )}
    </View>
  );
};
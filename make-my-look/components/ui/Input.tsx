import React, { useState } from 'react';
import { View, TextInput, Text, TextInputProps, ViewStyle, TextStyle } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  inputStyle,
  labelStyle,
  ...textInputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);
  
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'inputBackground');
  const borderColor = useThemeColor({}, 'border');
  const placeholderColor = useThemeColor({}, 'placeholder');

  const getInputContainerStyle = (): ViewStyle => ({
    borderWidth: 1,
    borderColor: error ? '#EF4444' : isFocused ? textColor : borderColor,
    borderRadius: 8,
    backgroundColor,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 48,
  });

  const getInputStyle = (): TextStyle => ({
    fontSize: 16,
    color: textColor,
    flex: 1,
  });

  const getLabelStyle = (): TextStyle => ({
    fontSize: 14,
    fontWeight: '600',
    color: textColor,
    marginBottom: 8,
  });

  const getErrorStyle = (): TextStyle => ({
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  });

  return (
    <View style={containerStyle}>
      {label && (
        <Text style={[getLabelStyle(), labelStyle]}>
          {label}
        </Text>
      )}
      <View style={getInputContainerStyle()}>
        <TextInput
          style={[getInputStyle(), inputStyle]}
          placeholderTextColor={placeholderColor}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...textInputProps}
        />
      </View>
      {error && (
        <Text style={getErrorStyle()}>
          {error}
        </Text>
      )}
    </View>
  );
};
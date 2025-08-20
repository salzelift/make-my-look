/**
 * Premium black and white color scheme for the salon booking app
 * Designed for elegance and sophistication
 */

const primaryBlack = '#000000';
const primaryWhite = '#FFFFFF';
const softGray = '#F5F5F5';
const darkGray = '#333333';
const lightGray = '#E5E5E5';
const mediumGray = '#888888';

export const Colors = {
  light: {
    text: primaryBlack,
    background: primaryWhite,
    tint: primaryBlack,
    icon: darkGray,
    tabIconDefault: mediumGray,
    tabIconSelected: primaryBlack,
    card: primaryWhite,
    border: lightGray,
    inputBackground: softGray,
    placeholder: mediumGray,
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
  },
  dark: {
    text: primaryWhite,
    background: primaryBlack,
    tint: primaryWhite,
    icon: lightGray,
    tabIconDefault: mediumGray,
    tabIconSelected: primaryWhite,
    card: darkGray,
    border: '#444444',
    inputBackground: darkGray,
    placeholder: mediumGray,
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
  },
};

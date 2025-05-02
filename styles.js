import { Dimensions } from 'react-native';

// Screen dimensions
const { height, width } = Dimensions.get('window');

// Define colors to be used globally
const COLORS = {
  PRIMARY: '#1E88E5',  // Blue for primary actions
  SECONDARY: '#FF7043', // Orange for secondary actions
  ACCENT: '#8E24AA',  // Purple for accents
  BACKGROUND: '#F5F5F5', // Background color
  TEXT: '#212121', // Default text color
  LIGHT_TEXT: '#757575', // Light text color for less emphasized text
  BORDER: '#E0E0E0', // Border color for inputs or cards
};

export { COLORS, height, width };

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline';
  style?: ViewStyle;
}

export default function Button({ title, onPress, variant = 'primary', style }: ButtonProps) {
  return (
    <TouchableOpacity 
      style={[styles.button, variant === 'outline' ? styles.outlineButton : styles.primaryButton, style]}
      onPress={onPress}
    >
      <Text style={[styles.text, variant === 'outline' ? styles.outlineText : styles.primaryText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  primaryButton: {
    backgroundColor: '#ff6347',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ff6347',
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  primaryText: {
    color: '#fff',
  },
  outlineText: {
    color: '#ff6347',
  },
});

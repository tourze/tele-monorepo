import React from 'react';
import { noop } from 'lodash';
import {StyleSheet, View, Text, TextInput} from 'react-native';

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '500',
    color: '#0A0D14',
    marginLeft: 20,
    marginBottom: 6,
  },
  body: {
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
  },
  input: {
    backgroundColor: '#F1F3F9',
    height: 44,
    borderRadius: 12,
    paddingLeft: 20,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
});

function InputItem({
  label = '',
  placeholder = '',
  onChangeText = noop,
  value = '',
  backgroundColor = '#F1F3F9',
  secureTextEntry = false,
  rightIcon = null,
  inputStyle = {},
}: {
  label: string;
  placeholder?: string;
  onChangeText?: (text: string) => void;
  value: string;
  backgroundColor?: string;
  secureTextEntry?: boolean;
  rightIcon?: React.ReactElement | null;
  inputStyle?: any;
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.body}>
        <TextInput
          style={[styles.input, {backgroundColor: backgroundColor}, inputStyle]}
          onChangeText={onChangeText}
          value={value}
          placeholder={placeholder}
          autoCapitalize="none"
          placeholderTextColor="#9198A6"
          secureTextEntry={secureTextEntry}
        />
        {React.isValidElement(rightIcon) && rightIcon}
      </View>
    </View>
  );
}

export default InputItem;

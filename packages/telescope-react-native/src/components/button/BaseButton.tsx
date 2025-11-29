import React, { memo } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  Platform,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { noop } from 'lodash';

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 56,
    borderRadius: 56,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  container__disable: {
    opacity: 0.8,
  },

  container__medium: {
    height: 48,
  },
  container__small: {
    height: 44,
  },

  title: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  title__medium: {
    fontSize: 15,
    fontWeight: 'normal',
  },
  title__small: {
    fontSize: 15,
    fontWeight: 'normal',
  },
});

function BaseButton({
  title,
  onClick = noop,
  size = 'normal',
  icon = null,
  mainColor = '#3567ff',
  textColor = '#fff',
  disabled = false,
  style,
  testID,
}: {
  title: string;
  size?: 'normal' | 'medium' | 'small' | 'large';
  onClick?: () => void;
  icon?: null | React.ReactElement;
  mainColor?: string;
  textColor?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: mainColor,
          shadowColor: mainColor,
        },
        disabled && styles.container__disable,
        size === 'medium' && styles.container__medium,
        size === 'small' && styles.container__small,
        style,
      ]}
      touchSoundDisabled={disabled}
      activeOpacity={disabled ? 1 : 0.7}
      onPress={() => {
        if (disabled) {
          return;
        }
        onClick();
      }}
      disabled={disabled}
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
    >
      {React.isValidElement(icon) && icon}
      <Text
        style={[
          styles.title,
          {
            color: textColor,
          },
          size === 'medium' && styles.title__medium,
          size === 'small' && styles.title__small,
        ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

export default memo(BaseButton);

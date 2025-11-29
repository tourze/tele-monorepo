import React, { memo } from 'react';
import {
  Pressable,
  View,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
  GestureResponderEvent,
} from 'react-native';
import { noop } from 'lodash';

type ListItemProps = {
  title: string;
  description?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onClick?: (event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  disabled?: boolean;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 72,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
  },
  body: {
    flex: 1,
    flexDirection: 'column',
    paddingLeft: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#0A0D14',
  },
  description: {
    fontSize: 12,
    fontWeight: 'normal',
    color: '#4A4D57',
  },
  disabled: {
    opacity: 0.5,
  },
});

const ListItem = memo<ListItemProps>(
  ({
    title,
    description,
    leftIcon = null,
    rightIcon = null,
    onClick = noop,
    style,
    testID,
    disabled = false,
  }) => {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        style={[styles.container, disabled && styles.disabled, style]}
        onPress={disabled ? undefined : onClick}
        testID={testID}
      >
        {React.isValidElement(leftIcon) ? leftIcon : null}
        <View style={styles.body}>
          <Text style={styles.title}>{title}</Text>
          {description ? (
            <Text style={styles.description}>{description}</Text>
          ) : null}
        </View>
        {React.isValidElement(rightIcon) ? rightIcon : null}
      </Pressable>
    );
  },
);

export default ListItem;

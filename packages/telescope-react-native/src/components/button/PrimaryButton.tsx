import { noop } from 'lodash';
import React, { memo } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import BaseButton from './BaseButton';

type PrimaryButtonProps = {
  title: string;
  size?: 'normal' | 'medium' | 'small' | 'large';
  onClick?: () => void;
  icon?: null | React.ReactElement;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

const PrimaryButton = ({
  title,
  onClick = noop,
  size = 'normal',
  icon = null,
  disabled = false,
  style,
  testID,
}: PrimaryButtonProps) => {
  return (
    <BaseButton
      title={title}
      size={size}
      onClick={onClick}
      icon={icon}
      mainColor="#3567ff"
      textColor="#fff"
      disabled={disabled}
      style={style}
      testID={testID}
    />
  );
};

export default memo(PrimaryButton);

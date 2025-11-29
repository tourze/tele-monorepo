import { noop } from 'lodash';
import React from 'react';
import BaseButton from './BaseButton';

function SecondaryButton({
  title,
  onClick = noop,
  size = 'normal',
  icon = null,
  disabled = false,
}: {
  title: string;
  size?: 'normal' | 'medium' | 'small' | 'large';
  onClick?: () => void;
  icon?: null | React.ReactElement;
  disabled?: boolean;
}) {
  return (
    <BaseButton
      title={title}
      size={size}
      onClick={onClick}
      icon={icon}
      mainColor="#fff"
      textColor="#0A0D14"
      disabled={disabled}
    />
  );
}

export default SecondaryButton;

/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import React from 'react';
import {
  StyleProp,
  StyleSheet,
  View,
  ViewProps,
  ViewStyle,
} from 'react-native';
import { StyleType } from '../../theme';

export type PopoverIndicatorProps = ViewProps;
export type PopoverIndicatorElement = React.ReactElement<PopoverIndicatorProps>;

export class PopoverIndicator extends React.Component<PopoverIndicatorProps> {

  private getComponentStyle = (source: StyleProp<ViewStyle>): StyleType => {
    const flatStyle: ViewStyle = StyleSheet.flatten(source);

    return {
      container: {
        borderLeftWidth: flatStyle.width,
        borderRightWidth: flatStyle.width,
        borderBottomWidth: flatStyle.height,
        borderBottomColor: flatStyle.backgroundColor,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        backgroundColor: 'transparent',
      },
    };
  };

  public render(): React.ReactElement<ViewProps> {
    const { style, ...props } = this.props;
    const evaStyle = this.getComponentStyle(style);

    return (
      <View
        {...props}
        style={[style, styles.container, evaStyle.container]}
      />
    );
  }
}

const styles = StyleSheet.create({
  container: {},
});

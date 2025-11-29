import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useInterval } from 'ahooks';

type Props = {
  interval: number;
  customStyle?: StyleProp<ViewStyle>;
  animationDuration?: number;
  delayBetween?: number;
  defaultStyle?: boolean;
  forceRoll?: boolean;
  children: any;
};

const RollingBar: React.FC<Props> = (props) => {
  // 使用 useRef 来保持 Animated.Value 的引用不变
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;

  const [visibleIndex, setVisibleIndex] = useState(0);

  const {
    children,
    interval = 3000,
    customStyle,
    animationDuration = 600,
    delayBetween = 100,
    defaultStyle = false,
    forceRoll = false,
  } = props;

  const childrenCount = React.Children.count(children);

  // 使用 useRef 来存储动画队列，以便在组件卸载时停止
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  const animate = useCallback(() => {
    const defaultConfig = {
      duration: animationDuration / 2,
      useNativeDriver: true,
      isInteraction: false,
    };

    // 停止之前的动画
    if (animationRef.current) {
      animationRef.current.stop();
    }

    if (childrenCount > 1 || forceRoll) {
      animationRef.current = Animated.sequence([
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: 20,
            ...defaultConfig,
            duration: 0,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            ...defaultConfig,
            duration: 0,
          }),
        ]),

        Animated.parallel([
          Animated.timing(translateY, {
            toValue: 0,
            ...defaultConfig,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            ...defaultConfig,
          }),
        ]),

        Animated.delay(interval),

        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -10,
            ...defaultConfig,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            ...defaultConfig,
          }),
        ]),
      ]);
      animationRef.current.start();
    } else {
      animationRef.current = Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          ...defaultConfig,
          duration: 0,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          ...defaultConfig,
          duration: 0,
        }),
      ]);
      animationRef.current.start();
    }
  }, [animationDuration, childrenCount, forceRoll, interval, opacity, translateY]);

  useEffect(() => {
    animate();

    // 清理函数，停止动画
    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
      }
    };
  }, [animate]);

  useInterval(() => {
    if (childrenCount > 1 || forceRoll) {
      setVisibleIndex((prevIndex) => (prevIndex + 1) % childrenCount);
      animate();
    }
  }, interval + animationDuration + delayBetween);

  return (
    <View
      style={[
        defaultStyle ? styles.container : styles.containerMinimal,
        customStyle,
      ]}
    >
      <Animated.View
        style={{
          opacity,
          transform: [{ translateY }, { perspective: 1000 }],
        }}
      >
        {React.Children.map(children, (child, idx) => {
          return (
            <View key={`${idx}`} style={visibleIndex !== idx && styles.hideRow}>
              {child}
            </View>
          );
        })}
      </Animated.View>
    </View>
  );
};

export default RollingBar;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#eaeaea',
    borderColor: '#bbb',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  containerMinimal: {
    flex: 1,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  hideRow: { display: 'none' },
});

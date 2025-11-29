import { Animated } from "react-native";
import { useState, useEffect } from "react";

const useBounceAnimation = () => {
  const [bounceValue] = useState(new Animated.Value(1));

  const bounceAnimation = (
    value: number,
    velocity: number,
    bounciness: number,
  ) => {
    // Clear previous animations before starting a new one (if needed)
    Animated.spring(bounceValue, {
      toValue: value,
      velocity,
      bounciness,
      useNativeDriver: true,
    }).start();
  };

  const syntheticBounceAnimation = (
    bounceEffectIn: number,
    bounceEffectOut: number,
    bounceVelocityOut: number,
    bouncinessOut: number,
  ) => {
    Animated.sequence([
      Animated.timing(bounceValue, {
        toValue: bounceEffectIn,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.spring(bounceValue, {
        toValue: bounceEffectOut,
        velocity: bounceVelocityOut,
        bounciness: bouncinessOut,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Cleanup function when component unmounts
  useEffect(() => {
    return () => {
      // This will cancel any running animations when the component unmounts
      bounceValue.stopAnimation();
    };
  }, [bounceValue]);

  return {
    bounceValue,
    bounceAnimation,
    syntheticBounceAnimation,
  };
};

export default useBounceAnimation;

import React, { useRef } from 'react';
import {
  Animated,
  GestureResponderEvent,
  StyleProp,
  ViewStyle,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const RainBornAnimatedTouchable: React.FC<TouchableOpacityProps> = props => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const onPressIn = (event: GestureResponderEvent) => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 35,
      bounciness: 0,
    }).start();
    props.onPressIn?.(event);
  };

  const onPressOut = (event: GestureResponderEvent) => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 0,
    }).start();
    props.onPressOut?.(event);
  };

  const styleWithPressAnim: StyleProp<ViewStyle> = [
    props.style as StyleProp<ViewStyle>,
    { transform: [{ scale: scaleAnim }] },
  ];

  return (
    <AnimatedTouchableOpacity
      {...props}
      style={styleWithPressAnim}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
    />
  );
};

export default RainBornAnimatedTouchable;
